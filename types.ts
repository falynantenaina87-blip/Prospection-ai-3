export interface BusinessLead {
  id: string;
  name: string;
  address: string;
  website?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  
  // Enriched Data
  email?: string;
  phone?: string;
  
  // AI Analysis
  isResponsive?: boolean;
  isHttps?: boolean;
  priorityStatus?: 'PRIORITY' | 'NORMAL' | 'DO_NOT_CONTACT';
  statusSummary?: string;
  digitalWeakness?: string; // "Faille technique"
  salesPitch?: string;
  
  status: 'pending' | 'analyzing' | 'complete' | 'error';
}

export interface SearchParams {
  keyword: string;
  location: string;
}

export interface AiAnalysisResult {
  email: string;
  isResponsive: boolean;
  isHttps: boolean;
  priorityStatus: 'PRIORITY' | 'NORMAL' | 'DO_NOT_CONTACT';
  statusSummary: string;
  digitalWeakness: string;
  salesPitch: string;
}