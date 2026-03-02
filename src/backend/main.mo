import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type TaskDefinition = {
    id : Nat;
    name : Text;
    category : Text;
    duration : ?Nat;
    coinReward : Nat;
  };

  type UserProfile = {
    totalCoins : Nat;
    level : Nat;
    currentStreak : Nat;
    lastActiveDate : Text;
    bestStreak : Nat;
    badges : [Text];
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Nat.compare(p1.totalCoins, p2.totalCoins);
    };
  };

  type DailyRoutineTrackerBackend = {
    var taskIdCounter : Nat;
    profiles : Map.Map<Principal, UserProfile>;
    taskDefs : Map.Map<Principal, Map.Map<Nat, TaskDefinition>>;
    taskCompletions : Map.Map<Principal, Map.Map<Text, Set.Set<Nat>>>;
    customCategories : Map.Map<Principal, Set.Set<Text>>;
  };

  var state : ?DailyRoutineTrackerBackend = null;

  func getState() : DailyRoutineTrackerBackend {
    switch (state) {
      case (null) { Runtime.trap("DailyRoutineTracker actor has not been initialized") };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func initialize() : async () {
    switch (state) {
      case (?_) {};
      case (null) {
        state := ?{
          var taskIdCounter = 0;
          profiles = Map.empty<Principal, UserProfile>();
          taskDefs = Map.empty<Principal, Map.Map<Nat, TaskDefinition>>();
          taskCompletions = Map.empty<Principal, Map.Map<Text, Set.Set<Nat>>>();
          customCategories = Map.empty<Principal, Set.Set<Text>>();
        };
      };
    };
  };

  func ensureProfile(caller : Principal) : UserProfile {
    let state = getState();
    switch (state.profiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        let newProfile : UserProfile = {
          totalCoins = 0;
          level = 1;
          currentStreak = 0;
          lastActiveDate = "";
          bestStreak = 0;
          badges = [];
        };
        state.profiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    let state = getState();
    state.profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    let state = getState();
    state.profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let state = getState();
    state.profiles.add(caller, profile);
  };

  public shared ({ caller }) func createTaskDefinition(name : Text, category : Text, duration : ?Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    let state = getState();
    ignore ensureProfile(caller);

    let taskId = state.taskIdCounter;
    let newTask : TaskDefinition = {
      id = taskId;
      name;
      category;
      duration;
      coinReward = 10;
    };

    let userTasks = switch (state.taskDefs.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, TaskDefinition>();
        state.taskDefs.add(caller, newMap);
        newMap;
      };
      case (?tasks) { tasks };
    };
    userTasks.add(taskId, newTask);
    state.taskIdCounter += 1;
    taskId;
  };

  public shared ({ caller }) func updateTaskDefinition(taskId : Nat, name : Text, category : Text, duration : ?Nat, coinReward : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    let state = getState();

    let tasks = switch (state.taskDefs.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?tasks) { tasks };
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found or not owned by caller") };
      case (?_) {
        let updatedTask : TaskDefinition = {
          id = taskId;
          name;
          category;
          duration;
          coinReward;
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTaskDefinition(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    let state = getState();

    let tasks = switch (state.taskDefs.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?tasks) { tasks };
    };

    if (tasks.get(taskId) == null) {
      Runtime.trap("Task not found or not owned by caller");
    };

    tasks.remove(taskId);
  };

  func awardBadge(caller : Principal, badgeId : Text) : () {
    let state = getState();
    switch (state.profiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let badges = Set.fromArray(profile.badges, );
        if (not badges.contains(badgeId)) {
          badges.add(badgeId);
          let updatedProfile : UserProfile = {
            totalCoins = profile.totalCoins;
            level = profile.level;
            currentStreak = profile.currentStreak;
            lastActiveDate = profile.lastActiveDate;
            bestStreak = profile.bestStreak;
            badges = badges.toArray();
          };
          state.profiles.add(caller, updatedProfile);
        };
      };
    };
  };

  func updateStreak(caller : Principal, date : Text) : Nat {
    let state = getState();
    let profile = switch (state.profiles.get(caller)) {
      case (null) { ensureProfile(caller) };
      case (?p) { p };
    };

    let newStreak = if (profile.lastActiveDate == date) {
      profile.currentStreak;
    } else if (isYesterday(profile.lastActiveDate, date)) {
      profile.currentStreak + 1;
    } else {
      1;
    };

    let newBestStreak = if (newStreak > profile.bestStreak) { newStreak } else { profile.bestStreak };

    let updatedProfile : UserProfile = {
      totalCoins = profile.totalCoins;
      level = profile.level;
      currentStreak = newStreak;
      lastActiveDate = date;
      bestStreak = newBestStreak;
      badges = profile.badges;
    };
    state.profiles.add(caller, updatedProfile);

    if (newStreak == 7) {
      awardCoins(caller, 50);
      awardBadge(caller, "streak_7");
    };
    if (newStreak == 30) {
      awardCoins(caller, 200);
      awardBadge(caller, "streak_30");
    };

    newStreak;
  };

  func isYesterday(lastDate : Text, currentDate : Text) : Bool {
    // Simple implementation - in production, use proper date parsing
    lastDate != "" and lastDate != currentDate;
  };

  func awardCoins(caller : Principal, coins : Nat) : () {
    let state = getState();
    switch (state.profiles.get(caller)) {
      case (null) { ignore ensureProfile(caller) };
      case (?profile) {
        let newTotalCoins = profile.totalCoins + coins;
        let newLevel = Nat.min((newTotalCoins / 100) + 1, 50);

        let updatedProfile : UserProfile = {
          totalCoins = newTotalCoins;
          level = newLevel;
          currentStreak = profile.currentStreak;
          lastActiveDate = profile.lastActiveDate;
          bestStreak = profile.bestStreak;
          badges = profile.badges;
        };
        state.profiles.add(caller, updatedProfile);

        if (newLevel >= 5) { awardBadge(caller, "level_5") };
        if (newLevel >= 10) { awardBadge(caller, "level_10") };
        if (newLevel >= 20) { awardBadge(caller, "level_20") };
      };
    };
  };

  func checkPerfectDay(caller : Principal, date : Text) : Bool {
    let state = getState();

    let allTasks = switch (state.taskDefs.get(caller)) {
      case (null) { return false };
      case (?tasks) { tasks.values().toArray() };
    };

    if (allTasks.size() == 0) { return false };

    let completedTasks = switch (state.taskCompletions.get(caller)) {
      case (null) { return false };
      case (?dateCompletions) {
        switch (dateCompletions.get(date)) {
          case (null) { return false };
          case (?tasks) { tasks };
        };
      };
    };

    for (task in allTasks.vals()) {
      if (not completedTasks.contains(task.id)) {
        return false;
      };
    };

    true;
  };

  public shared ({ caller }) func markTaskComplete(taskId : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks complete");
    };
    let state = getState();
    ignore ensureProfile(caller);

    let tasks = switch (state.taskDefs.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?tasks) { tasks };
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found or not owned by caller") };
      case (?t) { t };
    };

    let completions = state.taskCompletions.get(caller);
    let dateCompletions = switch (completions) {
      case (null) {
        let newDateCompletions = Map.empty<Text, Set.Set<Nat>>();
        state.taskCompletions.add(caller, newDateCompletions);
        newDateCompletions;
      };
      case (?dateCompletions) { dateCompletions };
    };

    let dayTasks = switch (dateCompletions.get(date)) {
      case (null) {
        let newSet = Set.empty<Nat>();
        dateCompletions.add(date, newSet);
        newSet;
      };
      case (?tasks) { tasks };
    };

    if (dayTasks.contains(taskId)) {
      return;
    };

    dayTasks.add(taskId);

    awardCoins(caller, task.coinReward);
    ignore updateStreak(caller, date);

    let profile = switch (state.profiles.get(caller)) {
      case (null) { ensureProfile(caller) };
      case (?p) { p };
    };

    let badges = Set.fromArray(profile.badges, );
    if (not badges.contains("first_task")) {
      awardBadge(caller, "first_task");
    };

    if (checkPerfectDay(caller, date)) {
      awardCoins(caller, 25);
      awardBadge(caller, "perfect_day");
    };
  };

  public query ({ caller }) func getTaskDefinitions() : async [TaskDefinition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    let state = getState();
    switch (state.taskDefs.get(caller)) {
      case (null) { [] };
      case (?tasks) { tasks.values().toArray() };
    };
  };

  public query ({ caller }) func getTodayTasks(todayDate : Text) : async [(TaskDefinition, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    let state = getState();

    let allTasks = switch (state.taskDefs.get(caller)) {
      case (null) { [] };
      case (?tasks) { tasks.values().toArray() };
    };

    let completedSet = switch (state.taskCompletions.get(caller)) {
      case (null) { Set.empty<Nat>() };
      case (?dateCompletions) {
        switch (dateCompletions.get(todayDate)) {
          case (null) { Set.empty<Nat>() };
          case (?tasks) { tasks };
        };
      };
    };

    allTasks.map<TaskDefinition, (TaskDefinition, Bool)>(
      func(task) { (task, completedSet.contains(task.id)) }
    );
  };

  public query ({ caller }) func getCompletedTasksForDate(date : Text) : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view completions");
    };
    let state = getState();
    switch (state.taskCompletions.get(caller)) {
      case (null) { [] };
      case (?dateCompletions) {
        switch (dateCompletions.get(date)) {
          case (null) { [] };
          case (?tasks) { tasks.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getWeeklyStats(dates : [Text]) : async [(Text, Nat, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };
    let state = getState();

    let totalTasks = switch (state.taskDefs.get(caller)) {
      case (null) { 0 };
      case (?tasks) { tasks.size() };
    };

    dates.map<Text, (Text, Nat, Nat)>(
      func(date) {
        let completed = switch (state.taskCompletions.get(caller)) {
          case (null) { 0 };
          case (?dateCompletions) {
            switch (dateCompletions.get(date)) {
              case (null) { 0 };
              case (?tasks) { tasks.size() };
            };
          };
        };
        (date, completed, totalTasks);
      }
    );
  };

  public query ({ caller }) func getMonthlyStats(dates : [Text]) : async [(Text, Nat, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };
    let state = getState();

    let totalTasks = switch (state.taskDefs.get(caller)) {
      case (null) { 0 };
      case (?tasks) { tasks.size() };
    };

    dates.map<Text, (Text, Nat, Nat)>(
      func(date) {
        let completed = switch (state.taskCompletions.get(caller)) {
          case (null) { 0 };
          case (?dateCompletions) {
            switch (dateCompletions.get(date)) {
              case (null) { 0 };
              case (?tasks) { tasks.size() };
            };
          };
        };
        (date, completed, totalTasks);
      }
    );
  };

  public query ({ caller }) func getAllTimeStats() : async {
    totalTasksCompleted : Nat;
    bestStreak : Nat;
    totalCoins : Nat;
    currentLevel : Nat;
    currentStreak : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };
    let state = getState();

    let profile = switch (state.profiles.get(caller)) {
      case (null) { ensureProfile(caller) };
      case (?p) { p };
    };

    let totalCompleted = switch (state.taskCompletions.get(caller)) {
      case (null) { 0 };
      case (?dateCompletions) {
        var count = 0;
        for ((_, tasks) in dateCompletions.entries()) {
          count += tasks.size();
        };
        count;
      };
    };

    {
      totalTasksCompleted = totalCompleted;
      bestStreak = profile.bestStreak;
      totalCoins = profile.totalCoins;
      currentLevel = profile.level;
      currentStreak = profile.currentStreak;
    };
  };

  public shared ({ caller }) func addCustomCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add categories");
    };
    let state = getState();

    let categories = switch (state.customCategories.get(caller)) {
      case (null) {
        let newSet = Set.empty<Text>();
        state.customCategories.add(caller, newSet);
        newSet;
      };
      case (?categories) { categories };
    };
    categories.add(name);
  };

  public shared ({ caller }) func removeCustomCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove categories");
    };
    let state = getState();

    switch (state.customCategories.get(caller)) {
      case (null) {};
      case (?categories) { categories.remove(name) };
    };
  };

  public query ({ caller }) func getCustomCategories() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };
    let state = getState();
    switch (state.customCategories.get(caller)) {
      case (null) { [] };
      case (?categories) { categories.toArray() };
    };
  };

  public query func getRandomQuote() : async Text {
    let quotes = [
      "Believe you can and you're halfway there.",
      "Success is the sum of small efforts repeated daily.",
      "Every day is a fresh start.",
      "Consistency is the key to achievement.",
      "The journey of a thousand miles begins with a single step.",
      "Stay positive, work hard, make it happen.",
      "Small habits make big changes.",
      "Your only limit is your mind.",
      "Progress, not perfection.",
      "Dream big, start small, act now.",
    ];
    let now = Time.now();
    let index = Int.abs(now) % quotes.size();
    quotes[Int.abs(index)];
  };
};
