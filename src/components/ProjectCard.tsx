import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Clock, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const { toast } = useToast();

  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileLink = project.links.find(link => link.type === 'file');
    const urlLink = project.links.find(link => link.type === 'url');

    if (fileLink) {
      // Copy the file path to clipboard
      navigator.clipboard.writeText(fileLink.path).then(() => {
        toast({
          title: "File Path Copied!",
          description: "The project directory path has been copied to your clipboard.",
        });
      });
    }

    if (urlLink) {
      // Open URL in new tab
      window.open(urlLink.path, '_blank', 'noopener,noreferrer');
    }

    if (!fileLink && !urlLink) {
      toast({
        title: "No Links Available",
        description: "This project doesn't have any associated links or file paths.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const hasLinks = project.links.length > 0;

  // Ensure that updatedAt is a valid date
  const updatedAt = new Date(project.updatedAt);
  const timeAgo = updatedAt instanceof Date && !isNaN(updatedAt.getTime()) 
    ? formatDistanceToNow(updatedAt) 
    : 'Invalid date'; // Fallback if the date is invalid

  return (
    <Card
      className="project-card cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
      style={{ borderLeftWidth: '4px', borderLeftColor: project.color }}
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Project</p>
            <CardTitle className="text-xl font-semibold group-hover:text-primary">
              {project.name}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {hasLinks && (
              <div className="flex gap-1">
                {project.links.map((link, index) => (
                  <Button
                    key={link.id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (link.type === 'file') {
                        navigator.clipboard.writeText(link.path).then(() => {
                          toast({
                            title: "Path Copied!",
                            description: "Project directory path copied to clipboard.",
                          });
                        });
                      } else if (link.type === 'url') {
                        window.open(link.path, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {link.type === 'file' ? (
                      <FolderOpen className="h-4 w-4" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress 
              value={project.progress} 
              className="h-2"
              style={{ 
                '--progress-background': project.color 
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated {timeAgo} ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
