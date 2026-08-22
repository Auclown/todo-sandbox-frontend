import type { Todo } from '../types';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/todos';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch todos: ${res.statusText}`);
  }
  return res.json();
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, completed: false }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create todo: ${res.statusText}`);
  }
  return res.json();
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, 'id'>>
): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    // Try PUT as fallback if PATCH fails
    const fallbackRes = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!fallbackRes.ok) {
      throw new Error(`Failed to update todo: ${res.statusText}`);
    }
    return fallbackRes.json();
  }
  return res.json();
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete todo: ${res.statusText}`);
  }
}
