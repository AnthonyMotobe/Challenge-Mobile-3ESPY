 Ford Scan-to-Spec — App Mobile

App mobile da disciplina **Mobile Development & IoT** (FIAP — 3ESPY) para o
desafio Ford. O fluxo principal: o usuário informa **marca / modelo / versão**,
escolhe os atributos que quer e recebe uma **ficha técnica padronizada** — cada
atributo aparece com o **valor** e a **fonte** de onde a informação foi extraída.

> **Escopo deste repositório:** contém **apenas o aplicativo mobile**
> (React Native + Expo). A **API REST é um projeto separado**, mantido em seu
> próprio repositório (`Ford-api`), com ciclo de deploy independente. Este app
> apenas **consome** essa API. Para rodar **sem backend nenhum**, use o
> **Modo Demo** (seção 5).

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
| Cache local | @react-native-async-storage/async-storage (histórico de consultas) |
| Notificações locais | expo-notifications |
| Config de ambiente | arquivo `.env` (variáveis `EXPO_PUBLIC_*`) |

---

## 2. Telas implementadas

| Tela | Arquivo | Demanda atendida |
|---|---|---|
| Login | `src/screens/auth/LoginScreen.tsx` | Autenticação |
| Registro | `src/screens/auth/RegisterScreen.tsx` | Onboarding |
| Início | `src/screens/home/HomeScreen.tsx` | Tela inicial + consultas recentes |
| Veículo | `src/screens/query/VehicleFormScreen.tsx` | Formulário marca/modelo/versão |
| Atributos | `src/screens/query/AttributeSelectorScreen.tsx` | Seletor de atributos |
| Processando | `src/screens/query/ProcessingScreen.tsx` | Estado da extração |
| Ficha técnica | `src/screens/query/SpecSheetScreen.tsx` | Ficha final (valor + fonte) |
| Histórico | `src/screens/history/HistoryListScreen.tsx` | Consultas anteriores (cache offline) |
| Detalhes do histórico | `src/navigation/HistoryStack.tsx` | Reabrir uma ficha salva |
| Comparação — seleção | `src/screens/compare/CompareSelectionScreen.tsx` | Multi-seleção (2-4 consultas) |
| Comparação — resultado | `src/screens/compare/CompareResultScreen.tsx` | Placar comparativo |
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

- **Node 20+** (recomendado: 22 LTS) e npm
- **Expo Go** instalado no celular (Play Store / App Store) **ou** um emulador

### Instalação

```bash
cd ford-mobile-app
npm install
cp .env.example .env
```

Depois, escolha um dos dois modos de execução na **seção 5**.

---

## 5. Como rodar — escolha o modo

O app roda de **duas formas**, controladas pela variável `EXPO_PUBLIC_MOCK_MODE`
no arquivo `.env`. Escolha conforme o que você quer testar:

### 🟢 Modo Demo — sem backend (mais simples)

Use para avaliar o app **sem depender da API**. Dados locais (fixtures de 4
Fords), funciona 100% offline.

**1.** No arquivo `.env`, deixe:
```
EXPO_PUBLIC_MOCK_MODE=true
```

**2.** Inicie o app:
```bash
npx expo start --clear
```

**3.** Abra no Expo Go (QR code) ou no navegador (`w`).

Pronto. Aparece um badge **"MODO DEMO"** amarelo no topo, **qualquer e-mail/senha
entra**, e o fluxo completo funciona — ficha técnica, histórico, comparação e
notificações — tudo com dados simulados.

### 🔵 Modo Real — consumindo a API

Use para testar a integração de verdade. **Requer o backend `Ford-api` rodando**
(é um projeto separado, em outro repositório).

**1.** Suba o backend. No projeto **`Ford-api`**:
```bash
docker compose up
```
Aguarde estabilizar (~30s) e confirme que respondeu:
```bash
curl http://localhost:8080
# → {"service":"ford-api-gateway","status":"ok","mode":"dev-http"}
```

**2.** No arquivo `.env` deste app, deixe:
```
EXPO_PUBLIC_MOCK_MODE=false
EXPO_PUBLIC_API_URL=auto
```

**3.** Inicie o app:
```bash
npx expo start --clear
```

**4.** Abra no Expo Go ou no navegador (`w`). O badge "MODO DEMO" **não aparece**
— o app está consumindo a API real. Registre uma conta e faça uma consulta.

> **Importante:** sempre que mudar o `.env`, reinicie o Metro com `--clear`.
> As variáveis `EXPO_PUBLIC_*` são embutidas no bundle no momento do build.

#### Problemas comuns no Modo Real

| Sintoma | Causa provável | Solução |
|---|---|---|
| `502 Bad Gateway` | nginx com IP defasado de um serviço | No `Ford-api`: `docker compose restart nginx` |
| `Network Error` no app | backend não respondeu | Confirme o `curl http://localhost:8080` |
| Continua em "MODO DEMO" | Metro não releu o `.env` | Pare o Metro e rode `npx expo start --clear` |

