import { useState, useEffect, useCallback } from 'react';

export interface LanguageInfo {
  /** Primary language tag (e.g., 'en-US') */
  language: string;
  /** Base language code without region (e.g., 'en') */
  baseLang: string;
  /** Region/country code, if present (e.g., 'US') */
  region: string | null;
  /** All preferred languages in order */
  languages: readonly string[];
}

function parseLanguageTag(tag: string): { baseLang: string; region: string | null } {
  const parts = tag.split('-');
  return {
    baseLang: parts[0].toLowerCase(),
    region: parts.length > 1 ? parts.slice(1).join('-') : null,
  };
}

function getLanguageInfo(): LanguageInfo {
  const languages = navigator.languages?.length > 0
    ? navigator.languages
    : [navigator.language || 'en'];

  const primary = languages[0];
  const { baseLang, region } = parseLanguageTag(primary);

  return {
    language: primary,
    baseLang,
    region,
    languages,
  };
}

export function usePreferredLanguage(): LanguageInfo {
  const [info, setInfo] = useState<LanguageInfo>(getLanguageInfo);

  const handleChange = useCallback(() => {
    setInfo(getLanguageInfo());
  }, []);

  useEffect(() => {
    window.addEventListener('languagechange', handleChange);
    return () => {
      window.removeEventListener('languagechange', handleChange);
    };
  }, [handleChange]);

  return info;
}
