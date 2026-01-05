import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BusinessLead, AiAnalysisResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Find businesses using Gemini 2.5 Flash with Google Maps Grounding.
 */
export const searchBusinesses = async (keyword: string, location: string): Promise<BusinessLead[]> => {
  try {
    const prompt = `Trouve 20 entreprises correspondant à "${keyword}" à "${location}". 
    Retourne une liste avec leur nom, adresse complète, note moyenne, nombre d'avis, numéro de téléphone et site web si disponible.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (!chunks || chunks.length === 0) {
      return [];
    }

    const candidates = chunks.filter(c => c.maps && c.maps.title);
    
    const parsedLeads: BusinessLead[] = candidates.map((c, i) => ({
        id: `lead-${Date.now()}-${i}`,
        name: c.maps?.title || "Entreprise Inconnue",
        address: c.maps?.address || "Adresse non trouvée",
        googleMapsUri: c.maps?.uri,
        rating: c.maps?.rating,
        userRatingCount: c.maps?.userRatingCount,
        website: c.maps?.websiteUri,
        // Often maps data includes phone, we map it here if available in the opaque chunk object
        // (Note: The SDK types might not expose phone directly in all versions, but we store it if found)
        phone: (c.maps as any)?.phoneNumber, 
        status: 'pending',
    }));

    // Deduplicate based on name
    const uniqueLeads = parsedLeads.filter((lead, index, self) =>
        index === self.findIndex((t) => (
            t.name === lead.name
        ))
    );

    return uniqueLeads;

  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw new Error("Échec de la recherche Google Maps via Gemini.");
  }
};

/**
 * Step 2: Analyze a specific lead using Gemini 3 Flash Preview.
 * Performs Triple Verification: Existence, Tech Audit, Business Relevance.
 */
export const analyzeLead = async (lead: BusinessLead): Promise<AiAnalysisResult> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING, description: "L'email trouvé via le site ou recherche (ou 'Non trouvé')." },
        isResponsive: { type: Type.BOOLEAN, description: "Si le site semble moderne/mobile-friendly." },
        isHttps: { type: Type.BOOLEAN, description: "Si le site utilise HTTPS (sécurisé)." },
        priorityStatus: { 
          type: Type.STRING, 
          enum: ["PRIORITY", "NORMAL", "DO_NOT_CONTACT"],
          description: "PRIORITY si Note > 4.5 ET Site Médiocre/Inexistant. DO_NOT_CONTACT si site mort." 
        },
        statusSummary: { type: Type.STRING, description: "Résumé court : 'OK', 'Site Mort', 'Succès réel mais vitrine défaillante'." },
        digitalWeakness: { type: Type.STRING, description: "La faille technique principale (ex: HTTP, Lent, Pas de site)." },
        salesPitch: { type: Type.STRING, description: "Phrase d'accroche commerciale basée sur la faille." },
      },
      required: ["email", "isResponsive", "isHttps", "priorityStatus", "statusSummary", "digitalWeakness", "salesPitch"],
    };

    // We enable Google Search to allow the model to "browse" for the email and verify site context
    const prompt = `
      Tu es un expert en Lead Generation. Effectue une TRIPLE VÉRIFICATION sur cette entreprise :
      
      Données :
      - Nom : ${lead.name}
      - Site Web : ${lead.website || "Aucun site"}
      - Note Google : ${lead.rating || 0}/5 (${lead.userRatingCount || 0} avis)
      
      Instructions :
      1. VÉRIFICATION EXISTENCE : 
         - Si l'URL est fournie, vérifie si elle semble valide (pas de lien mort évident). 
         - Si le site semble mort ou inaccessible, statut = DO_NOT_CONTACT.
         - Cherche activement un EMAIL sur le web (page contact, footer, annuaires) si non fourni.
         
      2. AUDIT TECHNIQUE :
         - Sécurité : Le lien est-il HTTPS ?
         - Mobile/Design : Le site semble-t-il daté ?
         
      3. PERTINENCE BUSINESS (Calcul du statut) :
         - Si Note Google > 4.5 ET (Pas de site OU Site daté/HTTP) -> C'est un "PROSPECT PRIORITAIRE" (Succès réel mais vitrine défaillante).
         - Si Note faible (< 3.5) -> NORMAL.
         
      Remplis le JSON scrupuleusement.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        tools: [{ googleSearch: {} }], // Enable search to find emails and verify validity
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No analysis generated");

    const analysis = JSON.parse(resultText) as AiAnalysisResult;
    
    // Quick manual override if URL is missing to ensure consistency
    if (!lead.website && analysis.priorityStatus === 'NORMAL' && (lead.rating || 0) > 4.0) {
        analysis.priorityStatus = 'PRIORITY';
        analysis.digitalWeakness = "Absence de site web";
    }

    return analysis;

  } catch (error) {
    console.error(`Error analyzing lead ${lead.name}:`, error);
    return {
      email: "Non trouvé",
      isResponsive: false,
      isHttps: false,
      priorityStatus: "NORMAL",
      statusSummary: "Erreur Analyse",
      digitalWeakness: "Inconnu",
      salesPitch: "Audit indisponible",
    };
  }
};