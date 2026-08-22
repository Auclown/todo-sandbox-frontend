import React, { useState } from "react";
import { Plus } from "lucide-react";

interface AddTodoFormProps {
  onAdd: (text: string) => void;
  todoCount: number;
  maxCount: number;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({
  onAdd,
  todoCount,
  maxCount,
}) => {
  const [text, setText] = useState("");
  const isMaxReached = todoCount >= maxCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMaxReached) return;
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isMaxReached
              ? `Maximum ${maxCount} to-dos reached`
              : "What needs to be done?"
          }
          disabled={isMaxReached}
          maxLength={120}
          className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="submit"
          disabled={isMaxReached || !text.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {isMaxReached && (
        <p className="text-xs text-amber-400/90 font-medium px-1">
          ⚠️ Limit of {maxCount} items reached. Please delete an item before
          adding a new one.
        </p>
      )}
    </form>
  );
};
