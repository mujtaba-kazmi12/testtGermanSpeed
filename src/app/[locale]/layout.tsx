"use client";

import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState, use } from 'react';
import { ToastContainer } from "@/components/toast/Toast";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function LocaleLayout({ children, params }: Props) {
  // Use React.use to unwrap the params Promise
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    if (locale) {
      const loadMessages = async () => {
        const messages = (await import(`@/messages/${locale}.json`)).default;
        setMessages(messages);
      };

      loadMessages();
    }
  }, [locale]);

  if (!messages) {
    // Show a minimal loading state or return null
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastContainer />
      <AnalyticsProvider />
      {children}
    </NextIntlClientProvider>
  );
} 