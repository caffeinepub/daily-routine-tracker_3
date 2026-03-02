import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TaskDefinition } from "../backend.d";
import { useCustomCategories } from "../hooks/useQueries";
import { DEFAULT_CATEGORIES } from "./CategoryIcon";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: string;
    duration: bigint | null;
    coinReward: bigint;
  }) => void | Promise<void>;
  editTask?: TaskDefinition;
  isSaving?: boolean;
}

export default function TaskModal({
  open,
  onClose,
  onSave,
  editTask,
  isSaving,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Meditation");
  const [duration, setDuration] = useState("");
  const [coinReward, setCoinReward] = useState("10");

  const { data: customCats = [] } = useCustomCategories();
  const allCategories = [...DEFAULT_CATEGORIES, ...customCats];

  useEffect(() => {
    if (open) {
      if (editTask) {
        setName(editTask.name);
        setCategory(editTask.category);
        setDuration(editTask.duration ? String(Number(editTask.duration)) : "");
        setCoinReward(String(Number(editTask.coinReward)));
      } else {
        setName("");
        setCategory("Meditation");
        setDuration("");
        setCoinReward("10");
      }
    }
  }, [open, editTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dur = duration.trim()
      ? BigInt(Math.max(1, Number.parseInt(duration, 10)))
      : null;
    const coins = BigInt(Math.max(1, Number.parseInt(coinReward, 10) || 10));

    await onSave({
      name: name.trim(),
      category,
      duration: dur,
      coinReward: coins,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="task.add_modal"
        className="sm:max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              data-ocid="task.name_input"
              placeholder="e.g. Morning meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="task-category"
                data-ocid="task.category_select"
                className="rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-duration">Duration (min)</Label>
              <Input
                id="task-duration"
                data-ocid="task.duration_input"
                type="number"
                placeholder="Optional"
                min={1}
                max={480}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-coins">
                <span className="gold-text">🪙</span> Coin Reward
              </Label>
              <Input
                id="task-coins"
                data-ocid="task.coin_reward_input"
                type="number"
                min={1}
                max={1000}
                value={coinReward}
                onChange={(e) => setCoinReward(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="task.submit_button"
              disabled={isSaving || !name.trim()}
              className="rounded-xl flex-1 gold-gradient text-primary-foreground border-0 hover:shadow-gold-sm transition-shadow"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editTask ? (
                "Save Changes"
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
