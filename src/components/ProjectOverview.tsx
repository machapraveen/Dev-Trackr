
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";

interface ProjectOverviewProps {
  projects: Project[];
  overallProgress: number;
}

export function ProjectOverview({ projects, overallProgress }: ProjectOverviewProps) {
  return (
    <div className="mb-8 animate-in">
      <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-6 space-y-2">
          <h3 className="text-lg font-medium">Total Projects</h3>
          <p className="text-3xl font-bold">{projects.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-6 space-y-2">
          <h3 className="text-lg font-medium">Overall Progress</h3>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-right text-sm text-muted-foreground">{overallProgress}%</p>
        </div>
        <div className="bg-card rounded-lg border p-6 space-y-2">
          <h3 className="text-lg font-medium">Active Projects</h3>
          <div className="space-y-2">
            {projects.slice(0, 3).map(project => (
              <div key={project.id} className="flex items-center justify-between">
                <span className="text-sm truncate">{project.name}</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
