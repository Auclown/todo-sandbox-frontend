import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TodoList } from "./TodoList";
import type { Todo } from "../types";

describe("TodoList", () => {
  const sampleTodos: Todo[] = [
    { id: "1", text: "First Todo", completed: true },
    { id: "2", text: "Second Todo", completed: false },
  ];

  it("renders loading skeletons when isLoading is true", () => {
    const { container } = render(
      <TodoList
        todos={[]}
        isLoading={true}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const animatePulseElements = container.querySelectorAll(".animate-pulse");
    expect(animatePulseElements).toHaveLength(3);
  });

  it("renders empty state message when todos array is empty and not loading", () => {
    render(
      <TodoList
        todos={[]}
        isLoading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("No to-dos yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first task using the input above!"),
    ).toBeInTheDocument();
  });

  it("renders all todo items when list is non-empty", () => {
    render(
      <TodoList
        todos={sampleTodos}
        isLoading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("First Todo")).toBeInTheDocument();
    expect(screen.getByText("Second Todo")).toBeInTheDocument();
  });

  it('displays "All tasks completed!" banner when all todos are completed', () => {
    const allCompletedTodos: Todo[] = [
      { id: "1", text: "Task 1", completed: true },
      { id: "2", text: "Task 2", completed: true },
    ];

    render(
      <TodoList
        todos={allCompletedTodos}
        isLoading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("All tasks completed! Great job!"),
    ).toBeInTheDocument();
  });

  it("does not display completion banner when some items are incomplete", () => {
    render(
      <TodoList
        todos={sampleTodos}
        isLoading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("All tasks completed! Great job!"),
    ).not.toBeInTheDocument();
  });
});
