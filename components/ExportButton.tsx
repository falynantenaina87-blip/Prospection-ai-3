import React from 'react';
import { Download } from 'lucide-react';
import { BusinessLead } from '../types';

interface ExportButtonProps {
  leads: BusinessLead[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ leads }) => {
  const handleExport = () => {
    const validLeads = leads.filter(l => l.priorityStatus !== 'DO_NOT_CONTACT');
    if (validLeads.length === 0) return;

    // Define CSV headers
    const headers = [
      'Nom',
      'Statut Priorité',
      'Email Vérifié',
      'Téléphone',
      'Adresse',
      'Site Web',
      'Note Google',
      'Sécurisé (HTTPS)',
      'Mobile Friendly',
      'Faille Technique',
      'Argumentaire Vente'
    ];

    // Map data to CSV rows
    const rows = validLeads.map(lead => [
      lead.name,
      lead.priorityStatus || 'NORMAL',
      lead.email || 'Non trouvé',
      lead.phone || '',
      `"${(lead.address || '').replace(/"/g, '""')}"`,
      lead.website || 'N/A',
      lead.rating || 'N/A',
      lead.isHttps ? 'Oui' : 'Non',
      lead.isResponsive ? 'Oui' : 'Non',
      `"${(lead.digitalWeakness || '').replace(/"/g, '""')}"`,
      `"${(lead.salesPitch || '').replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prospects_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleExport}
        disabled={leads.filter(l => l.priorityStatus !== 'DO_NOT_CONTACT').length === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          leads.length === 0
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
        }`}
      >
        <Download className="w-4 h-4" />
        Exporter CSV Validés
      </button>
      <span className="text-[10px] text-slate-500 mt-1 mr-1">
        *Exclut les "À ne pas contacter"
      </span>
    </div>
  );
};

export default ExportButton;