import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Loader2, LogOut, Moon, Plus, Sun, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DEFAULT_CATEGORIES } from "../components/CategoryIcon";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddCustomCategory,
  useCustomCategories,
  useRemoveCustomCategory,
} from "../hooks/useQueries";

interface Props {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function SettingsPage({ theme, onToggleTheme }: Props) {
  const { clear, identity } = useInternetIdentity();
  const { data: customCats, isLoading } = useCustomCategories();
  const addCat = useAddCustomCategory();
  const removeCat = useRemoveCustomCategory();

  const [newCat, setNewCat] = useState("");

  const principal = identity?.getPrincipal().toString() ?? "";

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCat.trim();
    if (!name || DEFAULT_CATEGORIES.includes(name)) {
      toast.error("Invalid or duplicate category name");
      return;
    }
    try {
      await addCat.mutateAsync(name);
      setNewCat("");
      toast.success(`Category "${name}" added!`);
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleRemoveCategory = async (name: string) => {
    try {
      await removeCat.mutateAsync(name);
      toast.success(`Category "${name}" removed`);
    } catch {
      toast.error("Failed to remove category");
    }
  };

  return (
    <div data-ocid="settings.page" className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-8 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Preferences
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Settings
          </h1>
        </motion.div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="font-display text-base font-semibold">
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <Label
                      htmlFor="dark-mode"
                      className="font-medium cursor-pointer"
                    >
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Currently using {theme} theme
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  data-ocid="settings.dark_mode_toggle"
                  checked={theme === "dark"}
                  onCheckedChange={onToggleTheme}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="rounded-2xl">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="font-display text-base font-semibold">
                Custom Categories
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Add categories beyond the defaults
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Default categories (read-only) */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Defaults
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom categories */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Custom
                </p>
                {isLoading ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                ) : customCats && customCats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customCats.map((cat, i) => (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 bg-accent rounded-full px-3 py-1"
                      >
                        <span className="text-xs font-medium text-accent-foreground">
                          {cat}
                        </span>
                        <button
                          type="button"
                          data-ocid={`settings.remove_category_button.${i + 1}`}
                          onClick={() => handleRemoveCategory(cat)}
                          disabled={removeCat.isPending}
                          className="text-muted-foreground hover:text-destructive transition-colors rounded-full w-3.5 h-3.5 flex items-center justify-center"
                          aria-label={`Remove ${cat}`}
                        >
                          {removeCat.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No custom categories yet
                  </p>
                )}
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="flex gap-2 pt-1">
                <Input
                  data-ocid="settings.add_category_input"
                  placeholder="New category name…"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="rounded-xl flex-1"
                  maxLength={30}
                />
                <Button
                  data-ocid="settings.add_category_button"
                  type="submit"
                  size="icon"
                  disabled={!newCat.trim() || addCat.isPending}
                  className="rounded-xl gold-gradient text-primary-foreground border-0 shrink-0"
                >
                  {addCat.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="font-display text-base font-semibold">
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Principal ID
                </p>
                <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                  {principal || "—"}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={clear}
                className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="rounded-2xl border-dashed">
            <CardContent className="px-4 py-4 text-center">
              <div className="w-10 h-10 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-lg">🏆</span>
              </div>
              <p className="font-display font-bold text-foreground">
                DailyQuest
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your gamified habit tracker on the Internet Computer
              </p>
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
