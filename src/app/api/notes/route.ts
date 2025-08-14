import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type Note = {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const [rows] = await pool.query<Note[]>('SELECT * FROM notes ORDER BY id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Note> = await request.json();
    const { title, content } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 });
    }

    const [result] = await pool.query<{ insertId: number }>(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title, content || null]
    );

    const [rows] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Partial<Note> = await request.json();
    const { id, title, content } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Id and title required' }, { status: 400 });
    }

    await pool.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [
      title,
      content || null,
      id,
    ]);

    const [rows] = await pool.query<Note[]>('SELECT * FROM notes WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Id required' }, { status: 400 });
    }

    await pool.query('DELETE FROM notes WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}
