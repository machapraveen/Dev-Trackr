
import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectGrid({ projects, onProjectClick, onDeleteProject }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
