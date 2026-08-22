import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { App } from "./App";
import * as api from "./services/api";
import type { Todo } from "./types";

vi.mock("./services/api");

describe("App Component", () => {
  const initialTodos: Todo[] = [
    { id: "101", text: "Backend Todo 1", completed: false },
    { id: "102", text: "Backend Todo 2", completed: true },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches and displays todos from API on mount", async () => {
    vi.mocked(api.fetchTodos).mockResolvedValueOnce(initialTodos);

    render(<App />);

    // Initially shows skeleton or loading state then displays items
    await waitFor(() => {
      expect(screen.getByText("Backend Todo 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Backend Todo 2")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 completed")).toBeInTheDocument();
    expect(screen.getByText("2 / 20")).toBeInTheDocument();
  });

  it("falls back to local state and shows disconnected banner when API fetch fails", async () => {
    vi.mocked(api.fetchTodos).mockRejectedValueOnce(new Error("Network error"));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Backend disconnected (local mode)"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Welcome to your To-Do App!")).toBeInTheDocument();
  });

  it("allows adding a new todo item", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchTodos).mockResolvedValueOnce(initialTodos);
    vi.mocked(api.createTodo).mockResolvedValueOnce({
      id: "103",
      text: "New App Task",
      completed: false,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Backend Todo 1")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "New App Task");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(api.createTodo).toHaveBeenCalledWith("New App Task");
    await waitFor(() => {
      expect(screen.getByText("New App Task")).toBeInTheDocument();
    });
  });

  it("allows toggling a todo completion status", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchTodos).mockResolvedValueOnce(initialTodos);
    vi.mocked(api.updateTodo).mockResolvedValueOnce({
      id: "101",
      text: "Backend Todo 1",
      completed: true,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Backend Todo 1")).toBeInTheDocument();
    });

    // Mark complete button for item 'Backend Todo 1'
    const toggleButtons = screen.getAllByRole("button", {
      name: /mark complete/i,
    });
    await user.click(toggleButtons[0]);

    expect(api.updateTodo).toHaveBeenCalledWith("101", { completed: true });
  });

  it("allows deleting a todo item", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchTodos).mockResolvedValueOnce(initialTodos);
    vi.mocked(api.deleteTodo).mockResolvedValueOnce(undefined);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Backend Todo 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete todo",
    });
    await user.click(deleteButtons[0]);

    expect(api.deleteTodo).toHaveBeenCalledWith("101");
    expect(screen.queryByText("Backend Todo 1")).not.toBeInTheDocument();
  });

  it("triggers reload when reload button is clicked on backend disconnect", async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchTodos).mockRejectedValueOnce(
      new Error("Connection lost"),
    );

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("Backend disconnected (local mode)"),
      ).toBeInTheDocument();
    });

    // Mock successful response for retry
    vi.mocked(api.fetchTodos).mockResolvedValueOnce(initialTodos);

    const reloadButton = screen.getByTitle("Retry backend connection");
    await user.click(reloadButton);

    await waitFor(() => {
      expect(screen.getByText("Backend Todo 1")).toBeInTheDocument();
    });
  });
});
