# Ford Scan-to-Spec — App Mobile

App mobile da disciplina **Mobile Development & IoT** (FIAP — 3ESPY) para o
desafio Ford. O fluxo principal é o **Scan-to-Spec com Truth Score**: o usuário
informa marca/modelo/versão (e opcionalmente envia uma imagem ou PDF), e recebe
uma ficha técnica padronizada com nível de confiança por atributo, indicando
fontes e conflitos.

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
| Ficha técnica | `src/screens/query/SpecSheetScreen.tsx` | Ficha final + Truth Score |
| Fontes & conflitos | `src/screens/query/SourcesConflictsScreen.tsx` | Auditoria das fontes |
| Histórico | `src/screens/history/HistoryListScreen.tsx` | Consultas anteriores (com cache offline) |
| Detalhes do histórico | `src/navigation/HistoryStack.tsx` | Reabrir ficha + fontes |
| Perfil | `src/screens/profile/ProfileScreen.tsx` | Sessão + permissões |

---

## 3. Truth Score

Cada atributo retornado pela API vem com `value`, `available`, `normalized_unit`
e `source_hint`. O app converte isso em um score 0–1 que vira badge colorido
+ barra de confiança ([`src/utils/truthScore.ts`](src/utils/truthScore.ts)):

| Sinal | Peso |
|---|---|
| `available=false` | score = 0 (badge "Não encontrado") |
| Fonte oficial (manual, site oficial, ficha técnica) | +0.4 |
| Review/imprensa especializada | +0.2 |
| `normalized_unit` presente | +0.1 |
| Base por atributo disponível | 0.5 |

Score agregado (no topo da ficha) = média de todos os atributos.
Conflitos são detectados quando o mesmo atributo aparece com valores
diferentes na mesma resposta.

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
Qualquer e-mail/senha entra. O fluxo completo funciona — incluindo Truth Score,
conflitos, histórico, scan-to-spec e notificações.

**Pra usar com backend real**: edite `app.json`:

```json
"extra": {
  "apiBaseUrl": "http://<host-da-api>:<porta>",
  "mockMode": false
}
```

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
4. **Ficha técnica** abre com Truth Score agregado, contagem por nível e cards por atributo.
5. **Fontes & conflitos** detalha a origem de cada valor, categoriza (oficial / review / outra) e destaca conflitos.
6. **Notificação local** dispara ao final da extração ("Ficha técnica pronta · Truth Score X%").

---

## 7. Diferenciais entregues

- ✅ **Scan-to-Spec** com câmera + galeria + PDF (`expo-image-picker` + `expo-document-picker`)
- ✅ **Histórico local** em AsyncStorage com fallback offline
- ✅ **Notificação local** ao concluir a extração (`expo-notifications`)
- ✅ **Truth Score** com 4 níveis (alta/média/baixa/faltando), barra de confiança e badge
- ✅ **Refresh automático** de JWT via interceptor axios
- ✅ **Cache de scans** dos últimos 50 anexos
- ✅ **Atualização ao focar** nas telas Home e Histórico (`useFocusEffect`)

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
    ├── navigation/                  # Auth/App/Query/History navigators
    ├── notifications/               # wrapper expo-notifications
    ├── screens/                     # telas (auth, home, query, history, profile)
    ├── storage/                     # SecureStore (tokens) + AsyncStorage (cache)
    ├── theme/                       # colors, spacing, typography
    ├── types/                       # tipos da API
    └── utils/                       # truthScore + detecção de conflitos
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
3. **Atributos** → toca em "Todos" pra selecionar os 14 atributos
4. **Scan-to-Spec** → tira uma foto ou pega da galeria
5. **Processing** → mostra os 4 steps animados
6. **Ficha técnica** → mostra Truth Score agregado + 14 atributos com badge de confiança
7. **Fontes & Conflitos** → mostra categorização (oficial/review/outra)
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
