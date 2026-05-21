import Constants from 'expo-constants';

/**
 * Configuração de ambiente do app — lida do arquivo `.env` na raiz do projeto.
 *
 * O Expo injeta automaticamente toda variável prefixada com `EXPO_PUBLIC_`
 * em `process.env` (embutida no bundle no momento do build). Por isso, ao
 * editar o `.env`, é preciso reiniciar o Metro com `npx expo start --clear`.
 *
 * Variáveis usadas (ver `.env.example`):
 *  - EXPO_PUBLIC_API_URL    URL da API ou "auto"
 *  - EXPO_PUBLIC_MOCK_MODE  "true" (demo, dados locais) ou "false" (API real)
 */

/** Porta HTTP do gateway usada na detecção automática (modo "auto"). */
const API_PORT = 8080;

/**
 * Modo demo. Padrão seguro = `true`: sem `.env`, o app roda com dados locais
 * e não tenta bater em backend nenhum.
 */
export const isMockMode: boolean =
  (process.env.EXPO_PUBLIC_MOCK_MODE ?? 'true').trim().toLowerCase() !== 'false';

/**
 * Resolve a URL base da API.
 *
 * 1. Se `EXPO_PUBLIC_API_URL` tiver um valor explícito (≠ "auto"), usa ele.
 * 2. Senão, DEDUZ o IP automaticamente: usa o mesmo IP pelo qual o Expo Go
 *    se conectou ao Metro, na porta 8080. Assim, ao trocar de Wi-Fi, não é
 *    preciso editar nada — basta o celular estar na mesma rede do host.
 *
 * Em modo tunnel (`--tunnel`) a detecção não funciona (o Metro fica num host
 * *.exp.direct); nesse caso, fixe `EXPO_PUBLIC_API_URL` no `.env`.
 */
export function resolveApiBaseUrl(): string {
  const configured = (process.env.EXPO_PUBLIC_API_URL ?? '').trim();
  if (configured && configured.toLowerCase() !== 'auto') {
    return configured;
  }

  // hostUri ex.: "172.16.72.115:8081" (LAN) ou "abc-anonymous-8081.exp.direct" (tunnel)
  const constantsAny = Constants as unknown as {
    expoGoConfig?: { debuggerHost?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  };
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constantsAny.expoGoConfig?.debuggerHost ??
    constantsAny.manifest2?.extra?.expoGo?.debuggerHost ??
    '';

  const host = String(hostUri).split('/')[0].split(':')[0].trim();
  if (host && host !== 'localhost' && !host.endsWith('.exp.direct')) {
    return `http://${host}:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const apiBaseUrl: string = resolveApiBaseUrl();
