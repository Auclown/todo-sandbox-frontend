import React from "react";
import type { Todo } from "../types";
import { TodoItem } from "./TodoItem";
import { CheckCircle2, ListTodo } from "lucide-react";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/30"
          />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-700/60 rounded-2xl bg-slate-800/20">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full mb-3">
          <ListTodo className="w-6 h-6" />
        </div>
        <p className="text-slate-300 font-medium text-sm">No to-dos yet</p>
        <p className="text-slate-500 text-xs mt-1">
          Add your first task using the input above!
        </p>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const isAllCompleted = todos.length > 0 && completedCount === todos.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Scrollable Container - Max 20 items */}
      <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {isAllCompleted && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All tasks completed! Great job!</span>
        </div>
      )}
    </div>
  );
};
