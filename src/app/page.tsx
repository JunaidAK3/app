'use client';

import React, { useEffect, useState, useCallback } from 'react';

type Note = { id: number; title: string; content?: string | null; created_at?: string };

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<Note | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/api';

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`${apiBase}/notes`);
    const data = await res.json();
    if (data.success) setNotes(data.data || []);
  }, [apiBase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return alert('Title required');
    const res = await fetch(`${apiBase}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    if (data.success) {
      setTitle('');
      setContent('');
      setNotes(prev => [data.data, ...prev]);
    } else alert(data.error || 'Error');
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    await fetch(`${apiBase}/notes?id=${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function startEdit(note: Note) {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content || '');
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`${apiBase}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, title, content }),
    });
    const data = await res.json();
    if (data.success) {
      setNotes(prev => prev.map(n => (n.id === data.data.id ? data.data : n)));
      setEditing(null);
      setTitle('');
      setContent('');
    } else alert(data.error || 'Error');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notes CRUD (Next.js + MySQL)</h1>

      <form onSubmit={editing ? submitEdit : handleCreate} className="mb-6">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border mb-2" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="w-full p-2 border mb-2" />
        <div>
          <button type="submit" className="px-3 py-1 mr-2 border rounded">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setTitle(''); setContent(''); }} className="px-3 py-1 border rounded">Cancel</button>
          )}
        </div>
      </form>

      <ul>
        {notes.map(n => (
          <li key={n.id} className="mb-3 p-3 border rounded">
            <div className="flex justify-between">
              <strong>{n.title}</strong>
              <div>
                <button onClick={() => startEdit(n)} className="mr-2">Edit</button>
                <button onClick={() => handleDelete(n.id)}>Delete</button>
              </div>
            </div>
            {n.content && <p className="mt-2">{n.content}</p>}
            <small className="text-gray-500">{n.created_at}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
