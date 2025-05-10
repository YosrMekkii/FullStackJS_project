import Tesseract from 'tesseract.js';
import OpenAI from 'openai';

// Configurer OpenAI (clé gratuite possible)
const openai = new OpenAI({
  apiKey: "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", // Remplacez ou utilisez process.env
});

export async function checkCertificate(imagePath) {
  try {
    // 1. Extraire le texte avec Tesseract (gratuit)
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'fra', // Langue française
      { logger: m => console.log(m) }
    );

    // 2. Analyser avec GPT-3.5 (gratuit pour les faibles usages)
    const prompt = `
    Analyse ce texte et détermine s'il s'agit d'un certificat valide. 
    Critères : 
    - Présence d'un nom, d'une date et d'une autorité émettrice.
    - Langage formel.
    Texte à analyser :
    ${text}
    Réponds au format JSON : { "valid": boolean, "reason": string }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Erreur :", err);
    return { valid: false, reason: "Échec de l'analyse" };
  }
}

