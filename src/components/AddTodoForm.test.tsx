import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTodoForm } from "./AddTodoForm";

describe("AddTodoForm", () => {
  it("renders input field and add button when limit is not reached", () => {
    render(<AddTodoForm onAdd={vi.fn()} todoCount={2} maxCount={20} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
    expect(button).toBeDisabled(); // disabled because input is empty
  });

  it("enables submit button when text is entered", async () => {
    const user = userEvent.setup();
    render(<AddTodoForm onAdd={vi.fn()} todoCount={0} maxCount={20} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    await user.type(input, "Buy groceries");
    expect(button).not.toBeDisabled();
  });

  it("calls onAdd with trimmed text and clears input on submit", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddTodoForm onAdd={handleAdd} todoCount={0} maxCount={20} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    await user.type(input, "   Walk the dog   ");
    await user.click(button);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith("Walk the dog");
    expect(input).toHaveValue("");
  });

  it("does not submit empty or whitespace-only input", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddTodoForm onAdd={handleAdd} todoCount={0} maxCount={20} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "    ");

    // Submit form via Enter key
    await user.keyboard("{Enter}");
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it("disables input and button and displays warning when maxCount is reached", () => {
    render(<AddTodoForm onAdd={vi.fn()} todoCount={20} maxCount={20} />);

    const input = screen.getByPlaceholderText("Maximum 20 to-dos reached");
    const button = screen.getByRole("button", { name: /add/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByText(/Limit of 20 items reached/i)).toBeInTheDocument();
  });
});
