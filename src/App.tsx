import { useState, useEffect } from "react";
import type { Todo } from "./types";
import * as api from "./services/api";
import { AddTodoForm } from "./components/AddTodoForm";
import { TodoList } from "./components/TodoList";
import { CheckSquare, WifiOff, RefreshCw } from "lucide-react";

const MAX_TODOS = 20;

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(
    null,
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleReload = () => {
    setIsLoading(true);
    setErrorNotice(null);
    api
      .fetchTodos()
      .then((data) => {
        setTodos(data.slice(0, MAX_TODOS));
        setIsBackendConnected(true);
      })
      .catch(() => {
        setIsBackendConnected(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    api
      .fetchTodos()
      .then((data) => {
        if (!ignore) {
          setTodos(data.slice(0, MAX_TODOS));
          setIsBackendConnected(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsBackendConnected(false);
          setTodos((prev) =>
            prev.length > 0
              ? prev
              : [
                  {
                    id: "1",
                    text: "Welcome to your To-Do App!",
                    completed: false,
                  },
                  {
                    id: "2",
                    text: "Tailwind CSS v4 & React 19",
                    completed: true,
                  },
                  {
                    id: "3",
                    text: "Backend API ready (GET, POST, PATCH, DELETE)",
                    completed: false,
                  },
                ],
          );
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddTodo = async (text: string) => {
    if (todos.length >= MAX_TODOS) return;

    // Local optimistic ID
    const tempId = Date.now().toString();
    const newTodo: Todo = { id: tempId, text, completed: false };

    // Optimistic state update
    setTodos((prev) => [newTodo, ...prev].slice(0, MAX_TODOS));

    try {
      const created = await api.createTodo(text);
      // Replace optimistic temp ID with server ID
      setTodos((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
      // Retain optimistic state so frontend remains functional
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t)),
    );

    try {
      await api.updateTodo(id, { completed });
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }
  };

  const handleEditTodo = async (id: string, newText: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t)),
    );

    try {
      await api.updateTodo(id, { text: newText });
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.deleteTodo(id);
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                To-Do List
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {completedCount} of {todos.length} completed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                todos.length >= MAX_TODOS
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
              }`}
            >
              {todos.length} / {MAX_TODOS}
            </span>
          </div>
        </div>

        {/* Backend Connectivity Status Banner (if offline) */}
        {isBackendConnected === false && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Backend disconnected (local mode)</span>
            </div>
            <button
              onClick={handleReload}
              title="Retry backend connection"
              className="text-indigo-400 hover:text-indigo-300 p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {errorNotice && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
            {errorNotice}
          </div>
        )}

        {/* Add Todo Input */}
        <AddTodoForm
          onAdd={handleAddTodo}
          todoCount={todos.length}
          maxCount={MAX_TODOS}
        />

        {/* Todo List */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggleTodo}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
