# Ford Scan-to-Spec — App Mobile

App mobile da disciplina **Mobile Development & IoT** (FIAP — 3ESPY) para o
desafio Ford. O fluxo principal é o **Scan-to-Spec**: o usuário informa
marca/modelo/versão (e opcionalmente envia uma imagem ou PDF), e recebe uma
ficha técnica padronizada — cada atributo aparece com o **valor** e a **fonte**
de onde a informação foi extraída.

> **Escopo deste repositório:** contém **apenas o aplicativo mobile**
> (React Native + Expo). A API REST é um projeto **separado**, mantido em seu
> próprio repositório e com ciclo de deploy independente. O app apenas
> **consome** essa API — os endpoints esperados estão na seção 9. Para rodar
> sem nenhum backend, use o **modo Demo** (seção 5).

## Equipe

| Nome | RM |
|---|---|
| Milena Codinhoto da Silva | 554682 |
| Pedro Henrique Martins Alves dos Santos | 558107 |
| Anthony K. Motobe | 558488 |
| Evellyn Valencia | 557929 |
| Felipe Cerboncini Cordeiro | 554909 |

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Runtime | React Native 0.81 + Expo SDK 54 |
| Linguagem | TypeScript 5.9 (strict) |
| Navegação | React Navigation (Native Stack + Bottom Tabs) |
| Estado | React Context (Auth + QueryDraft) |
| HTTP | axios com interceptor de JWT + refresh automático |
| Storage seguro | expo-secure-store (tokens JWT) |
| Cache local | @react-native-async-storage/async-storage (histórico, scans) |
| Câmera / Galeria | expo-image-picker + expo-camera |
| Documentos / PDF | expo-document-picker |
| Notificações locais | expo-notifications |

---

## 2. Telas implementadas (cobertura do enunciado)

| Tela | Arquivo | Demanda atendida |
|---|---|---|
| Login | `src/screens/auth/LoginScreen.tsx` | Auth |
| Registro | `src/screens/auth/RegisterScreen.tsx` | Onboarding |
| Início | `src/screens/home/HomeScreen.tsx` | Tela inicial + recentes |
| Veículo | `src/screens/query/VehicleFormScreen.tsx` | Formulário marca/modelo/versão |
| Atributos | `src/screens/query/AttributeSelectorScreen.tsx` | Seletor de atributos |
| Scan-to-Spec | `src/screens/query/ScanToSpecScreen.tsx` | Upload imagem/PDF/print + câmera |
| Processando | `src/screens/query/ProcessingScreen.tsx` | Estado de extração |
| Ficha técnica | `src/screens/query/SpecSheetScreen.tsx` | Ficha final (valor + fonte) |
| Histórico | `src/screens/history/HistoryListScreen.tsx` | Consultas anteriores (com cache offline) |
| Detalhes do histórico | `src/navigation/HistoryStack.tsx` | Reabrir ficha |
| Comparação — seleção | `src/screens/compare/CompareSelectionScreen.tsx` | Multi-seleção (2-4 consultas) |
| Comparação — resultado | `src/screens/compare/CompareResultScreen.tsx` | Comparativo lado a lado |
| Perfil | `src/screens/profile/ProfileScreen.tsx` | Sessão + permissões |

---

## 3. Ficha técnica — valor + fonte

Cada atributo retornado pela API vem com `value`, `available`, `normalized_unit`
e `source_hint`. A ficha técnica mostra **somente atributos que vieram com dado
real** — atributos sem informação não são exibidos.

Cada card de atributo apresenta:
- **Valor** (com unidade normalizada, quando houver)
- **Fonte** — de onde a informação foi extraída (`source_hint`)

---

## 4. Setup

### Pré-requisitos

- **Node 20+** (recomendo 22 LTS) e npm
- **Expo Go** instalado no celular (Play Store / App Store) **ou** emulador

### Instalação

```bash
cd ford-mobile-app
npm install
npm start
```

No terminal do Expo:
- `a` → abre no Android emulator
- `i` → abre no iOS simulator (macOS)
- escaneie o QR code com Expo Go (Android) ou Câmera (iOS) para abrir no celular

Se sua rede local estiver instável (VPN, adaptadores virtuais, etc),
use tunnel:

```bash
npx expo start --tunnel
```

---

## 5. Modo Demo vs Backend Real

O app tem dois modos, controlados por `app.json → expo.extra.mockMode`:

| Modo | `mockMode` | Origem dos dados | Quando usar |
|---|---|---|---|
| **Demo** | `true` | Fixtures locais com 4 Fords (Ranger Raptor, Mach-E, Maverick, Bronco) | Avaliação offline; demos sem rede; quando o backend não está disponível |
| **Real** | `false` | API REST externa (a do projeto Ford) | Quando há um backend real rodando |

No modo Demo aparece um **badge "MODO DEMO"** amarelo no canto superior direito.
Qualquer e-mail/senha entra. O fluxo completo funciona — incluindo ficha técnica,
histórico, scan-to-spec, comparação e notificações.

