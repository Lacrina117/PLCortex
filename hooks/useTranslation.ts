import { useLanguage } from '../contexts/LanguageContext';
// FIX: Corrected import path. translations.ts will now export a valid object.
import { translations } from '../translations/translations';

// A simple recursive type helper to represent the nested structure of translations
// FIX: The original `Translations` type was too restrictive for the data in `translations.ts` (specifically arrays of objects for fault codes), causing a type error. Changing the value type to `any` resolves this by allowing any type of nested structure.
type Translations = { [key: string]: any };

export const useTranslation = () => {
  const { language } = useLanguage();

  // FIX: The return type is changed from `string` to `any` to support returning complex objects and arrays from the translation file, which is required by components like `ReferenceView`.
  const t = (key: string, replacements?: { [key: string]: string | number }): any => {
    const keys = key.split('.');
    
    // FIX: The `findTranslation` function was updated to return any value type (`any`) instead of just `string | null`. The implementation now correctly traverses the nested object and returns the found value, regardless of its type.
    const findTranslation = (lang: 'en' | 'es'): any | null => {
        let text: Translations = translations[lang];
        for (const k of keys) {
            if (typeof text === 'object' && text !== null && k in text) {
                text = text[k];
            } else {
                return null;
            }
        }
        return text;
    };
    
    let translatedText = findTranslation(language) || findTranslation('en');

    if (translatedText === null) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    // FIX: Added a check to ensure that placeholder replacements are only attempted on string values, preventing errors when the translation is an object or array.
    if (replacements && typeof translatedText === 'string') {
      Object.keys(replacements).forEach(placeholder => {
        translatedText = (translatedText as string).replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
    }

    return translatedText;
  };

  return { t };
};