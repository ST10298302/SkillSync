/**
 * Google Translate API Service
 * Implements Cloud Translation API v2 for multi-language support (Google, 2025)
 */
interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export class GoogleTranslateAPI {
  private static apiKey: string | null = null;

  static initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async translateText(text: string, targetLanguage: string): Promise<TranslationResponse> {
    if (!this.apiKey) {
      throw new Error('Google Translate API not initialized. Please provide an API key.');
    }

    if (!text.trim()) {
      return { translatedText: text };
    }

    // Don't translate very short text (like single characters) as it might cause issues
    if (text.trim().length <= 1) {
      return { translatedText: text };
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: 'en', // Assuming source is always English
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations[0]) {
        return {
          translatedText: data.data.translations[0].translatedText,
          detectedSourceLanguage: data.data.translations[0].detectedSourceLanguage,
        };
      } else {
        throw new Error('Invalid response format from Google Translate API');
      }
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text. Please check your internet connection and API key.');
    }
  }

  static async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Google Translate API not initialized. Please provide an API key.');
    }

    if (texts.length === 0) {
      return [];
    }

    // Filter out very short text (like single characters) as they might cause issues
    const validTexts = texts.filter(text => text.trim().length > 1);
    const shortTexts = texts.filter(text => text.trim().length <= 1);

    if (validTexts.length === 0) {
      return texts; // Return original texts if all are too short
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: texts,
            target: targetLanguage,
            source: 'en',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.translations) {
        const translatedValidTexts = data.data.translations.map((translation: any) => translation.translatedText);
        
        // Reconstruct the original array with translated valid texts and original short texts
        let resultIndex = 0;
        return texts.map(text => {
          if (text.trim().length <= 1) {
            return text; // Keep original short text
          } else {
            return translatedValidTexts[resultIndex++]; // Use translated text
          }
        });
      } else {
        throw new Error('Invalid response format from Google Translate API');
      }
    } catch (error) {
      console.error('Batch translation error:', error);
      throw new Error('Failed to translate texts. Please check your internet connection and API key.');
    }
  }

  static isInitialized(): boolean {
    return this.apiKey !== null;
  }
}
