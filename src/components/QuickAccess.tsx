import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Check, Trash2, ExternalLink, Link, Github, Youtube, MessageSquare, Code, Book, Briefcase, LucideIcon } from "lucide-react";
import { useState } from "react";
import { QuickLink } from "@/types/project";
import { useToast } from "@/components/ui/use-toast";
// Import the uuid library
import { v4 as uuidv4 } from 'uuid';

interface QuickAccessProps {
  quickLinks: QuickLink[];
  onUpdateLinks: (links: QuickLink[]) => void;
}

const iconMap: Record<string, LucideIcon> = {
  'link': Link,
  'github': Github,
  'youtube': Youtube,
  'message-square': MessageSquare,
  'external-link': ExternalLink,
  'code': Code,
  'book': Book,
  'briefcase': Briefcase,
};

export function QuickAccess({ quickLinks, onUpdateLinks }: QuickAccessProps) {
  const { toast } = useToast();
  const [newLinkForm, setNewLinkForm] = useState({ title: "", url: "" });
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState({ title: "", url: "" });

  const handleEditLink = (link: QuickLink) => {
    setEditingLinkId(link.id);
    setEditingLink({ title: link.title, url: link.url });
  };

  const handleSaveEdit = () => {
    if (!editingLinkId) return;
    
    const updatedLinks = quickLinks.map(link => 
      link.id === editingLinkId 
        ? { ...link, title: editingLink.title, url: editingLink.url }
        : link
    );
    
    onUpdateLinks(updatedLinks);
    setEditingLinkId(null);
    setEditingLink({ title: "", url: "" });
    toast({
      title: "Link Updated",
      description: "Quick access link has been updated successfully.",
    });
  };

  const handleDeleteLink = (id: string) => {
    const updatedLinks = quickLinks.filter(link => link.id !== id);
    onUpdateLinks(updatedLinks);
    toast({
      title: "Link Removed",
      description: "Quick access link has been removed.",
      variant: "destructive",
    });
  };

  const handleAddQuickLink = () => {
    if (!newLinkForm.title.trim() || !newLinkForm.url.trim()) return;
    
    const newLink: QuickLink = {
      id: uuidv4(), // Use uuidv4 to generate UUID instead of crypto.randomUUID()
      title: newLinkForm.title,
      url: newLinkForm.url,
      icon: "external-link",
      color: "#64748B",
      timestamp: new Date().toISOString(),
    };
    
    onUpdateLinks([...quickLinks, newLink]);
    setNewLinkForm({ title: "", url: "" });
    setShowNewLinkForm(false);
    toast({
      title: "Link Added",
      description: "Quick access link has been added successfully.",
    });
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={20} /> : <ExternalLink size={20} />;
  };

  return (
    <div className="mb-8 animate-in">
      <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x">
          {quickLinks.map((link) => (
            <div key={link.id} className="snap-start flex-shrink-0 w-[280px]">
              {editingLinkId === link.id ? (
                <div className="p-4 rounded-lg border bg-card shadow-sm space-y-3">
                  <Input
                    value={editingLink.title}
                    onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Link Title"
                  />
                  <Input
                    value={editingLink.url}
                    onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))} 
                    placeholder="URL"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingLinkId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3"
                    style={{ borderColor: `${link.color}30` }}
                  >
                    <div className="p-2 rounded-md" style={{ backgroundColor: `${link.color}10`, color: link.color }}>
                      {renderIcon(link.icon)}
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors">{link.title}</span>
                  </a>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditLink(link)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="snap-start flex-shrink-0 w-[280px]">
            <Button variant="outline" className="w-full h-[104px] border-dashed" onClick={() => setShowNewLinkForm(true)}>
              <Plus className="mr-2 h-5 w-5" /> Add Link
            </Button>
          </div>
        </div>
      </div>
      
      {showNewLinkForm && (
        <div className="mt-4 p-4 border rounded-lg bg-card space-y-4">
          <Input
            placeholder="Link Title"
            value={newLinkForm.title}
            onChange={(e) => setNewLinkForm(prev => ({ ...prev, title: e.target.value }))} 
          />
          <Input
            placeholder="URL"
            value={newLinkForm.url}
            onChange={(e) => setNewLinkForm(prev => ({ ...prev, url: e.target.value }))} 
          />
          <div className="flex gap-2">
            <Button onClick={handleAddQuickLink}>Add Link</Button>
            <Button variant="outline" onClick={() => setShowNewLinkForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
