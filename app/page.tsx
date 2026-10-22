'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Navigation */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold">NoteFlow AI</h1>
            <p className="text-gray-400 text-sm">Transform meeting transcripts into structured notes</p>
          </div>
          <Link
            href="/history"
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            View History →
          </Link>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 shadow-md">
          <label htmlFor="transcript" className="block text-sm font-medium mb-2 text-gray-300">
            Paste Meeting Transcript:
          </label>
          <textarea
            id="transcript"
            rows={8}
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Paste your meeting raw text or notes here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !transcript.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Generating Notes & Saving...' : 'Generate Notes'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 mb-8 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Generated Output Display */}
        {result && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">Generated Notes</h2>

            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Summary</h3>
              <p className="text-gray-300 leading-relaxed">{result.summary}</p>
            </div>

            {result.key_decisions && result.key_decisions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Decisions</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.key_decisions.map((decision: string, index: number) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.action_items && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Action Items</h3>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">
                    {typeof result.action_items === 'string'
                      ? result.action_items
                      : JSON.stringify(result.action_items, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {result.follow_up_email && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Follow-up Email Draft</h3>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap text-sm">
                  {result.follow_up_email}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}