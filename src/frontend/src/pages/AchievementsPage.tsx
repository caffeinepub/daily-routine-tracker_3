import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { useUserProfile } from "../hooks/useQueries";

interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first_task",
    emoji: "🎯",
    name: "First Step",
    description: "Complete your first task",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "perfect_day",
    emoji: "⭐",
    name: "Perfect Day",
    description: "Complete all tasks in a single day",
    color: "from-amber-400 to-yellow-400",
  },
  {
    id: "streak_7",
    emoji: "🔥",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "streak_30",
    emoji: "💎",
    name: "Diamond Habit",
    description: "Maintain a 30-day streak",
    color: "from-sky-400 to-blue-600",
  },
  {
    id: "level_5",
    emoji: "🚀",
    name: "Rising Star",
    description: "Reach level 5",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "level_10",
    emoji: "🏆",
    name: "Champion",
    description: "Reach level 10",
    color: "from-gold to-gold-light",
  },
  {
    id: "level_20",
    emoji: "👑",
    name: "Grandmaster",
    description: "Reach level 20",
    color: "from-yellow-400 via-gold to-amber-500",
  },
];

export default function AchievementsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const earnedBadges = new Set(profile?.badges ?? []);
  const earnedCount = BADGE_DEFS.filter((b) => earnedBadges.has(b.id)).length;

  return (
    <div data-ocid="achievements.page" className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-8 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Your Collection
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Achievements
          </h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {earnedCount} of {BADGE_DEFS.length} badges earned
            </p>
          )}
        </motion.div>

        {/* Progress bar */}
        {!isLoading && (
          <div className="mt-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(earnedCount / BADGE_DEFS.length) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="h-full gold-gradient rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Earned section */}
        {!isLoading && earnedCount > 0 && (
          <div className="mb-5">
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">
              Earned
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {BADGE_DEFS.filter((b) => earnedBadges.has(b.id)).map(
                (badge, i) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={true}
                    delay={i * 0.07}
                  />
                ),
              )}
            </div>
          </div>
        )}

        {/* Locked section */}
        <div>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-widest mb-3">
            {isLoading ? <Skeleton className="h-4 w-24 rounded" /> : "Locked"}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {BADGE_DEFS.map((b) => (
                <Skeleton key={b.id} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {BADGE_DEFS.filter((b) => !earnedBadges.has(b.id)).map(
                (badge, i) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={false}
                    delay={i * 0.05}
                  />
                ),
              )}
            </div>
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
    </div>
  );
}

function BadgeCard({
  badge,
  earned,
  delay,
}: {
  badge: BadgeDef;
  earned: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card
        className={cn(
          "rounded-2xl transition-all duration-300",
          earned
            ? "border-gold/30 shadow-gold-sm hover:shadow-gold-md"
            : "opacity-50",
        )}
      >
        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative",
              earned
                ? `bg-gradient-to-br ${badge.color} shadow-sm`
                : "bg-muted",
            )}
          >
            {earned ? (
              badge.emoji
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-xl opacity-40">{badge.emoji}</span>
                <Lock className="w-4 h-4 absolute bottom-1 right-1 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p
              className={cn(
                "font-display font-semibold text-sm leading-tight",
                earned ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {badge.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {badge.description}
            </p>
          </div>
          {earned && (
            <span className="text-[10px] font-semibold gold-text bg-gold/10 px-2 py-0.5 rounded-full">
              EARNED ✓
            </span>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
