import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';

export interface ChatAiProvider {
  modelIaId: number;
  modelNm: string;
  chatModel: string;
}

export function useChatAiProviders(initialProvider?: number) {
  const { get } = useFetch<ChatAiProvider[]>();
  const [aiProviders, setAiProviders] = useState<ChatAiProvider[]>([]);
  const [selectedAiProvider, setSelectedAiProviderState] = useState<number | null>(initialProvider ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadAiProviders() {
      const models = await get('/model-ia/opt');

      if (cancelled) {
        return;
      }

      const providers = models ?? [];
      const providerIds = providers.map((provider) => provider.modelIaId);

      setAiProviders(providers);
      setSelectedAiProviderState((currentProvider) => {
        if (providerIds.length === 0) {
          return null;
        }

        return currentProvider && providerIds.includes(currentProvider)
          ? currentProvider
          : providerIds[0];
      });
    }

    queueMicrotask(() => {
      void loadAiProviders();
    });

    return () => {
      cancelled = true;
    };
  }, [get]);

  const setSelectedAiProvider = useCallback((providerId: number) => {
    setSelectedAiProviderState(providerId);
  }, []);

  return { aiProviders, selectedAiProvider, setSelectedAiProvider };
}
