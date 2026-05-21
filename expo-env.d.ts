/// <reference types="expo/types" />

// Tipagem das variáveis de ambiente do app (definidas no arquivo .env).
// O Expo expõe automaticamente qualquer variável prefixada com EXPO_PUBLIC_.
declare namespace NodeJS {
  interface ProcessEnv {
    /** URL da API. "auto" detecta o IP do host automaticamente (modo LAN). */
    EXPO_PUBLIC_API_URL?: string;
    /** "true" usa dados locais (modo demo); "false" consome a API real. */
    EXPO_PUBLIC_MOCK_MODE?: string;
  }
}
