import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && location.trim()) {
      onSearch({ keyword, location });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-blue-400">1.</span> Configuration de la recherche
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <label htmlFor="keyword" className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">Secteur / Mot-clé</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              id="keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ex: Boulangerie, Plombier, Avocat"
              className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="flex-1 relative">
          <label htmlFor="location" className="block text-xs text-slate-400 mb-1 ml-1 uppercase font-bold tracking-wider">Localisation</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ex: Lyon, Paris 15, Bordeaux"
              className="w-full bg-slate-900 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 ${
              isLoading
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
            }`}
          >
            {isLoading ? 'Recherche...' : 'Lancer'}
          </button>
        </div>
      </form>
      <p className="text-xs text-slate-500 mt-3 text-center">
        Propulsé par Google Gemini 2.5 (Maps) & Gemini 3.0 (Audit)
      </p>
    </div>
  );
};

export default SearchForm;