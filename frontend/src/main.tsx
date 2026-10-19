import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import i18n from './i18n';

function LocalizedDocumentMetadata() {
  useEffect(() => {
    const updateMetadata = (language: string) => {
      document.documentElement.lang = language;
      document.title = i18n.t('documentTitle', { lng: language });
      const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      description?.setAttribute('content', i18n.t('documentDescription', { lng: language }));
    };

    updateMetadata(i18n.language);
    i18n.on('languageChanged', updateMetadata);
    return () => i18n.off('languageChanged', updateMetadata);
  }, []);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocalizedDocumentMetadata />
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e293b', color: '#f1f5f9' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
