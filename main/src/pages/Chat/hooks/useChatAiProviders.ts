import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';

interface ModelIaResponse {
  modelIaId: number;
  modelNm: string;
  active: boolean;
}

export function useChatAiProviders(initialProvider?: number) {
  const { get } = useFetch<ModelIaResponse[]>();
  const [aiProviders, setAiProviders] = useState<number[]>([]);
  const [selectedAiProvider, setSelectedAiProviderState] = useState<number | null>(initialProvider ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadAiProviders() {
      const models = await get('/model-ia');

      if (cancelled) {
        return;
      }

      const providerIds = (models ?? []).map((model) => model.modelIaId);
      setAiProviders(providerIds);
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
