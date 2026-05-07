
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Quote, 
  Library, 
  Tag, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configurações e Tipos ---
const API_URL = 'https://api-frases-1.onrender.com';

interface QuoteType {
  id: string;
  text: string;
  author: string;
  category: string;
}

type View = 'random' | 'all' | 'category' | 'create';

// --- Componentes de UI Auxiliares ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm ${className}`}
  >
    {children}
  </motion.div>
);

const Button = ({ children, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
    danger: "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20",
    ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-white"
  };
  return (
    <button 
      {...props} 
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant as keyof typeof variants]} ${props.className}`}
    >
      {children}
    </button>
  );
};

// --- Componente Principal ---

export default function QuoteVault() {
  const [view, setView] = useState<View>('random');
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');

  // Fetch Centralizado
  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quotes/`);
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Erro ao conectar com a API", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Deseja excluir esta frase?")) return;
    try {
      await fetch(`${API_URL}/quotes/${id}`, { method: 'DELETE' });
      showToast("Frase removida!", "success");
      fetchQuotes();
    } catch (err) {
      showToast("Erro ao excluir", "error");
    }
  };

  const createQuote = async (quoteData: Omit<QuoteType, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/quotes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });
      if (res.ok) {
        showToast("Frase adicionada!", "success");
        fetchQuotes();
        setView('all');
      } else {
        showToast("Erro ao adicionar", "error");
      }
    } catch (err) {
      showToast("Erro ao conectar", "error");
    }
  };

  // Filtros
  const filteredQuotes = quotes.filter(q => 
    q.text.toLowerCase().includes(search.toLowerCase()) || 
    q.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-indigo-500/30">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-zinc-900 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-red-500/50 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto min-h-screen">
        
        {/* Sidebar - Desktop */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-950/50 sticky top-0 h-auto lg:h-screen">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Quote className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Quote<span className="text-indigo-500">Vault</span></h1>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {[
              { id: 'random', icon: LayoutDashboard, label: 'Inspiração' },
              { id: 'all', icon: Library, label: 'Biblioteca' },
              { id: 'category', icon: Tag, label: 'Categorias' },
              { id: 'create', icon: PlusCircle, label: 'Adicionar' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap flex-1 lg:flex-none ${
                  view === item.id 
                  ? 'bg-zinc-800 text-white shadow-inner' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {view === item.id && <motion.div layoutId="active" className="ml-auto hidden lg:block"><ChevronRight size={16} /></motion.div>}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden lg:block p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Status da API</p>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {quotes.length} frases salvas
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* View: RANDOM */}
            {view === 'random' && (
              <motion.div 
                key="random"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Descobrir</h2>
                    <p className="text-zinc-500">Uma dose diária de sabedoria.</p>
                  </div>
                  <Button variant="secondary" onClick={fetchQuotes} disabled={loading}>
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  </Button>
                </header>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <Card className="relative aspect-video flex flex-col justify-center items-center text-center p-12 overflow-hidden">
                    <Quote className="text-zinc-800 absolute top-10 left-10" size={80} />
                    {loading ? (
                      <div className="space-y-4 w-full">
                        <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto animate-pulse" />
                        <div className="h-4 bg-zinc-800 rounded w-1/2 mx-auto animate-pulse" />
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                          return (
                            <>
                              <p className="text-2xl md:text-3xl font-serif italic text-zinc-100 leading-relaxed z-10">
                                "{randomQuote?.text || 'Carregando...'}"
                              </p>
                              <p className="mt-8 text-indigo-400 font-medium tracking-wide">
                                — {randomQuote?.author || 'Autor'}
                              </p>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </Card>
                </div>
              </motion.div>
            )}

            {/* View: ALL */}
            {view === 'all' && (
              <motion.div key="all" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-3xl font-bold text-white">Biblioteca</h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar sabedoria..." 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuotes.map((q) => (
                    <Card key={q.id} className="group hover:border-zinc-700 transition-colors">
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded-md">
                            {q.category || 'Geral'}
                          </span>
                        </div>
                        <p className="text-zinc-200 italic mb-6 flex-1">"{q.text}"</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-sm font-medium text-zinc-500">{q.author}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" className="p-2 h-9 w-9"><Edit3 size={16} /></Button>
                            <Button variant="danger" className="p-2 h-9 w-9" onClick={() => deleteQuote(q.id)}><Trash2 size={16} /></Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* View: CREATE */}
            {view === 'create' && (
              <motion.div key="create" className="max-w-xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Nova Frase</h2>
                  <p className="text-zinc-500">Contribua com o acervo coletivo.</p>
                </div>
                <Card>
                  <form className="space-y-5" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = {
                      text: formData.get('text') as string,
                      author: formData.get('author') as string,
                      category: formData.get('category') as string
                    };
                    createQuote(data);
                    e.currentTarget.reset();
                  }}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Conteúdo da frase</label>
                      <textarea 
                        name="text"
                        required
                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-32 resize-none"
                        placeholder="O que você está pensando?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Autor</label>
                        <input name="author" type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ex: Sêneca" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Categoria</label>
                        <input name="category" type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ex: Estoicismo" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg">
                      <PlusCircle size={20} /> Salvar Frase
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}