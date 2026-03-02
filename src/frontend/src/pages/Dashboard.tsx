import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Coins,
  Flame,
  MoreVertical,
  Pencil,
  Plus,
  Quote,
  Trash2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { TaskDefinition } from "../backend.d";
import CategoryIcon from "../components/CategoryIcon";
import { CoinOverlay, useCoinAnimation } from "../components/CoinAnimation";
import DeleteTaskDialog from "../components/DeleteTaskDialog";
import TaskModal from "../components/TaskModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  TODAY,
  useCreateTask,
  useDeleteTask,
  useMarkTaskComplete,
  useRandomQuote,
  useTodayTasks,
  useUpdateTask,
  useUserProfile,
} from "../hooks/useQueries";

const LEVEL_COINS = (level: number) => level * 100;

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: todayTasks, isLoading: tasksLoading } = useTodayTasks();
  const { data: quote } = useRandomQuote();
  const markComplete = useMarkTaskComplete();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { particles, trigger: triggerCoin } = useCoinAnimation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskDefinition | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<
    TaskDefinition | undefined
  >();
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  // Derive a friendly short name from the principal:
  // split by "-", take the first segment, capitalize the first letter
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortId = principal
    ? (() => {
        const seg = principal.split("-")[0] ?? principal.slice(0, 5);
        return seg.charAt(0).toUpperCase() + seg.slice(1);
      })()
    : "Adventurer";

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completed = todayTasks?.filter(([, done]) => done).length ?? 0;
  const total = todayTasks?.length ?? 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const level = Number(profile?.level ?? 1n);
  const totalCoins = Number(profile?.totalCoins ?? 0n);
  const streak = Number(profile?.currentStreak ?? 0n);
  const levelProgress = totalCoins % LEVEL_COINS(level);
  const levelTarget = LEVEL_COINS(level);
  const levelPct =
    levelTarget > 0 ? Math.min((levelProgress / levelTarget) * 100, 100) : 0;

  const taskRefs = useRef<Map<string, HTMLElement>>(new Map());

  const handleCheckTask = async (
    taskDef: TaskDefinition,
    completed: boolean,
  ) => {
    if (completed) return;
    const idStr = String(taskDef.id);
    setCompletingIds((prev) => new Set(prev).add(idStr));
    try {
      await markComplete.mutateAsync({ taskId: taskDef.id, date: TODAY });
      const el = taskRefs.current.get(idStr);
      triggerCoin(Number(taskDef.coinReward), el?.getBoundingClientRect());
      toast.success(`+${Number(taskDef.coinReward)} coins earned! 🪙`);
    } catch {
      toast.error("Failed to mark task complete");
    } finally {
      setCompletingIds((prev) => {
        const n = new Set(prev);
        n.delete(idStr);
        return n;
      });
    }
  };

  const handleSaveTask = async (data: {
    name: string;
    category: string;
    duration: bigint | null;
    coinReward: bigint;
  }) => {
    try {
      if (editTask) {
        await updateTask.mutateAsync({ taskId: editTask.id, ...data });
        toast.success("Task updated!");
      } else {
        await createTask.mutateAsync(data);
        toast.success("Task added!");
      }
      setAddModalOpen(false);
      setEditTask(undefined);
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget.id);
      toast.success("Task deleted");
      setDeleteTarget(undefined);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const isLoading = profileLoading || tasksLoading;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-8 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {todayDate}
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Hey, {shortId} 👋
          </h1>
          {isLoading ? (
            <Skeleton className="h-4 w-40 mt-1 rounded-full" />
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              {completed === total && total > 0
                ? "🎉 All tasks done today!"
                : `${completed} of ${total} tasks completed`}
            </p>
          )}
        </motion.div>

        {/* Level progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Level {level}
            </span>
            <span className="text-xs font-medium gold-text">
              {levelProgress} / {levelTarget} XP
            </span>
          </div>
          <Progress
            value={levelPct}
            className="h-2 rounded-full [&>div]:gold-gradient [&>div]:rounded-full"
          />
        </motion.div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {isLoading ? (
            (["coins", "streak", "level"] as const).map((k) => (
              <Skeleton key={k} className="h-20 rounded-2xl" />
            ))
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard
                  label="Coins"
                  value={totalCoins.toLocaleString()}
                  icon={<Coins className="w-4 h-4" />}
                  color="gold"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <StatCard
                  label="Streak"
                  value={`${streak}🔥`}
                  icon={<Flame className="w-4 h-4" />}
                  color="orange"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatCard
                  label="Level"
                  value={`${level}`}
                  icon={<Zap className="w-4 h-4" />}
                  color="blue"
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Quote card */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl border-gold/20 bg-gradient-to-br from-gold/5 to-gold/10">
              <CardContent className="p-4">
                <div className="flex gap-3 items-start">
                  <Quote className="w-4 h-4 gold-text mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground italic leading-relaxed">
                    {quote}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Daily progress */}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    Today's Progress
                  </span>
                  <span className="text-sm font-bold gold-text">
                    {progress}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-3 rounded-full [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-500"
                  style={
                    {
                      "--progress-bar":
                        progress >= 100
                          ? "linear-gradient(90deg, oklch(0.72 0.18 145), oklch(0.78 0.18 72))"
                          : "linear-gradient(90deg, oklch(0.78 0.18 72), oklch(0.90 0.16 72))",
                    } as React.CSSProperties
                  }
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {completed} completed
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {total - completed} remaining
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Task list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base text-foreground">
              Today's Tasks
            </h2>
            <Button
              data-ocid="dashboard.add_task_button"
              onClick={() => {
                setEditTask(undefined);
                setAddModalOpen(true);
              }}
              size="sm"
              className="h-8 px-3 rounded-xl gold-gradient text-primary-foreground border-0 hover:shadow-gold-sm text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {(["t1", "t2", "t3"] as const).map((k) => (
                <Skeleton key={k} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : todayTasks && todayTasks.length > 0 ? (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {todayTasks.map(([task, done], index) => {
                  const idStr = String(task.id);
                  const isCompleting = completingIds.has(idStr);
                  return (
                    <motion.div
                      key={idStr}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        data-ocid={`task.item.${index + 1}`}
                        ref={(el) => {
                          if (el) taskRefs.current.set(idStr, el);
                        }}
                        className={cn(
                          "rounded-2xl transition-all duration-300",
                          done ? "opacity-60" : "hover:shadow-card-md",
                          isCompleting && "scale-[1.01]",
                        )}
                      >
                        <CardContent className="p-3.5 flex items-center gap-3">
                          <Checkbox
                            data-ocid={`task.checkbox.${index + 1}`}
                            checked={done}
                            onCheckedChange={() => handleCheckTask(task, done)}
                            disabled={done || isCompleting}
                            className={cn(
                              "w-5 h-5 rounded-full shrink-0 transition-all",
                              done &&
                                "border-gold data-[state=checked]:bg-gold",
                            )}
                          />

                          <CategoryIcon category={task.category} size="sm" />

                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium leading-tight truncate",
                                done && "line-through text-muted-foreground",
                              )}
                            >
                              {task.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {task.category}
                              </span>
                              {task.duration && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    ·
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-4 px-1.5 py-0 rounded-full"
                                  >
                                    {Number(task.duration)}m
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-bold gold-text flex items-center gap-0.5">
                              <span>🪙</span>
                              {Number(task.coinReward)}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  data-ocid={`task.edit_button.${index + 1}`}
                                  onClick={() => {
                                    setEditTask(task);
                                    setAddModalOpen(true);
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  data-ocid={`task.delete_button.${index + 1}`}
                                  onClick={() => setDeleteTarget(task)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card
              data-ocid="task.empty_state"
              className="rounded-2xl border-dashed"
            >
              <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    No tasks yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add your first daily task to start earning coins!
                  </p>
                </div>
                <Button
                  data-ocid="dashboard.add_task_button"
                  onClick={() => setAddModalOpen(true)}
                  size="sm"
                  className="mt-1 rounded-xl gold-gradient text-primary-foreground border-0"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground py-6">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-gold transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </p>

      {/* Modals */}
      <TaskModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditTask(undefined);
        }}
        onSave={handleSaveTask}
        editTask={editTask}
        isSaving={createTask.isPending || updateTask.isPending}
      />

      <DeleteTaskDialog
        open={!!deleteTarget}
        taskName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={deleteTask.isPending}
      />

      <CoinOverlay particles={particles} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "gold" | "orange" | "blue";
}) {
  const colorMap = {
    gold: "from-gold/15 to-gold/5 border-gold/20 text-gold",
    orange:
      "from-orange-500/15 to-orange-500/5 border-orange-500/20 text-orange-500",
    blue: "from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-500",
  };

  return (
    <Card
      className={cn("rounded-2xl bg-gradient-to-br border", colorMap[color])}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        <div className={cn("flex items-center gap-1", colorMap[color])}>
          {icon}
          <span className="text-[10px] font-medium uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="font-display font-bold text-xl text-foreground leading-none">
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
