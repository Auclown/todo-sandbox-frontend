import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types";

describe("TodoItem", () => {
  const mockTodo: Todo = {
    id: "todo-1",
    text: "Learn Vitest",
    completed: false,
  };

  it("renders todo text and incomplete toggle button", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Learn Vitest")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mark complete" }),
    ).toBeInTheDocument();
  });

  it("renders completed todo with line-through styling and complete toggle button", () => {
    const completedTodo: Todo = { ...mockTodo, completed: true };
    render(
      <TodoItem
        todo={completedTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const span = screen.getByText("Learn Vitest");
    expect(span).toHaveClass("line-through");
    expect(
      screen.getByRole("button", { name: "Mark incomplete" }),
    ).toBeInTheDocument();
  });

  it("calls onToggle when checkbox button or text span is clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Click checkbox
    await user.click(screen.getByRole("button", { name: "Mark complete" }));
    expect(handleToggle).toHaveBeenCalledWith("todo-1", true);

    // Click text span
    await user.click(screen.getByText("Learn Vitest"));
    expect(handleToggle).toHaveBeenCalledWith("todo-1", true);
  });

  it("enters edit mode, accepts edits, and saves on Enter or Save button click", async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />,
    );

    // Click edit button
    await user.click(screen.getByRole("button", { name: "Edit todo" }));

    const editInput = screen.getByDisplayValue("Learn Vitest");
    expect(editInput).toBeInTheDocument();

    await user.clear(editInput);
    await user.type(editInput, "Master Vitest");

    // Click save button
    await user.click(screen.getByRole("button", { name: "Save todo edit" }));

    expect(handleEdit).toHaveBeenCalledWith("todo-1", "Master Vitest");
    expect(screen.queryByDisplayValue("Master Vitest")).not.toBeInTheDocument();
  });

  it("saves edits on Enter keypress", async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit todo" }));
    const editInput = screen.getByDisplayValue("Learn Vitest");
    await user.type(editInput, " testing");
    await user.keyboard("{Enter}");

    expect(handleEdit).toHaveBeenCalledWith("todo-1", "Learn Vitest testing");
  });

  it("cancels editing on Escape keypress or Cancel button click", async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />,
    );

    // Test Escape key cancel
    await user.click(screen.getByRole("button", { name: "Edit todo" }));
    const editInput = screen.getByDisplayValue("Learn Vitest");
    await user.type(editInput, " cancelled text");
    await user.keyboard("{Escape}");

    expect(handleEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Learn Vitest")).toBeInTheDocument();

    // Test Cancel button click
    await user.click(screen.getByRole("button", { name: "Edit todo" }));
    const editInput2 = screen.getByDisplayValue("Learn Vitest");
    await user.type(editInput2, " another change");
    await user.click(screen.getByRole("button", { name: "Cancel editing" }));

    expect(handleEdit).not.toHaveBeenCalled();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete todo" }));
    expect(handleDelete).toHaveBeenCalledWith("todo-1");
  });
});
