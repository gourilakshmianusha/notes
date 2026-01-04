
import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  FileDown, 
  BookOpenCheck,
  Cpu,
  History,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';
import { generateNotes } from './services/geminiService';
import { downloadAsPDF, downloadAsWord } from './utils/exportUtils';
import { NoteData, NoteLevel } from './types';

const STORAGE_KEY = 'note_forge_history';

const App: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<NoteLevel>(NoteLevel.INTERMEDIATE);
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
      const content = await generateNotes(subject, topic, level);
      const newNote: NoteData = {
        subject,
        topic,
        level,
        content,
        timestamp: new Date().toLocaleString(),
      };
      setGeneratedNotes(newNote);
      
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
    setLevel(NoteLevel.INTERMEDIATE);
    setGeneratedNotes(null);
    setError(null);
  };

  const loadFromHistory = (note: NoteData) => {
    setSubject(note.subject);
    setTopic(note.topic);
    setLevel(note.level);
    setGeneratedNotes(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLevelBadgeColor = (l: NoteLevel) => {
    switch (l) {
      case NoteLevel.BEGINNER: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case NoteLevel.INTERMEDIATE: return 'bg-amber-100 text-amber-700 border-amber-200';
      case NoteLevel.ADVANCED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg shadow-sm">
                <BookOpenCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">NoteForge <span className="text-primary-600">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-100">
                <Award className="w-3.5 h-3.5" /> Practical Guides
              </span>
            </div>
            <button className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
              <Search className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-500" />
                Generator Settings
              </h2>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Engine Assembly Workflow"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Complexity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(NoteLevel).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                          level === lvl 
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-100 active:scale-[0.98]"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                    {loading ? 'Synthesizing Steps...' : 'Generate Step-by-Step Notes'}
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200 text-sm"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>

            {history.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  Recent Notes
                </h2>
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all group flex items-start gap-3"
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        item.level === NoteLevel.BEGINNER ? 'bg-emerald-400' :
                        item.level === NoteLevel.INTERMEDIATE ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-800 text-sm truncate">{item.topic}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{item.subject} • {item.level}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {!generatedNotes && !loading && !error && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl h-[500px] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-slate-50 p-6 rounded-3xl mb-4">
                  <CheckCircle2 className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Learn by Doing</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Generate detailed, step-by-step practical guides for any topic. Choose a complexity level to get started.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-8 max-w-lg">
                   <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Actionable</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                        <Layers className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Level-Aware</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100">
                        <FileDown className="w-6 h-6 text-primary-600" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Exportable</span>
                   </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-slate-50 border-t-primary-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-10 h-10 text-primary-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Crafting Step-by-Step Guide</h3>
                <p className="text-slate-500 mt-3 max-w-md">
                  Organizing complex tasks into logical, actionable steps for a {level} level understanding.
                </p>
                <div className="mt-8 flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-full border border-slate-100">
                   <div className="w-2 h-2 bg-primary-600 rounded-full animate-ping" />
                   <span className="text-xs font-bold text-slate-600">Cross-referencing practical applications...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 text-red-700 animate-in fade-in zoom-in duration-300">
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
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold text-primary-600 uppercase tracking-[0.2em]">{generatedNotes.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLevelBadgeColor(generatedNotes.level)}`}>
                        {generatedNotes.level}
                      </span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{generatedNotes.topic}</h2>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Verified Practical Blueprint • {generatedNotes.timestamp}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadAsPDF(`${generatedNotes.topic}`, generatedNotes.content)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 shadow-sm active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => downloadAsWord(`${generatedNotes.topic}`, generatedNotes.content)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200 active:scale-95"
                    >
                      <FileDown className="w-4 h-4" />
                      Word
                    </button>
                  </div>
                </div>

                <div className="p-10 md:p-14 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-extrabold prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-blockquote:border-primary-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                    {generatedNotes.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-extrabold mb-10 text-slate-900 border-b pb-4">{line.replace('# ', '')}</h1>;
                      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-6 mt-12 flex items-center gap-2 text-slate-800"><div className="w-2 h-8 bg-primary-500 rounded-full" />{line.replace('## ', '')}</h2>;
                      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-4 mt-8 text-slate-800 underline decoration-primary-200 underline-offset-4">{line.replace('### ', '')}</h3>;
                      
                      // Handle Step-by-Step numbered lists
                      if (/^\d+\.\s/.test(line)) {
                        return (
                          <li key={i} className="ml-6 mb-4 list-decimal marker:text-primary-600 font-medium pl-2 bg-primary-50/30 p-3 rounded-lg border-l-4 border-primary-200">
                             <div className="flex flex-col gap-1">
                                {line.replace(/^\d+\.\s*/, '').split(/(\*\*.*?\*\*|`.*?`)/).map((part, pi) => {
                                  if (part.startsWith('**') && part.endsWith('**')) return <strong key={pi}>{part.slice(2, -2)}</strong>;
                                  if (part.startsWith('`') && part.endsWith('`')) return <code key={pi} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-primary-700">{part.slice(1, -1)}</code>;
                                  return part;
                                })}
                             </div>
                          </li>
                        );
                      }

                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={i} className="ml-6 mb-3 list-disc marker:text-primary-500">{line.replace(/^[-*]\s*/, '')}</li>;
                      }
                      if (line.startsWith('> ')) return <blockquote key={i} className="italic my-6 bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg">{line.replace('> ', '')}</blockquote>;
                      if (line.trim() === '') return <div key={i} className="h-6" />;
                      
                      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/);
                      return (
                        <p key={i} className="mb-5 leading-loose">
                          {parts.map((part, pi) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pi} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
                            }
                            if (part.startsWith('`') && part.endsWith('`')) {
                              return <code key={pi} className="bg-slate-100 px-1.5 py-0.5 rounded text-primary-700 font-mono text-sm border border-slate-200/50">{part.slice(1, -1)}</code>;
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </article>
                </div>

                <div className="px-10 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400 font-medium">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-primary-400" />
                      {generatedNotes.content.split(/\s+/).length} Words
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      Practical Workflow Included
                    </div>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-slate-300">Actionable Knowledge</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
             <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-100">
                <BookOpenCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">NoteForge AI</span>
          </div>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
            NoteForge AI helps you master any subject with detailed, actionable, and step-by-step notes tailored to your current expertise.
          </p>
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-300">
            <p>© 2025 NoteForge AI. Structured Learning & Practical Guides.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-slate-500 transition-colors">Documentation</a>
               <a href="#" className="hover:text-slate-500 transition-colors">Privacy</a>
               <a href="#" className="hover:text-slate-500 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