**Pra usar com backend real**: edite `app.json` e troque `mockMode` para `false`:

```json
"extra": {
  "apiBaseUrl": "auto",
  "mockMode": false
}
```

### Detecção automática de IP (`apiBaseUrl: "auto"`)

Com `apiBaseUrl` em `"auto"`, o app **descobre sozinho** o endereço do backend:
ele usa o mesmo IP pelo qual o Expo Go se conectou ao Metro, na porta `8080`.
Resultado: ao trocar de Wi-Fi, **não é preciso editar IP** — basta o celular
estar na mesma rede do notebook (modo LAN, `npx expo start`).

Se preferir fixar manualmente, troque `"auto"` por `"http://<host>:8080"`.
Em modo tunnel (`--tunnel`), a detecção não funciona — defina o host à mão.

Depois aperte `r` no terminal do Metro pra recarregar.

---

## 6. Fluxo completo (end-to-end)

1. **Login** ou registro (qualquer credencial entra no modo Demo).
2. **Home** mostra últimas 5 consultas (com cache local para modo offline).
3. **Nova consulta**:
   - Passo 1 — informe marca/modelo/versão (com presets para Ford Ranger Raptor, Maverick etc).
   - Passo 2 — selecione atributos agrupados (motor, transmissão, conforto, comercial) ou crie custom.
   - Passo 3 — opcional: tire foto, escolha da galeria ou envie PDF do manual.
   - Passo 4 — Processing exibe etapas animadas enquanto chama a API.
4. **Ficha técnica** abre listando os atributos encontrados, cada um com valor e fonte.
5. **Comparação** permite escolher 2-4 consultas e ver os veículos lado a lado.
6. **Notificação local** dispara ao final da extração.

---

## 7. Diferenciais entregues

- ✅ **Scan-to-Spec** com câmera + galeria + PDF (`expo-image-picker` + `expo-document-picker`)
- ✅ **Histórico local** em AsyncStorage com fallback offline
- ✅ **Notificação local** ao concluir a extração (`expo-notifications`)
- ✅ **Refresh automático** de JWT via interceptor axios
- ✅ **Cache de scans** dos últimos 50 anexos
- ✅ **Atualização ao focar** nas telas Home e Histórico (`useFocusEffect`)
- ✅ **Comparação lado a lado** de 2-4 veículos com vencedor por atributo e destaque de divergências

---

## 8. Estrutura do código

```
ford-mobile-app/
├── App.tsx                          # bootstrap dos providers
├── app.json                         # config Expo
├── package.json
├── tsconfig.json
├── babel.config.js                  # alias @/ → src/
└── src/
    ├── api/                         # axios + endpoints + mocks
    ├── components/                  # UI reutilizável
    ├── contexts/                    # AuthContext + QueryDraftContext
    ├── navigation/                  # Auth/App/Query/History/Compare navigators
    ├── notifications/               # wrapper expo-notifications
    ├── screens/                     # telas (auth, home, query, history, compare, profile)
    ├── storage/                     # SecureStore (tokens) + AsyncStorage (cache)
    ├── theme/                       # colors, spacing, typography
    ├── types/                       # tipos da API
    └── utils/                       # helpers de comparação + responsividade
```

---

## 9. Endpoints consumidos

| Método | Path | Tela |
|---|---|---|
| POST | `/auth/register` | RegisterScreen |
| POST | `/auth/login` | LoginScreen |
| POST | `/auth/refresh` | interceptor (transparente) |
| GET | `/auth/me` | bootstrap + ProfileScreen |
| POST | `/vehicles/query` | ProcessingScreen |
| GET | `/vehicles/queries` | HomeScreen + HistoryListScreen |
| GET | `/vehicles/queries/{id}` | SpecSheetScreen + HistoryDetail |

Todos esperam JWT no header `Authorization: Bearer <token>` (exceto register/login).
Tipos das respostas estão em [`src/types/api.ts`](src/types/api.ts).

---

## 10. Roteiro de demo (3-4 minutos)

1. **Abre o app** → mostra tela inicial com últimas consultas
2. **Nova consulta** → toca em "Ranger Raptor · 2024" (preset)
3. **Atributos** → toca em "Todos" pra selecionar os atributos
4. **Scan-to-Spec** → tira uma foto ou pega da galeria
5. **Processing** → mostra os 4 steps animados
6. **Ficha técnica** → mostra os atributos encontrados, cada um com valor e fonte
7. **Comparação** → seleciona 2-3 consultas e vê os veículos lado a lado
8. **Histórico** → volta na tab, mostra que a consulta ficou salva

---

## 11. Scripts úteis

```bash
npm start                          # Expo dev server
npx expo start --tunnel            # quando a rede local não coopera
npm run android                    # abre emulador Android
npm run ios                        # abre simulador iOS (macOS)
npm run web                        # web preview
npm run typecheck                  # tsc --noEmit
```
