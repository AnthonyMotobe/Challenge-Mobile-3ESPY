import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface QueryDraft {
  brand: string;
  model: string;
  version: string;
  attributes: string[];
}

const DEFAULT_DRAFT: QueryDraft = {
  brand: '',
  model: '',
  version: '',
  attributes: [],
};

interface QueryDraftContextValue {
  draft: QueryDraft;
  setVehicle: (vehicle: Pick<QueryDraft, 'brand' | 'model' | 'version'>) => void;
  setAttributes: (attributes: string[]) => void;
  reset: () => void;
}

const QueryDraftContext = createContext<QueryDraftContextValue | null>(null);

export function QueryDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<QueryDraft>(DEFAULT_DRAFT);

  const setVehicle = useCallback(
    (vehicle: Pick<QueryDraft, 'brand' | 'model' | 'version'>) => {
      setDraft((prev) => ({ ...prev, ...vehicle }));
    },
    [],
  );

  const setAttributes = useCallback((attributes: string[]) => {
    setDraft((prev) => ({ ...prev, attributes }));
  }, []);

  const reset = useCallback(() => setDraft(DEFAULT_DRAFT), []);

  const value = useMemo(
    () => ({ draft, setVehicle, setAttributes, reset }),
    [draft, setVehicle, setAttributes, reset],
  );

  return <QueryDraftContext.Provider value={value}>{children}</QueryDraftContext.Provider>;
}

export function useQueryDraft(): QueryDraftContextValue {
  const ctx = useContext(QueryDraftContext);
  if (!ctx) throw new Error('useQueryDraft must be used inside QueryDraftProvider');
  return ctx;
}
