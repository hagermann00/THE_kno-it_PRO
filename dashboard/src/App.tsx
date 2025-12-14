import { useState } from 'react';
import {
  Brain,
  Cpu,
  Zap,
  Search,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

// Types aligning with backend
type ResearchDepth = 'flash' | 'budget' | 'quick' | 'standard' | 'verified' | 'deep-dive';

interface ResearchResult {
  topic: string;
  summary: string;
  score: number; // Reliability Score
  confirmed: Array<{
    claim: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  unique: Array<{
    claim: string;
    source: string;
  }>;
  disputed: Array<{
    claim: string;
    agreedBy: string[];
    disputedBy: string[];
  }>;
  metadata: {
    duration: number;
    modelsUsed: string[];
  };
  outliers?: Array<{
    model: string;
    response: string;
    classification: {
      type: string;
      reason: string;
    }
  }>;
}

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [persona, setPersona] = useState('analyst');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Connect to local API we created
      const response = await fetch('http://localhost:3000/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          config: {
            depth,
            primaryModel: selectedModel,
            persona
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError('Connection failed. Ensure backend server is running (npm run server)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-savage-dark text-savage-text font-sans selection:bg-savage-accent selection:text-white pb-20">

      {/* Header */}
      <header className="border-b border-savage-border bg-savage-panel/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-savage-accent/20 p-2 rounded-lg border border-savage-accent/30">
              <Brain className="w-6 h-6 text-savage-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">KNO-IT <span className="text-savage-muted font-normal">// SAVAGE ENGINE</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-savage-muted">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${(!loading && !error) ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></span>
              SYSTEM ACTIVE
            </div>
            <div className="font-mono text-xs opacity-50">v0.2.0</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Input Console */}
        <section className="bg-savage-panel border border-savage-border rounded-xl p-1 shadow-2xl overflow-hidden">
          <div className="bg-savage-dark/50 p-6 space-y-6">

            {/* STRATEGIC MODE SELECTOR */}
            <div className="space-y-4">

              {/* Single Personas */}
              <div>
                <label className="text-xs font-bold text-savage-muted uppercase tracking-wider mb-2 block">Single Lens (Apply to All)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { id: 'analyst', label: 'Analyst', icon: Brain },
                    { id: 'cfo', label: 'CFO (Risk)', icon: Activity },
                    { id: 'cto', label: 'CTO (Tech)', icon: Cpu },
                    { id: 'devils_advocate', label: 'Devil\'s Adv.', icon: AlertTriangle },
                    { id: 'savage', label: 'SAVAGE', icon: Zap }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${persona === p.id
                          ? p.id === 'savage'
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50'
                            : 'bg-savage-accent border-blue-400 text-white shadow-lg shadow-blue-900/50'
                          : 'bg-savage-dark border-savage-border text-savage-muted hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <p.icon className="w-4 h-4" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Squad Simulations */}
              <div>
                <label className="text-xs font-bold text-savage-muted uppercase tracking-wider mb-2 block">Dynamic Simulation (Multi-Model Squads)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { id: 'boardroom', label: 'The Boardroom', icon: Layers },
                    { id: 'yes_no_maybe', label: 'Yes/No/Maybe', icon: Terminal },
                    { id: 'futurecast', label: '[FutureCast]', icon: Activity },
                    { id: 'competency', label: 'Competency', icon: Cpu },
                    { id: 'generational', label: 'Generational', icon: Brain }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${persona === p.id
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                          : 'bg-savage-dark border-savage-border text-savage-muted hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <p.icon className="w-4 h-4" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Model & Depth Config */}
            <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-savage-border/50">
              <div className="flex gap-2 p-1 bg-savage-dark/80 rounded-lg border border-savage-border">
                {['flash', 'standard', 'deep-dive'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d as ResearchDepth)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${depth === d
                        ? 'bg-savage-accent text-white shadow-lg shadow-savage-accent/20'
                        : 'text-savage-muted hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-savage-dark border border-savage-border text-savage-text text-sm rounded-lg focus:ring-savage-accent focus:border-savage-accent block p-2.5 outline-none"
              >
                <option value="gemini-2.5-flash">Gemini Flash (Fast)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Analysis)</option>
                <option value="claude-3-haiku">Claude Haiku (Poetic)</option>
              </select>
            </div>

            {/* Main Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className={`w-6 h-6 ${loading ? 'text-savage-accent animate-pulse' : 'text-savage-muted group-focus-within:text-white'}`} />
              </div>
              <input
                type="text"
                className="block w-full p-4 pl-14 text-lg text-white bg-savage-dark border border-savage-border rounded-lg focus:border-savage-accent focus:ring-4 focus:ring-savage-accent/10 outline-none transition-all placeholder:text-savage-muted/50 font-medium"
                placeholder="Enter research topic (e.g., 'Impact of AI on verify-only coding')..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !topic}
                className="absolute right-2.5 bottom-2.5 bg-savage-accent hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase tracking-wider flex items-center gap-2"
              >
                {loading ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300 fill-current" />}
                {loading ? 'Processing...' : 'Engage'}
              </button>
            </div>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="space-y-6 animate-fade-in">

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-savage-panel p-4 rounded-xl border border-savage-border">
                <div className="text-savage-muted text-xs uppercase tracking-wider mb-1">Status</div>
                <div className="text-green-400 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4" /> COMPLETE
                </div>
              </div>
              <div className="bg-savage-panel p-4 rounded-xl border border-savage-border">
                <div className="text-savage-muted text-xs uppercase tracking-wider mb-1">Duration</div>
                <div className="text-white font-mono font-bold">{result.metadata.duration}ms</div>
              </div>
              <div className="bg-savage-panel p-4 rounded-xl border border-savage-border">
                <div className="text-savage-muted text-xs uppercase tracking-wider mb-1">Models Active</div>
                <div className="text-white font-mono font-bold">{result.metadata.modelsUsed.length}</div>
              </div>
              <div className="bg-savage-panel p-4 rounded-xl border border-savage-border">
                <div className="text-savage-muted text-xs uppercase tracking-wider mb-1">System Trust Score</div>
                <div className={`font-bold text-lg ${(result.score || 0) >= 80 ? 'text-green-400' :
                    (result.score || 0) >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                  }`}>
                  {result.score || 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-savage-panel border border-savage-border rounded-xl p-6 shadow-lg">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-savage-accent" />
                    EXECUTIVE SUMMARY
                  </h2>
                  <div className="prose prose-invert max-w-none text-savage-text leading-relaxed">
                    {result.summary.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Confirmed Facts */}
                <div className="bg-savage-panel border border-savage-border rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    VERIFIED CONSENSUS
                  </h2>
                  <ul className="space-y-3">
                    {result.confirmed.map((fact, i) => (
                      <li key={i} className="flex gap-3 group">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500/50 group-hover:bg-green-400"></div>
                        <span className="text-savage-muted group-hover:text-savage-text transition-colors">{fact.claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar: Outliers & Dissent */}
              <div className="space-y-6">

                {/* Outliers Card */}
                <div className="bg-savage-panel border border-red-900/30 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-24 h-24 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-red-200 mb-4 flex items-center gap-2 relative z-10">
                    <ShieldAlert className="w-5 h-5" />
                    SAVAGE DISSENT
                  </h2>

                  {result.outliers && result.outliers.length > 0 ? (
                    <div className="space-y-4 relative z-10">
                      {result.outliers.map((outlier, i) => (
                        <div key={i} className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="px-2 py-0.5 bg-red-900/50 rounded text-xs font-mono text-red-200 uppercase">{outlier.model}</span>
                            <span className="text-xs text-red-400">{outlier.classification.type}</span>
                          </div>
                          <p className="text-red-100/80 italic">"{outlier.response.substring(0, 100)}..."</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-savage-muted text-sm italic py-4">No significant outliers detected. Consensus is strong.</div>
                  )}
                </div>

                {/* Unique Insights */}
                <div className="bg-savage-panel border border-blue-900/30 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    UNIQUE ALPHA
                  </h2>
                  <div className="space-y-3">
                    {result.unique.slice(0, 3).map((item, i) => (
                      <div key={i} className="text-sm text-savage-text border-l-2 border-blue-500/50 pl-3">
                        {item.claim.substring(0, 100)}...
                      </div>
                    ))}
                    {result.unique.length === 0 && (
                      <div className="text-savage-muted text-sm italic">No unique insights found.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
