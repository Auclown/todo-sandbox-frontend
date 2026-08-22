import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';

describe('api service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchTodos', () => {
    it('fetches todos successfully', async () => {
      const mockTodos = [
        { id: '1', text: 'Test todo 1', completed: false },
        { id: '2', text: 'Test todo 2', completed: true },
      ];
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      });

      const todos = await fetchTodos();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/todos\/$/));
      expect(todos).toEqual(mockTodos);
    });

    it('throws error when response is not ok', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchTodos()).rejects.toThrow('Failed to fetch todos: Internal Server Error');
    });
  });

  describe('createTodo', () => {
    it('creates a new todo with POST request', async () => {
      const newTodo = { id: '10', text: 'New item', completed: false };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo,
      });

      const created = await createTodo('New item');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/todos\/$/),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'New item', completed: false }),
        })
      );
      expect(created).toEqual(newTodo);
    });

    it('throws error when creation fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(createTodo('Fail item')).rejects.toThrow('Failed to create todo: Bad Request');
    });
  });

  describe('updateTodo', () => {
    it('updates a todo using PATCH when successful', async () => {
      const updatedTodo = { id: '1', text: 'Updated title', completed: true };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      });

      const result = await updateTodo('1', { text: 'Updated title', completed: true });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/todos\/1\/$/),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Updated title', completed: true }),
        })
      );
      expect(result).toEqual(updatedTodo);
    });

    it('falls back to PUT when PATCH request fails', async () => {
      const updatedTodo = { id: '1', text: 'Updated title', completed: true };
      // First call (PATCH) fails
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Method Not Allowed',
      });
      // Second call (PUT fallback) succeeds
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      });

      const result = await updateTodo('1', { text: 'Updated title', completed: true });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringMatching(/\/api\/todos\/1\/$/),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(updatedTodo);
    });

    it('throws error when both PATCH and PUT fallback fail', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Method Not Allowed',
      });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
      });

      await expect(updateTodo('1', { completed: true })).rejects.toThrow('Failed to update todo: Method Not Allowed');
    });
  });

  describe('deleteTodo', () => {
    it('sends DELETE request successfully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
      });

      await deleteTodo('123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/todos\/123\/$/),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws error when delete fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(deleteTodo('999')).rejects.toThrow('Failed to delete todo: Not Found');
    });
  });
});
