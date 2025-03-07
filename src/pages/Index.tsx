import { useState, useEffect } from "react";
import { Project, QuickLink, TodoItem } from "@/types/project";
import { ProjectGrid } from "@/components/ProjectGrid";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { ProjectDetails } from "@/components/ProjectDetails";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectOverview } from "@/components/ProjectOverview";
import { QuickAccess } from "@/components/QuickAccess";
import { QuickTasks } from "@/components/QuickTasks";
import { useToast } from "@/components/ui/use-toast";
import { LetterReversalTool } from "@/components/LetterReversalTool";
import { supabase } from "@/lib/supabaseClient";

export default function Index() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        console.log('User ID set:', session.user.id);
        setUserId(session.user.id);
      } else {
        toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      }
    };

    fetchUserId();
  }, [toast]);

  useEffect(() => {
    if (!userId) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, name, description, progress, color, created_at, updated_at,
          links (id, type, path, timestamp),
          tasks (id, content, completed, timestamp),
          activity_logs (id, type, description, timestamp)
        `)
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching projects:", error);
        toast({ title: "Error", description: "Failed to load projects: " + error.message, variant: "destructive" });
      } else {
        setProjects(data || []);
      }
    };

    const fetchQuickLinks = async () => {
      const { data, error } = await supabase
        .from("quick_links")
        .select("*")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching quick links:", error);
        toast({ title: "Error", description: "Failed to load quick links: " + error.message, variant: "destructive" });
      } else {
        setQuickLinks(data || []);
      }
    };

    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching todos:", error);
        toast({ title: "Error", description: "Failed to load todos: " + error.message, variant: "destructive" });
      } else {
        setTodos(data || []);
      }
    };

    fetchProjects();
    fetchQuickLinks();
    fetchTodos();

    const projectChannel = supabase
      .channel("projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `user_id=eq.${userId}` }, fetchProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "links" }, fetchProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchProjects)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, fetchProjects)
      .subscribe();

    const quickLinksChannel = supabase
      .channel("quick_links")
      .on("postgres_changes", { event: "*", schema: "public", table: "quick_links", filter: `user_id=eq.${userId}` }, fetchQuickLinks)
      .subscribe();

    const todosChannel = supabase
      .channel("todos")
      .on("postgres_changes", { event: "*", schema: "public", table: "todos", filter: `user_id=eq.${userId}` }, fetchTodos)
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(quickLinksChannel);
      supabase.removeChannel(todosChannel);
    };
  }, [userId, toast]);

  const handleCreateProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    if (!userId) return;

    const newProject = {
      user_id: userId,
      name: projectData.name,
      description: projectData.description,
      progress: projectData.progress,
      color: projectData.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects")
      .insert([newProject])
      .select("id, name, description, progress, color, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error creating project:", error);
      toast({ title: "Error", description: "Failed to create project: " + error.message, variant: "destructive" });
      return;
    }

    const newLink = projectData.links[0];
    let links = [];
    if (newLink) {
      const { error: linkError } = await supabase
        .from("links")
        .insert([{ ...newLink, project_id: data.id }]);
      if (linkError) {
        console.error("Error adding link:", linkError);
        toast({ title: "Error", description: "Failed to add link: " + linkError.message, variant: "destructive" });
        return;
      }
      links = [newLink];
    }

    setProjects((prev) => [{ ...data, links, tasks: [], activity_logs: [] }, ...prev]);
    toast({ title: "Project Created", description: `${data.name} has been created successfully.` });
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);
    toast({ title: "Project Updated", description: `${updatedProject.name} has been updated successfully.` });
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      console.error("Error deleting project:", error);
      toast({ title: "Error", description: "Failed to delete project: " + error.message, variant: "destructive" });
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast({ title: "Project Deleted", description: "The project has been successfully deleted.", variant: "destructive" });
  };

  const handleUpdateQuickLinks = async (updatedLinks: QuickLink[]) => {
    if (!userId) return;
    const { error } = await supabase.from("quick_links").upsert(updatedLinks.map(link => ({ ...link, user_id: userId })));
    if (error) {
      console.error("Error updating quick links:", error);
      toast({ title: "Error", description: "Failed to update quick links: " + error.message, variant: "destructive" });
      return;
    }
    setQuickLinks(updatedLinks);
  };

  const handleUpdateTodos = async (updatedTodos: TodoItem[]) => {
    if (!userId) return;
    const { error } = await supabase.from("todos").upsert(updatedTodos.map(todo => ({ ...todo, user_id: userId })));
    if (error) {
      console.error("Error updating todos:", error);
      toast({ title: "Error", description: "Failed to update todos: " + error.message, variant: "destructive" });
      return;
    }
    setTodos(updatedTodos);
  };

  const calculateOverallProgress = () => {
    if (projects.length === 0) return 0;
    const totalProgress = projects.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(totalProgress / projects.length);
  };

  if (!userId) {
    return <div className="p-4">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-8 px-4">
        <LetterReversalTool />
        <ProjectHeader onNewProject={() => setNewProjectDialogOpen(true)} />
        <ProjectOverview projects={projects} overallProgress={calculateOverallProgress()} />
        <QuickAccess quickLinks={quickLinks} onUpdateLinks={handleUpdateQuickLinks} />
        <QuickTasks todos={todos} onUpdateTodos={handleUpdateTodos} />
        <div className="md:block">
          <div className="md:hidden overflow-x-auto pb-4">
            <div className="flex gap-4 snap-x">
              {projects.map((project) => (
                <div key={project.id} className="snap-start flex-shrink-0 w-[300px]">
                  <ProjectGrid
                    projects={[project]}
                    onProjectClick={(p) => setSelectedProject(p)}
                    onDeleteProject={handleDeleteProject}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <ProjectGrid
              projects={projects}
              onProjectClick={(project) => setSelectedProject(project)}
              onDeleteProject={handleDeleteProject}
            />
          </div>
        </div>
      </div>

      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        onCreateProject={handleCreateProject}
      />

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
        />
      )}
    </div>
  );
}