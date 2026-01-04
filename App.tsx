
import React, { useState, useCallback } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  FileDown, 
  BookOpenCheck,
  Cpu,
  History
} from 'lucide-react';
import { generateNotes } from './services/geminiService';
import { downloadAsPDF, downloadAsWord } from './utils/exportUtils';
import { NoteData } from './types';

// Mock history storage for demonstration
const STORAGE_KEY = 'note_forge_history';

const App: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<NoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<NoteData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic) return;

    setLoading(true);
    setError(null);
    try {
      const content = await generateNotes(subject, topic);
      const newNote: NoteData = {
        subject,
        topic,
        content,
        timestamp: new Date().toLocaleString(),
      };
      setGeneratedNotes(newNote);
      
      // Save to history
      const updatedHistory = [newNote, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSubject('');
    setTopic('');
    setGeneratedNotes(null);
    setError(null);
  };

  const loadFromHistory = (note: NoteData) => {
    setSubject(note.subject);
    setTopic(note.topic);
    setGeneratedNotes(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BookOpenCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">NoteForge <span className="text-primary-600">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-primary-600 transition-colors">How it works</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Pricing</a>
              <a href="#" className="hover:text-primary-600 transition-colors">API</a>
            </div>
            <button className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
              <Search className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form and History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-500" />
                Generator Settings
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Dijkstra's Algorithm"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-200"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                    {loading ? 'Generating...' : 'Generate Notes'}
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full bg-slate-50 text-slate-600 py-2.5 rounded-xl font-semibold hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  Recent Generations
                </h2>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
                    >
                      <p className="font-medium text-slate-800 text-sm truncate">{item.topic}</p>
                      <p className="text-xs text-slate-500 group-hover:text-primary-600">{item.subject} • {item.timestamp}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Content Preview */}
          <div className="lg:col-span-8">
            {!generatedNotes && !loading && !error && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl h-[400px] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Ready to build your knowledge?</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Enter a subject and topic on the left to generate structured, AI-powered notes instantly.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800">Researching & Formatting...</h3>
                <p className="text-slate-500 mt-2">Our AI is gathering information and structuring your notes.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 text-red-700">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Generation Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {generatedNotes && !loading && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Preview Header */}
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{generatedNotes.subject}</span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{generatedNotes.topic}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadAsPDF(`${generatedNotes.subject} - ${generatedNotes.topic}`, generatedNotes.content)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all text-slate-700"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => downloadAsWord(`${generatedNotes.subject} - ${generatedNotes.topic}`, generatedNotes.content)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Word
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh]">
                  <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
                    {/* Render simple markdown lines */}
                    {generatedNotes.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-6 mt-2">{line.replace('# ', '')}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-4 mt-8">{line.replace('## ', '')}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-3 mt-6">{line.replace('### ', '')}</h3>;
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={i} className="ml-4 mb-2">{line.replace(/^[-*]\s*/, '')}</li>;
                      }
                      if (line.trim() === '') return <div key={i} className="h-4" />;
                      
                      // Basic bolding check
                      const parts = line.split(/(\*\*.*?\*\*)/);
                      return (
                        <p key={i} className="mb-4 leading-relaxed">
                          {parts.map((part, pi) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pi}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </article>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Generated by NoteForge AI on {generatedNotes.timestamp}</span>
                  <div className="flex gap-4">
                     <span className="text-xs text-slate-400">Word count: {generatedNotes.content.split(/\s+/).length} words</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
             <div className="bg-primary-600 p-1.5 rounded-lg">
                <BookOpenCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">NoteForge AI</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Empowering students and professionals with instant, structured study materials powered by advanced AI.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Contact Us</a>
          </div>
          <p className="mt-8 text-xs text-slate-300">© 2024 NoteForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
