'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<any>(null);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const savedLocale =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'en';

    setLocale(savedLocale);

    import(`../../messages/${savedLocale}.json`).then((msgs) => {
      setMessages(msgs.default);
    });
  }, []);

  if (!messages) {
    return <>{children}</>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

