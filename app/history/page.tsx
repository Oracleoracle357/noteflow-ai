'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Note = {
  id: string;
  summary: string;
  key_decisions: string[];
  action_items: any;
  follow_up_email: string;
  created_at: string;
};

export default function HistoryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data || []);
      }
      setLoading(false);
    }

    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    setDeletingId(id);

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete the note. Please try again.');
    } else {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }

    setDeletingId(null);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold">Past Meeting Notes</h1>
            <p className="text-gray-400 text-sm">View and manage your saved meeting records</p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Meeting Note
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading saved notes...</p>
        ) : notes.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center text-gray-400">
            <p className="mb-4">No saved meeting notes found yet.</p>
            <Link
              href="/"
              className="text-blue-400 hover:underline font-medium"
            >
              Generate your first note →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="bg-red-900/40 hover:bg-red-800/80 text-red-300 border border-red-700 px-3 py-1 rounded-md text-xs font-medium transition disabled:opacity-50"
                  >
                    {deletingId === note.id ? 'Deleting...' : 'Delete Note'}
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold mb-2 text-white">Summary</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">{note.summary}</p>

                {note.key_decisions && note.key_decisions.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-blue-400 text-sm mb-1">Key Decisions</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                      {note.key_decisions.map((decision, index) => (
                        <li key={index}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.action_items && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-blue-400 text-sm mb-1">Action Items</h3>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-xs text-gray-300">
                      <pre className="whitespace-pre-wrap font-sans">
                        {typeof note.action_items === 'string'
                          ? note.action_items
                          : JSON.stringify(note.action_items, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {note.follow_up_email && (
                  <div>
                    <h3 className="font-semibold text-blue-400 text-sm mb-1">Follow-up Email</h3>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-xs text-gray-300 whitespace-pre-wrap">
                      {note.follow_up_email}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}