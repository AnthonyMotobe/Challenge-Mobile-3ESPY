import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface QueryAttachment {
  uri: string;
  name: string;
  mimeType: string;
  kind: 'image' | 'pdf';
  size?: number;
}

export interface QueryDraft {
  brand: string;
  model: string;
  version: string;
  attributes: string[];
  attachments: QueryAttachment[];
}

const DEFAULT_DRAFT: QueryDraft = {
  brand: '',
  model: '',
  version: '',
  attributes: [],
  attachments: [],
};

interface QueryDraftContextValue {
  draft: QueryDraft;
  setVehicle: (vehicle: Pick<QueryDraft, 'brand' | 'model' | 'version'>) => void;
  setAttributes: (attributes: string[]) => void;
  addAttachment: (attachment: QueryAttachment) => void;
  removeAttachment: (uri: string) => void;
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

  const addAttachment = useCallback((attachment: QueryAttachment) => {
    setDraft((prev) => {
      if (prev.attachments.some((a) => a.uri === attachment.uri)) return prev;
      return { ...prev, attachments: [...prev.attachments, attachment] };
    });
  }, []);

  const removeAttachment = useCallback((uri: string) => {
    setDraft((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.uri !== uri),
    }));
  }, []);

  const reset = useCallback(() => setDraft(DEFAULT_DRAFT), []);

  const value = useMemo(
    () => ({ draft, setVehicle, setAttributes, addAttachment, removeAttachment, reset }),
    [draft, setVehicle, setAttributes, addAttachment, removeAttachment, reset],
  );

  return <QueryDraftContext.Provider value={value}>{children}</QueryDraftContext.Provider>;
}

export function useQueryDraft(): QueryDraftContextValue {
  const ctx = useContext(QueryDraftContext);
  if (!ctx) throw new Error('useQueryDraft must be used inside QueryDraftProvider');
  return ctx;
}
