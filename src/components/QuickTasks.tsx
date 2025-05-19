import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TodoItem } from "@/types/project";
import { v4 as uuidv4 } from 'uuid';

interface QuickTasksProps {
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
}

export function QuickTasks({ todos, onUpdateTodos }: QuickTasksProps) {
  const { toast } = useToast();
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: TodoItem = {
      id: uuidv4(),
      content: newTodo,
      completed: false,
      timestamp: new Date().toISOString(),
    };
    
    onUpdateTodos([todo, ...todos]);
    setNewTodo("");
    toast({
      title: "Task Added",
      description: "New task has been added to your list.",
    });
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    onUpdateTodos(updatedTodos);
    toast({
      title: "Task Updated",
      description: "Task status has been updated.",
    });
  };

  return (
    <div className="mb-8 animate-in">
      <h2 className="text-2xl font-semibold mb-4">Quick Tasks</h2>
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <Button onClick={handleAddTodo}>Add Task</Button>
        </div>
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="p-3 rounded-lg border flex items-start gap-3 group hover:bg-muted transition-colors cursor-pointer"
              onClick={() => toggleTodo(todo.id)}
            >
              <div className={`mt-1 size-5 rounded border-2 flex items-center justify-center transition-colors ${
                todo.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {todo.completed && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
