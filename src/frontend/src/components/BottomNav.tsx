import { cn } from "@/lib/utils";
import { BarChart2, LayoutDashboard, Settings, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  ocid: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  { id: "stats", label: "Stats", icon: BarChart2, ocid: "nav.stats_link" },
  {
    id: "achievements",
    label: "Awards",
    icon: Trophy,
    ocid: "nav.achievements_link",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    ocid: "nav.settings_link",
  },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function BottomNav({ currentPage, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                "min-w-[64px] min-h-[44px]",
                isActive
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-gold/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "w-5 h-5 relative z-10 transition-transform duration-200",
                  isActive && "scale-110",
                )}
              />
              <span className="text-[10px] font-medium relative z-10 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
