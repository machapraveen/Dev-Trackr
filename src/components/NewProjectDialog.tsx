import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import { useState } from "react";
// Correct import for uuidv4
import { v4 } from 'uuid'; // This is the correct import

const PROJECT_COLORS = [
  "#8B5CF6", // Vivid Purple
  "#D946EF", // Magenta Pink
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#10B981", // Emerald
  "#F43F5E", // Rose
  "#6366F1", // Indigo
  "#FBBF24", // Amber
];

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [projectPath, setProjectPath] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject({
      name,
      description,
      progress: 0,
      notes: [],
      links: [
        {
          // Use v4() from uuid
          id: v4(), // This generates the UUID
          type: 'file',
          path: projectPath,
          timestamp: new Date().toISOString(),
        }
      ],
      tasks: [],
      color: selectedColor,
      activityLogs: []
    });
    setName("");
    setDescription("");
    setProjectPath("");
    setSelectedColor(PROJECT_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to track your development progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="name"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="projectPath"
                placeholder="Project directory path"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Project Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
