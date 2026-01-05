import React from 'react';
import { BusinessLead } from '../types';
import { Globe, Star, AlertTriangle, Smartphone, MapPin, Mail, Lock, LockOpen, Zap } from 'lucide-react';

interface LeadCardProps {
  lead: BusinessLead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const isAnalyzed = lead.status === 'complete';
  const isPriority = lead.priorityStatus === 'PRIORITY';
  const isDoNotContact = lead.priorityStatus === 'DO_NOT_CONTACT';

  // Card Border Color Logic
  let borderColor = "border-slate-700 hover:border-slate-500";
  if (isPriority) borderColor = "border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]";
  if (isDoNotContact) borderColor = "border-red-900/50 hover:border-red-900 opacity-75";

  return (
    <div className={`bg-slate-800 rounded-lg border ${borderColor} transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>
      
      {/* Priority Badge */}
      {isPriority && (
        <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current" /> PRIORITAIRE
        </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b border-slate-700 ${isDoNotContact ? 'bg-red-950/20' : 'bg-slate-800/50'}`}>
        <div className="flex justify-between items-start mb-2 pr-16">
          <h3 className="text-lg font-bold text-white leading-tight truncate w-full" title={lead.name}>
            {lead.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
            {lead.rating ? (
                <div className="flex items-center text-yellow-400 text-sm font-medium bg-yellow-400/10 px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current mr-1" />
                {lead.rating} <span className="text-slate-500 ml-1 text-xs">({lead.userRatingCount})</span>
                </div>
            ) : null}
            <div className="flex items-start text-slate-400 text-xs gap-1 max-w-[50%] truncate">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span className="truncate">{lead.address}</span>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {lead.website ? (
            <a 
              href={lead.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  isAnalyzed && !lead.isHttps 
                  ? 'text-red-300 bg-red-400/10 border border-red-500/30' 
                  : 'text-blue-400 hover:text-blue-300 bg-blue-400/10'
              }`}
            >
              {isAnalyzed ? (
                  lead.isHttps ? <Lock className="w-3 h-3 text-emerald-400" /> : <LockOpen className="w-3 h-3" />
              ) : <Globe className="w-3 h-3" />}
              Site Web
            </a>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              Pas de site
            </span>
          )}
        </div>
      </div>

      {/* AI Analysis Body */}
      <div className="p-4 flex-1 flex flex-col gap-3 relative">
        {isDoNotContact && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs shadow-lg transform -rotate-12 border border-red-400">
                    À NE PAS CONTACTER
                </span>
            </div>
        )}

        {lead.status === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-h-[150px] animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs font-mono">Triple vérification en cours...</span>
          </div>
        )}

        {lead.status === 'error' && (
           <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
             Erreur d'analyse
           </div>
        )}

        {isAnalyzed && (
          <>
             {/* Tech Status Row */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-1">
               <div className="flex items-center gap-2 text-slate-300 bg-slate-700/30 p-1.5 rounded">
                    <Smartphone className={`w-3 h-3 ${lead.isResponsive ? 'text-green-400' : 'text-red-400'}`} />
                    <span>{lead.isResponsive ? 'Responsive' : 'Non Mobile'}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-300 bg-slate-700/30 p-1.5 rounded">
                    {lead.isHttps ? <Lock className="w-3 h-3 text-green-400" /> : <LockOpen className="w-3 h-3 text-red-400" />}
                    <span>{lead.isHttps ? 'Sécurisé' : 'Non Séc.'}</span>
               </div>
            </div>

             {/* Email if found */}
             <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-slate-700">
               <span className="text-slate-500">Email:</span>
               <span className={`flex items-center gap-1 truncate max-w-[180px] font-mono ${!lead.email || lead.email === 'Non trouvé' ? 'text-slate-600' : 'text-emerald-300'}`} title={lead.email}>
                 <Mail className="w-3 h-3" /> {lead.email || 'Non trouvé'}
               </span>
            </div>

            {/* Weakness (Critical) */}
            <div className="bg-slate-900 p-2 rounded border border-slate-700/50">
              <p className="text-[10px] uppercase text-slate-500 font-bold mb-0.5">Faille Technique</p>
              <p className="text-xs text-red-300 font-medium">{lead.digitalWeakness}</p>
            </div>

            {/* Sales Pitch */}
            <div className={`${isPriority ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/10'} border p-2 rounded flex-1`}>
              <p className={`text-[10px] uppercase font-bold mb-0.5 ${isPriority ? 'text-amber-400' : 'text-blue-400'}`}>
                Argumentaire {isPriority ? 'Sur Mesure' : ''}
              </p>
              <p className="text-xs text-slate-300 leading-snug italic">
                "{lead.salesPitch}"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadCard;