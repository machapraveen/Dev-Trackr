
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface ProjectHeaderProps {
  onNewProject: () => void;
}

export function ProjectHeader({ onNewProject }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your development projects
        </p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button
          className="animate-in"
          size="lg"
          onClick={onNewProject}
        >
          <Plus className="mr-2 h-5 w-5" /> New Project
        </Button>
      </div>
    </div>
  );
}
