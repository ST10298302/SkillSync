import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS, TranslationKey } from '../constants/translations';
import { GoogleTranslateAPI } from '../services/googleTranslateAPI';
import { useAuth } from './AuthContext';
import { useSkills } from './SkillsContext';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isTranslating: boolean;
  translateText: (text: string) => Promise<string>;
  translateDynamicContent: (content: any) => Promise<any>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Flag to prevent multiple API initializations
let isApiInitialized = false;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const { user } = useAuth();
  const { skills, updateSkill } = useSkills();

  // Initialize Google Translate API (only once) (Google, 2025)
  useEffect(() => {
    if (!isApiInitialized) {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
      if (apiKey) {
        GoogleTranslateAPI.initialize(apiKey);
        console.log('Google Translate API initialized');
        isApiInitialized = true;
      } else {
        console.warn('Google Translate API key not found in environment variables');
      }
    }
  }, []);

  // Load user's preferred language from storage/database
  useEffect(() => {
    // TODO: Load user's preferred language from Supabase user profile
    // For now, default to English
    setCurrentLanguage('en');
  }, [user?.id]);

  // Returns translated text for a given key, falls back to English if not found
  const t = (key: TranslationKey): string => {
    const translations = TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS];
    if (translations && key in translations) {
      return translations[key as keyof typeof translations];
    }
    // Fallback to English
    return TRANSLATIONS.en[key] || key;
  };

  // Translates dynamic text content using Google Translate API
  const translateText = async (text: string): Promise<string> => {
    if (currentLanguage === 'en' || !text.trim()) {
      return text;
    }

    try {
      const result = await GoogleTranslateAPI.translateText(text, currentLanguage);
      return result.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text if translation fails
    }
  };

  // Recursively translates objects/arrays - handles nested content structures
  const translateDynamicContent = async (content: any): Promise<any> => {
    if (currentLanguage === 'en') return content;

    if (typeof content === 'string') {
      return await translateText(content);
    }

    if (Array.isArray(content)) {
      const translatedArray = [];
      for (const item of content) {
        translatedArray.push(await translateDynamicContent(item));
      }
      return translatedArray;
    }

    if (typeof content === 'object' && content !== null) {
      const translatedObject: any = {};
      for (const [key, value] of Object.entries(content)) {
        // Skip translation for certain keys (like IDs, URLs, etc.)
        if (shouldSkipTranslation(key)) {
          translatedObject[key] = value;
        } else {
          translatedObject[key] = await translateDynamicContent(value);
        }
      }
      return translatedObject;
    }

    return content;
  };

  const shouldSkipTranslation = (key: string): boolean => {
    const skipKeys = [
      'id', 'email', 'url', 'imageUrl', 'createdAt', 'updatedAt', 
      'progress', 'streak', 'totalEntries', 'totalHours', 'entries',
      'userId', 'user_id', 'skillId', 'skill_id'
    ];
    return skipKeys.includes(key);
  };

  const changeLanguage = async (language: SupportedLanguage) => {
    setIsTranslating(true);
    try {
      setCurrentLanguage(language);

      // Update user preference in database
      if (user?.id) {
        // TODO: Update user's language preference in Supabase
        // await updateUserLanguage(user.id, language);
      }

      console.log(` Language changed to: ${SUPPORTED_LANGUAGES[language]}`);
    } catch (error) {
      console.error('Language change failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      isTranslating,
      translateText,
      translateDynamicContent,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