---

## 6. Configuração — arquivo `.env`

O `.env` fica na raiz do projeto e **não vai para o git** (cada máquina tem o
seu). O que é versionado é o template **`.env.example`**.

| Variável | Valores | O que faz |
|---|---|---|
| `EXPO_PUBLIC_MOCK_MODE` | `true` / `false` | `true` = Modo Demo (dados locais); `false` = consome a API real |
| `EXPO_PUBLIC_API_URL` | `auto` ou `http://host:8080` | Endereço da API. `auto` detecta o IP do host automaticamente (modo LAN). Em tunnel, fixe o endereço manualmente |

---

## 7. Fluxo de uso (end-to-end)

1. **Login / registro** — no Modo Demo, qualquer credencial entra.
2. **Início** — mostra as últimas consultas (com cache local para uso offline).
3. **Nova consulta** — 3 passos:
   - **Passo 1 — Veículo:** marca, modelo e versão (com presets de Fords).
   - **Passo 2 — Atributos:** selecione os atributos agrupados (motor, transmissão, conforto, comercial) ou crie um personalizado.
   - **Passo 3 — Processando:** o app chama a API e monta a ficha.
4. **Ficha técnica** — lista os atributos encontrados, cada um com valor e fonte.
5. **Comparação** — escolha 2-4 consultas e veja o placar comparativo (seção 8).
6. **Notificação local** dispara ao final da extração.

---

## 8. Comparação de veículos

A tela de comparação trata o confronto como um **placar de competição**:

- Cada **atributo numérico** (potência, torque, 0-100, preço, autonomia…) tem um
  **vencedor** — quem tem o melhor valor leva o ponto.
- Um **placar** no topo soma as vitórias e mostra o ranking com medalhas 🥇🥈🥉.
- Cada card de atributo destaca o veículo vencedor (🏆) e mostra valor + fonte
  de cada veículo.
- Atributos de texto (motor, transmissão) são comparados, mas não têm vencedor.

---

## 9. Diferenciais entregues

- ✅ **Modo Demo offline** — app 100% funcional sem backend, com dados locais
- ✅ **Detecção automática de IP** da API (`EXPO_PUBLIC_API_URL=auto`)
- ✅ **Histórico local** em AsyncStorage com fallback offline
- ✅ **Notificação local** ao concluir a extração (`expo-notifications`)
- ✅ **Refresh automático de JWT** via interceptor do axios
- ✅ **Atualização ao focar** nas telas Início e Histórico (`useFocusEffect`)
- ✅ **Comparação** de 2-4 veículos com placar de vitórias e vencedor por atributo
- ✅ **ErrorBoundary** global — uma exceção de tela não derruba o app

---

## 10. Estrutura do código

```
ford-mobile-app/
├── App.tsx                 # bootstrap dos providers + ErrorBoundary
├── app.json                # config do Expo
├── .env / .env.example     # configuração de ambiente (seção 6)
├── package.json
├── tsconfig.json
├── babel.config.js         # alias @/ → src/
└── src/
    ├── api/                # axios, endpoints, mocks e config de ambiente
    ├── components/         # UI reutilizável + AppErrorBoundary
    ├── contexts/           # AuthContext + QueryDraftContext
    ├── navigation/         # navegadores Auth / App / Query / History / Compare
    ├── notifications/      # wrapper de expo-notifications
    ├── screens/            # telas (auth, home, query, history, compare, profile)
    ├── storage/            # SecureStore (tokens) + AsyncStorage (cache)
    ├── theme/              # cores, espaçamentos, tipografia
    ├── types/              # tipos da API
    └── utils/              # helpers de formatação, comparação e responsividade
```

---

## 11. Endpoints consumidos

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
Os tipos das respostas estão em [`src/types/api.ts`](src/types/api.ts).

---

## 12. Roteiro de demo (3-4 minutos)

1. **Abre o app** → tela inicial com as últimas consultas
2. **Nova consulta** → toca no preset "Ranger Raptor · 2024"
3. **Atributos** → toca em "Todos" para selecionar os atributos
4. **Processando** → mostra as etapas animadas da extração
5. **Ficha técnica** → mostra os atributos, cada um com valor e fonte
6. **Comparação** → seleciona 2-3 consultas e mostra o placar comparativo
7. **Histórico** → volta na aba e mostra que a consulta ficou salva

---

## 13. Scripts úteis

```bash
npm start                  # Expo dev server
npx expo start --clear     # reinicia limpando o cache (use após editar o .env)
npx expo start --tunnel    # quando a rede local não coopera
npm run android            # abre no emulador Android
npm run ios                # abre no simulador iOS (macOS)
npm run web                # preview no navegador
npm run typecheck          # tsc --noEmit
```
