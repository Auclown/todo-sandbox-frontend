import React, { useState, useRef, useEffect } from "react";
import type { Todo } from "../types";
import { Pencil, Trash2, Check, X, Square, CheckSquare } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
        todo.completed
          ? "bg-slate-800/40 border-slate-700/50 text-slate-400"
          : "bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-100 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggle(todo.id, !todo.completed)}
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
          className="text-slate-400 hover:text-indigo-400 focus:outline-none transition-colors shrink-0"
        >
          {todo.completed ? (
            <CheckSquare className="w-5 h-5 text-indigo-400" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-slate-900 border border-indigo-500/70 text-slate-100 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            maxLength={120}
          />
        ) : (
          <span
            onClick={() => onToggle(todo.id, !todo.completed)}
            className={`text-sm select-none cursor-pointer truncate flex-1 ${
              todo.completed ? "line-through text-slate-500" : "text-slate-200"
            }`}
            title={todo.text}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              aria-label="Save todo edit"
              title="Save"
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditText(todo.text);
                setIsEditing(false);
              }}
              aria-label="Cancel editing"
              title="Cancel"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit todo"
              title="Edit"
              className="p-1.5 rounded-lg text-slate-400 opacity-80 group-hover:opacity-100 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete todo"
              title="Delete"
              className="p-1.5 rounded-lg text-slate-400 opacity-80 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
