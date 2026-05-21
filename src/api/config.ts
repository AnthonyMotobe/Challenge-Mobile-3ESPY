import Constants from 'expo-constants';

export const isMockMode: boolean =
  Constants.expoConfig?.extra?.mockMode === true;

/** Porta HTTP do gateway da API (nginx dev). */
const API_PORT = 8080;

/**
 * Resolve a URL base da API.
 *
 * Ordem de prioridade:
 * 1. Se `app.json → extra.apiBaseUrl` tiver um valor explícito (≠ "auto"), usa ele.
 * 2. Senão, DEDUZ o IP automaticamente: pega o IP do servidor Metro (a forma como
 *    o Expo Go se conectou ao seu notebook) e usa esse mesmo IP na porta 8080.
 *
 * Resultado: ao trocar de Wi-Fi, NÃO precisa editar IP nenhum. Basta o celular
 * estar na mesma rede do notebook — o app descobre o endereço sozinho.
 *
 * Observação: isso funciona em modo LAN (`npx expo start`). Em modo tunnel
 * (`--tunnel`) o Metro fica num host *.exp.direct e o IP local não é exposto;
 * nesse caso defina `extra.apiBaseUrl` manualmente.
 */
export function resolveApiBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiBaseUrl as
    | string
    | undefined;
  if (configured && configured.trim() && configured.trim() !== 'auto') {
    return configured.trim();
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
