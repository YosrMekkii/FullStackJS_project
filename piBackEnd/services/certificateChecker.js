import Tesseract from 'tesseract.js';

export const checkCertificate = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    const lowerText = text.toLowerCase();
    const isCertificat = lowerText.includes('certificat') || lowerText.includes('formation') || lowerText.includes('diplome');

    return {
      valid: isCertificat,
      extractedText: lowerText,
    };
  } catch (error) {
    console.error("Erreur Tesseract OCR :", error);
    return { valid: false, error };
  }
};
