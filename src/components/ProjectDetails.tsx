import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ExternalLink, FolderOpen, ListChecks, Check, Link, Rocket, Edit2, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Project, ProjectLink, ProjectTask, ActivityLog } from "@/types/project";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from 'uuid';

interface ProjectDetailsProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject: (project: Project) => void;
}

export function ProjectDetails({
  project,
  open,
  onOpenChange,
  onUpdateProject,
}: ProjectDetailsProps) {
  const { toast } = useToast();
  const [newUrlPath, setNewUrlPath] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  const [newTask, setNewTask] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);

  const handleProgressChange = async (increment: boolean) => {
    const newProgress = increment ? Math.min(project.progress + 5, 100) : Math.max(project.progress - 5, 0);
    const log: ActivityLog = {
      id: uuidv4(),
      type: "progress_updated",
      description: `Progress ${increment ? "increased" : "decreased"} to ${newProgress}%`,
      timestamp: new Date().toISOString(),
    };

    const { error: progressError } = await supabase
      .from("projects")
      .update({ progress: newProgress, updated_at: new Date().toISOString() })
      .eq("id", project.id);

    if (progressError) {
      console.error("Error updating progress:", progressError);
      toast({ title: "Error", description: "Failed to update progress: " + progressError.message, variant: "destructive" });
      return;
    }

    const { error: logError } = await supabase
      .from("activity_logs")
      .insert([{ ...log, project_id: project.id }]);

    if (logError) {
      console.error("Error adding log:", logError);
      toast({ title: "Error", description: "Failed to log progress update: " + logError.message, variant: "destructive" });
      return;
    }

    onUpdateProject({
      ...project,
      progress: newProgress,
      updatedAt: new Date().toISOString(),
      activityLogs: [log, ...(project.activityLogs || [])],
    });

    toast({ title: "Progress Updated", description: `Project progress is now ${newProgress}%` });
  };

  const handleEditSave = async () => {
    if (isEditing) {
      const { error } = await supabase
        .from("projects")
        .update({
          name: editedProject.name,
          description: editedProject.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editedProject.id);

      if (error) {
        console.error("Error updating project:", error);
        toast({ title: "Error", description: "Failed to update project: " + error.message, variant: "destructive" });
        return;
      }

      onUpdateProject({ ...editedProject, updatedAt: new Date().toISOString() });
      toast({ title: "Project Updated", description: "Project details have been updated successfully." });
    }
    setIsEditing(!isEditing);
  };

  const handleAddLink = async () => {
    if (!newUrlPath.trim() && !newFilePath.trim()) return;

    const links: ProjectLink[] = [];
    if (newUrlPath.trim()) {
      links.push({ id: uuidv4(), type: "url", path: newUrlPath, timestamp: new Date().toISOString() });
    }
    if (newFilePath.trim()) {
      links.push({ id: uuidv4(), type: "file", path: newFilePath, timestamp: new Date().toISOString() });
    }

    const { error } = await supabase
      .from("links")
      .insert(links.map((link) => ({ ...link, project_id: project.id })));

    if (error) {
      console.error("Error adding links:", error);
      toast({ title: "Error", description: "Failed to add links: " + error.message, variant: "destructive" });
      return;
    }

    const log: ActivityLog = {
      id: uuidv4(),
      type: "link_added",
      description: `Added ${links.length} new link(s)`,
      timestamp: new Date().toISOString(),
    };

    const { error: logError } = await supabase
      .from("activity_logs")
      .insert([{ ...log, project_id: project.id }]);

    if (logError) {
      console.error("Error adding log:", logError);
      toast({ title: "Error", description: "Failed to log link addition: " + logError.message, variant: "destructive" });
      return;
    }

    onUpdateProject({
      ...project,
      links: [...links, ...project.links],
      activityLogs: [log, ...(project.activityLogs || [])],
      updatedAt: new Date().toISOString(),
    });

    setNewUrlPath("");
    setNewFilePath("");
    toast({ title: "Links Added", description: "Project links have been updated" });
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    const task: ProjectTask = {
      id: uuidv4(),
      content: newTask,
      completed: false,
      timestamp: new Date().toISOString(),
      projectId: project.id,
    };

    const { error } = await supabase
      .from("tasks")
      .insert([{ ...task, project_id: project.id }]);

    if (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task: " + error.message, variant: "destructive" });
      return;
    }

    onUpdateProject({
      ...project,
      tasks: [task, ...project.tasks],
      updatedAt: new Date().toISOString(),
    });

    setNewTask("");
    toast({ title: "Task Added", description: "New task has been added to the project" });
  };

  const handleOpenLink = (link: ProjectLink) => {
    if (link.type === "url") {
      window.open(link.path, "_blank");
    } else if (link.type === "file") {
      navigator.clipboard.writeText(link.path).then(() => {
        toast({ title: "Path Copied", description: "Project directory path has been copied to clipboard" });
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const { error } = await supabase.from("links").delete().eq("id", linkId);

    if (error) {
      console.error("Error deleting link:", error);
      toast({ title: "Error", description: "Failed to delete link: " + error.message, variant: "destructive" });
      return;
    }

    onUpdateProject({
      ...project,
      links: project.links.filter((link) => link.id !== linkId),
      updatedAt: new Date().toISOString(),
    });

    toast({ title: "Link Removed", description: "Link has been removed from the project" });
  };

  const handleToggleTask = async (taskId: string) => {
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId);

    if (error) {
      console.error("Error toggling task:", error);
      toast({ title: "Error", description: "Failed to update task: " + error.message, variant: "destructive" });
      return;
    }

    onUpdateProject({
      ...project,
      tasks: project.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      updatedAt: new Date().toISOString(),
    });

    toast({ title: "Task Updated", description: `Task marked as ${task.completed ? "incomplete" : "complete"}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6" style={{ color: project.color }} />
              {isEditing ? (
                <Input
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  className="text-2xl font-bold"
                />
              ) : (
                <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleEditSave}>
              {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <Textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Progress</h3>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => handleProgressChange(false)} disabled={project.progress <= 0}>
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Progress value={project.progress} className="h-2" style={{ "--progress-background": project.color } as React.CSSProperties} />
              </div>
              <Button variant="outline" size="icon" onClick={() => handleProgressChange(true)} disabled={project.progress >= 100}>
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Link className="h-5 w-5" />
              Project Links
            </h3>
            <div className="grid gap-3">
              <Input placeholder="URL (e.g., documentation, research)" value={newUrlPath} onChange={(e) => setNewUrlPath(e.target.value)} />
              <Input placeholder="Project Directory Path" value={newFilePath} onChange={(e) => setNewFilePath(e.target.value)} />
              <Button
                onClick={handleAddLink}
                className="w-full"
                style={{ backgroundColor: project.color, color: "white", "--tw-shadow": `0 4px 14px 0 ${project.color}70` } as React.CSSProperties}
              >
                Add Links
              </Button>
            </div>
            <div className="grid gap-2">
              {project.links.map((link) => (
                <div
                  key={link.id}
                  className="group p-4 rounded-lg border transition-all duration-300 hover:scale-102 cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: `${project.color}10`, borderColor: `${project.color}30` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 group-hover:translate-x-0 -translate-x-full transition-transform duration-300" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 flex-1">
                      {link.type === "url" ? (
                        <ExternalLink className="h-4 w-4" style={{ color: project.color }} />
                      ) : (
                        <FolderOpen className="h-4 w-4" style={{ color: project.color }} />
                      )}
                      {isEditing ? (
                        <Input
                          value={link.path}
                          onChange={(e) => {
                            const updatedLinks = project.links.map((l) => (l.id === link.id ? { ...l, path: e.target.value } : l));
                            setEditedProject({ ...editedProject, links: updatedLinks });
                          }}
                          className="flex-1"
                        />
                      ) : (
                        <p className="text-sm font-medium truncate max-w-[300px]" onClick={() => handleOpenLink(link)}>
                          {link.path}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(link.timestamp))} ago</p>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Tasks
            </h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg space-y-1 flex items-start gap-3 group hover:bg-accent/50 transition-colors"
                  style={{ backgroundColor: `${project.color}10` }}
                  onClick={() => handleToggleTask(task.id)}
                >
                  <div
                    className={`mt-1 p-1 rounded-md cursor-pointer transition-colors`}
                    style={{ backgroundColor: task.completed ? project.color : "transparent", border: `2px solid ${project.color}` }}
                  >
                    <Check className={`h-4 w-4 ${task.completed ? "text-white" : "opacity-0 group-hover:opacity-50"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.content}</p>
                    <p className="text-xs text-muted-foreground">Added {formatDistanceToNow(new Date(task.timestamp))} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Log</h3>
            <div className="space-y-2">
              {project.activityLogs?.map((log) => (
                <div key={log.id} className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp))} ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
