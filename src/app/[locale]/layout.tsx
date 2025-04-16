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
  const { locale } = use(params);
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    if (!locale) return;
    import(`@/messages/${locale}.json`)
      .then((mod) => setMessages(mod.default))
      .catch(() => setMessages(null));
  }, [locale]);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastContainer />
      <AnalyticsProvider />
      {children}
    </NextIntlClientProvider>
  );
}