import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TaskDefinition {
    id: bigint;
    duration?: bigint;
    name: string;
    coinReward: bigint;
    category: string;
}
export interface UserProfile {
    badges: Array<string>;
    totalCoins: bigint;
    lastActiveDate: string;
    level: bigint;
    bestStreak: bigint;
    currentStreak: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomCategory(name: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTaskDefinition(name: string, category: string, duration: bigint | null): Promise<bigint>;
    deleteTaskDefinition(taskId: bigint): Promise<void>;
    getAllTimeStats(): Promise<{
        totalCoins: bigint;
        bestStreak: bigint;
        currentLevel: bigint;
        totalTasksCompleted: bigint;
        currentStreak: bigint;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTasksForDate(date: string): Promise<Array<bigint>>;
    getCustomCategories(): Promise<Array<string>>;
    getMonthlyStats(dates: Array<string>): Promise<Array<[string, bigint, bigint]>>;
    getRandomQuote(): Promise<string>;
    getTaskDefinitions(): Promise<Array<TaskDefinition>>;
    getTodayTasks(todayDate: string): Promise<Array<[TaskDefinition, boolean]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyStats(dates: Array<string>): Promise<Array<[string, bigint, bigint]>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markTaskComplete(taskId: bigint, date: string): Promise<void>;
    removeCustomCategory(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTaskDefinition(taskId: bigint, name: string, category: string, duration: bigint | null, coinReward: bigint): Promise<void>;
}
