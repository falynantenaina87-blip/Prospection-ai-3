import React, { useState, useCallback } from 'react';
import { SearchParams, BusinessLead } from './types';
import SearchForm from './components/SearchForm';
import LeadCard from './components/LeadCard';
import ExportButton from './components/ExportButton';
import { searchBusinesses, analyzeLead } from './services/geminiService';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsSearching(true);
    setError(null);
    setLeads([]);
    setStatusMessage(`Recherche de ${params.keyword} à ${params.location} via Google Maps...`);

    try {
      // Step 1: Discovery
      const foundLeads = await searchBusinesses(params.keyword, params.location);
      
      if (foundLeads.length === 0) {
        setError("Aucune entreprise trouvée. Essayez une localisation plus précise ou un autre mot-clé.");
        setIsSearching(false);
        return;
      }

      setLeads(foundLeads);
      setStatusMessage(`${foundLeads.length} entreprises trouvées. Démarrage de l'audit IA...`);
      setIsSearching(false);
      setIsAnalyzing(true);

      // Step 2: Analysis (Sequential to avoid rate limits on demo keys, or parallel batches)
      // We will do a simple batch processing here
      const analyzedLeads = [...foundLeads];
      
      // Process in chunks of 3 for concurrency without hitting simple rate limits too hard
      const BATCH_SIZE = 3;
      for (let i = 0; i < analyzedLeads.length; i += BATCH_SIZE) {
        const batch = analyzedLeads.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (lead) => {
          // Update status to analyzing
          setLeads(prev => prev.map(p => p.id === lead.id ? { ...p, status: 'analyzing' } : p));
          
          // Perform Analysis
          const result = await analyzeLead(lead);
          
          // Update lead with result
          setLeads(prev => prev.map(p => p.id === lead.id ? {
            ...p,
            ...result,
            status: 'complete'
          } : p));
        }));
      }

      setIsAnalyzing(false);
      setStatusMessage("Audit terminé !");

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la prospection.");
      setIsSearching(false);
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 bg-opacity-90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">ProspectIA</h1>
              <p className="text-xs text-slate-400">Automatisation de leads par Google Gemini</p>
            </div>
          </div>
          <div>
             {/* Optional header actions */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        <div className="mb-12">
          <SearchForm onSearch={handleSearch} isLoading={isSearching || isAnalyzing} />
        </div>

        {/* Status / Error Area */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {statusMessage && !error && (leads.length > 0 || isSearching) && (
          <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between text-slate-400 text-sm bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
             <span className="flex items-center gap-2">
                {isAnalyzing && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                {statusMessage}
             </span>
             {leads.length > 0 && (
                <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded text-white">
                  {leads.filter(l => l.status === 'complete').length} / {leads.length}
                </span>
             )}
          </div>
        )}

        {/* Results Grid */}
        {leads.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">2.</span> Résultats & Audits
              </h2>
              <ExportButton leads={leads.filter(l => l.status === 'complete')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State / Intro */}
        {!isSearching && leads.length === 0 && !error && (
          <div className="text-center text-slate-500 mt-20 max-w-lg mx-auto">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">Prêt à prospecter ?</h3>
            <p className="text-sm">
              Entrez un métier (ex: "Restaurant Italien") et une ville. L'IA va scanner Google Maps, 
              trouver les prospects, et générer un audit technique pour chacun.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;