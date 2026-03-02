import { cn } from "@/lib/utils";
import {
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Dumbbell,
  Moon,
} from "lucide-react";

const CATEGORY_MAP: Record<
  string,
  { emoji: string; color: string; icon?: React.ElementType }
> = {
  Meditation: {
    emoji: "🧘",
    color: "from-violet-500 to-purple-600",
    icon: Brain,
  },
  Study: { emoji: "📚", color: "from-blue-500 to-cyan-500", icon: BookOpen },
  Gym: { emoji: "💪", color: "from-red-500 to-orange-500", icon: Dumbbell },
  Reading: {
    emoji: "📖",
    color: "from-green-500 to-emerald-500",
    icon: BookMarked,
  },
  Coding: { emoji: "💻", color: "from-indigo-500 to-blue-500", icon: Code2 },
  Work: { emoji: "💼", color: "from-amber-500 to-yellow-500", icon: Briefcase },
  Sleep: { emoji: "😴", color: "from-slate-400 to-slate-500", icon: Moon },
};

interface Props {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CategoryIcon({
  category,
  size = "md",
  className,
}: Props) {
  const cat = CATEGORY_MAP[category] ?? {
    emoji: "⭐",
    color: "from-gold to-gold-light",
  };

  const sizeClass = {
    sm: "w-7 h-7 text-sm rounded-lg",
    md: "w-9 h-9 text-base rounded-xl",
    lg: "w-12 h-12 text-xl rounded-2xl",
  }[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm",
        cat.color,
        sizeClass,
        className,
      )}
    >
      <span role="img" aria-label={category}>
        {cat.emoji}
      </span>
    </div>
  );
}

export function getCategoryEmoji(category: string): string {
  return CATEGORY_MAP[category]?.emoji ?? "⭐";
}

export const DEFAULT_CATEGORIES = [
  "Meditation",
  "Study",
  "Gym",
  "Reading",
  "Coding",
  "Work",
  "Sleep",
];
