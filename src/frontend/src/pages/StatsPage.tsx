import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckCircle2, Coins, Flame, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAllTimeStats,
  useMonthlyStats,
  useWeeklyStats,
} from "../hooks/useQueries";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

interface ChartDataPoint {
  label: string;
  tasks: number;
  coins: number;
}

export default function StatsPage() {
  const { data: allTime, isLoading: statsLoading } = useAllTimeStats();
  const { data: weeklyRaw, isLoading: weeklyLoading } = useWeeklyStats();
  const { data: monthlyRaw, isLoading: monthlyLoading } = useMonthlyStats();

  const weeklyData: ChartDataPoint[] = (weeklyRaw ?? []).map(
    ([date, tasks, coins]) => ({
      label: getDayLabel(date),
      tasks: Number(tasks),
      coins: Number(coins),
    }),
  );

  // Group monthly by week for cleaner display (last 4 weeks)
  const monthlyData: ChartDataPoint[] = (monthlyRaw ?? []).map(
    ([date, tasks, coins]) => ({
      label: formatDate(date),
      tasks: Number(tasks),
      coins: Number(coins),
    }),
  );

  // Use every 3rd point for monthly to avoid clutter
  const monthlyDisplay = monthlyData.filter(
    (_, i) => i % 3 === 0 || i === monthlyData.length - 1,
  );

  const GOLD = "oklch(0.82 0.20 72)";
  const GOLD_DIM = "oklch(0.82 0.20 72 / 0.35)";

  return (
    <div data-ocid="stats.page" className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-8 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Performance
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Statistics
          </h1>
        </motion.div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statsLoading ? (
            (["coins", "streak", "level", "tasks"] as const).map((k) => (
              <Skeleton key={k} className="h-24 rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard
                icon={<Coins className="w-5 h-5" />}
                label="Total Coins"
                value={Number(allTime?.totalCoins ?? 0).toLocaleString()}
                color="gold"
                delay={0}
              />
              <StatCard
                icon={<Flame className="w-5 h-5" />}
                label="Best Streak"
                value={`${Number(allTime?.bestStreak ?? 0)} days`}
                color="orange"
                delay={0.05}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Current Level"
                value={`Level ${Number(allTime?.currentLevel ?? 1)}`}
                color="blue"
                delay={0.1}
              />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                label="Tasks Done"
                value={Number(
                  allTime?.totalTasksCompleted ?? 0,
                ).toLocaleString()}
                color="green"
                delay={0.15}
              />
            </>
          )}
        </div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl" data-ocid="stats.weekly_chart">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="font-display text-base font-semibold">
                Weekly Progress
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tasks completed per day
              </p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {weeklyLoading ? (
                <Skeleton className="h-40 rounded-xl" />
              ) : weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.5 0 0 / 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "oklch(0.58 0.015 260)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.58 0.015 260)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: "12px",
                        fontSize: 12,
                        padding: "8px 12px",
                      }}
                      cursor={{ fill: "oklch(0.78 0.18 72 / 0.05)", radius: 6 }}
                      formatter={(val) => [`${val} tasks`, "Completed"]}
                    />
                    <Bar dataKey="tasks" radius={[6, 6, 2, 2]} maxBarSize={32}>
                      {weeklyData.map((entry) => (
                        <Cell
                          key={`weekly-${entry.label}`}
                          fill={entry.tasks > 0 ? GOLD : GOLD_DIM}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl" data-ocid="stats.monthly_chart">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="font-display text-base font-semibold">
                Monthly Overview
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tasks completed over 30 days
              </p>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {monthlyLoading ? (
                <Skeleton className="h-40 rounded-xl" />
              ) : monthlyDisplay.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={monthlyDisplay}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.5 0 0 / 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "oklch(0.58 0.015 260)" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.58 0.015 260)" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: "12px",
                        fontSize: 12,
                        padding: "8px 12px",
                      }}
                      cursor={{ fill: "oklch(0.78 0.18 72 / 0.05)", radius: 6 }}
                      formatter={(val) => [`${val} tasks`, "Completed"]}
                    />
                    <Bar dataKey="tasks" radius={[4, 4, 1, 1]} maxBarSize={24}>
                      {monthlyDisplay.map((entry) => (
                        <Cell
                          key={`monthly-${entry.label}`}
                          fill={entry.tasks > 0 ? GOLD : GOLD_DIM}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </motion.div>
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
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "gold" | "orange" | "blue" | "green";
  delay: number;
}) {
  const colorMap = {
    gold: "text-gold border-gold/20 from-gold/10 to-gold/5",
    orange:
      "text-orange-500 border-orange-500/20 from-orange-500/10 to-orange-500/5",
    blue: "text-blue-500 border-blue-500/20 from-blue-500/10 to-blue-500/5",
    green:
      "text-emerald-500 border-emerald-500/20 from-emerald-500/10 to-emerald-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={cn("rounded-2xl bg-gradient-to-br border", colorMap[color])}
      >
        <CardContent className="p-4">
          <div className={cn("flex items-center gap-2 mb-2", colorMap[color])}>
            {icon}
          </div>
          <p className="font-display font-bold text-xl text-foreground leading-none">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyChart() {
  return (
    <div className="h-40 flex items-center justify-center">
      <p className="text-sm text-muted-foreground">
        No data yet — start completing tasks!
      </p>
    </div>
  );
}

export { DAY_LABELS };
