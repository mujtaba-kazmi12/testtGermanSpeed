"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  
  const handleChange = (newLocale: string) => {
    // Get the current path segments
    const segments = pathname.split('/');
    
    // Replace the locale segment (which is the first one)
    segments[1] = newLocale;
    
    // Reconstruct the path with the new locale
    const newPath = segments.join('/');
    
    // Navigate to the new path
    router.push(newPath);
  };

  // Language names in their native language
  const languageNames: Record<string, string> = {
    en: 'English',
    de: 'Deutsch',
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[130px] h-9">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {languageNames[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 