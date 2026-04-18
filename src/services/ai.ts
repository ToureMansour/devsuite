import { Command } from "../core/types";

const API_KEY = process.env.GROQ_API_KEY;
console.log('GROQ_API_KEY:', API_KEY ? '✓ Found' : '✗ Missing');

const groqAPI = async (messages: any[], systemInstruction?: string) => {
  const allMessages = systemInstruction ? [{ role: 'system', content: systemInstruction }, ...messages] : messages;
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const aiService = {
  async searchDynamicCommand(query: string): Promise<Command[]> {
    if (!API_KEY) {
      console.warn("GROQ_API_KEY is missing. Dynamic search disabled.");
      return [];
    }
    if (!query || query.length < 3) return [];

    try {
      const response = await groqAPI([{
        role: 'user',
        content: `Tu es un expert en CLI. L'utilisateur recherche une commande liée à : "${query}". 
        Génère une liste de 3 commandes réelles et utiles au format JSON. 
        Chaque objet doit avoir: commandId (string), command (la commande), description (français), category (catégorie tech), tags (array de strings).
        
        Réponds uniquement avec le JSON, sans autre texte.`
      }]);

      if (response) {
        const results = JSON.parse(response);
        // Map back to our Command interface (matching commandId to id)
        return results.map((r: any) => ({
          ...r,
          id: r.commandId || `ai-${Math.random()}`
        }));
      }
      return [];
    } catch (error) {
      console.error("Groq search error:", error);
      return [];
    }
  },

  async askChat(question: string): Promise<string> {
    if (!API_KEY) return "Veuillez configurer votre clé API Groq pour utiliser le chat.";

    try {
      const response = await groqAPI([{
        role: 'user',
        content: question
      }], "Tu es l'assistant de DevCommande. Réponds aux développeurs de manière concise. Fournis des commandes précises.");
      
      return response || "Je n'ai pas pu générer de réponse.";
    } catch (error) {
      console.error("Groq chat error:", error);
      return "Désolé, une erreur technique est survenue. Veuillez réessayer.";
    }
  }
};
