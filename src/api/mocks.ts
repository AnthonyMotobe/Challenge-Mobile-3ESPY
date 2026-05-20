import type {
  LoginPayload,
  QueryPayload,
  QueryResponse,
  QuerySummary,
  RegisterPayload,
  SpecOut,
  TokenPair,
  User,
} from '@/types/api';

function uuid(seed: string): string {
  const hex = Array.from(seed)
    .reduce((acc, c) => acc + c.charCodeAt(0).toString(16), '')
    .padEnd(32, '0')
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_USER: User = {
  id: uuid('mock-user'),
  email: 'demo@ford.com',
  role: 'user',
  full_name: 'Demo User (Mock Mode)',
};

const MOCK_TOKENS: TokenPair = {
  access_token: 'mock.access.token',
  refresh_token: 'mock.refresh.token',
  token_type: 'Bearer',
  expires_in: 900,
};

interface FixtureSpec {
  attribute: string;
  value: string | null;
  available: boolean;
  normalized_unit?: string | null;
  source_hint?: string | null;
}

interface VehicleFixture {
  key: string;
  brand: string;
  model: string;
  version: string;
  specs: FixtureSpec[];
}

const FIXTURES: VehicleFixture[] = [
  {
    key: 'ford-ranger-raptor-2024',
    brand: 'Ford',
    model: 'Ranger Raptor',
    version: '2024',
    specs: [
      { attribute: 'motor', value: 'V6 3.0L Nano bi turbo', available: true, source_hint: 'Ford.com - Ficha técnica oficial' },
      { attribute: 'potencia', value: '397 cv @ 5650 RPM', available: true, normalized_unit: 'cv', source_hint: 'Press release oficial Ford' },
      { attribute: 'torque maximo', value: '583 Nm @ 3500 RPM', available: true, normalized_unit: 'Nm', source_hint: 'Manual do proprietário Ford' },
      { attribute: 'transmissao', value: 'AT 10 velocidades com paddle shifters', available: true, source_hint: 'Catálogo oficial Ford' },
      { attribute: 'tracao', value: '4WD permanente', available: true, source_hint: 'Site oficial Ford' },
      { attribute: 'amortecedores', value: 'Live Valve FOX Racing 2.5"', available: true, source_hint: 'Press kit Ford 2024' },
      { attribute: '0-100 km/h', value: '5.8 s', available: true, normalized_unit: 's', source_hint: 'Autoesporte review' },
      { attribute: 'modos de conducao', value: 'Normal, Sport, Escorregadio, Lama, Areia, Rock Crawl, Baja', available: true, source_hint: 'Manual oficial Ford' },
      { attribute: 'modos de volante', value: 'Normal, Sport, Comforto', available: true, source_hint: 'Manual oficial Ford' },
      { attribute: 'modos de escapamento', value: 'Normal, Silencioso, Sport, Baja', available: true, source_hint: 'Quatro Rodas review' },
      { attribute: 'modos de amortecedor', value: 'Normal, Sport, Baja', available: true, source_hint: 'Manual oficial Ford' },
      { attribute: 'farois', value: 'Matrix LED', available: true, source_hint: 'Ficha técnica oficial Ford' },
      { attribute: 'rodas e pneus', value: '17" com 285/70 R17 AT', available: true, source_hint: 'Catálogo oficial Ford' },
      { attribute: 'preco', value: 'R$ 499.000', available: true, normalized_unit: 'BRL', source_hint: 'Webmotors' },
    ],
  },
  {
    key: 'ford-mustang-mach-e-gt-2024',
    brand: 'Ford',
    model: 'Mustang Mach-E',
    version: 'GT 2024',
    specs: [
      { attribute: 'motor', value: 'Dois motores elétricos (dianteiro + traseiro)', available: true, source_hint: 'Ford.com oficial' },
      { attribute: 'potencia', value: '487 cv combinados', available: true, normalized_unit: 'cv', source_hint: 'Ford Press' },
      { attribute: 'torque maximo', value: '860 Nm', available: true, normalized_unit: 'Nm', source_hint: 'Manual oficial' },
      { attribute: 'transmissao', value: 'Direct drive (elétrico)', available: true, source_hint: 'Ford oficial' },
      { attribute: 'tracao', value: 'AWD', available: true, source_hint: 'Catálogo Ford' },
      { attribute: '0-100 km/h', value: '3.7 s', available: true, normalized_unit: 's', source_hint: 'Motor1 review' },
      { attribute: 'autonomia', value: '500 km (WLTP)', available: true, normalized_unit: 'km', source_hint: 'Press release Ford' },
      { attribute: 'bateria', value: '91 kWh', available: true, normalized_unit: 'kWh', source_hint: 'Ficha técnica oficial' },
      { attribute: 'carregamento rapido', value: '150 kW DC', available: true, normalized_unit: 'kW', source_hint: 'Ford oficial' },
      { attribute: 'preco', value: 'R$ 549.000', available: true, normalized_unit: 'BRL', source_hint: 'iCarros' },
      { attribute: 'farois', value: 'LED Matrix adaptativo', available: true, source_hint: 'Catálogo Ford' },
      { attribute: 'central multimidia', value: 'SYNC 4A 15.5"', available: true, source_hint: 'Ford oficial' },
      { attribute: 'rodas e pneus', value: '20" Pirelli P Zero', available: true, source_hint: 'Quatro Rodas review' },
      { attribute: 'garantia', value: null, available: false, source_hint: null },
    ],
  },
  {
    key: 'ford-maverick-tremor-2024',
    brand: 'Ford',
    model: 'Maverick',
    version: 'Tremor 2024',
    specs: [
      { attribute: 'motor', value: '2.0 EcoBoost', available: true, source_hint: 'Ford.com' },
      { attribute: 'potencia', value: '253 cv', available: true, normalized_unit: 'cv', source_hint: 'Manual oficial' },
      { attribute: 'torque maximo', value: '376 Nm', available: true, normalized_unit: 'Nm', source_hint: 'Ford oficial' },
      { attribute: 'transmissao', value: 'Automática 8 velocidades', available: true, source_hint: 'Ficha técnica oficial' },
      { attribute: 'tracao', value: '4x4 Tremor com Trail Control', available: true, source_hint: 'Catálogo Ford' },
      { attribute: 'modos de conducao', value: 'Normal, Eco, Sport, Slippery, Mud/Ruts, Sand', available: true, source_hint: 'Manual Ford' },
      { attribute: 'rodas e pneus', value: '17" com pneus AT', available: true, source_hint: 'Webmotors review' },
      { attribute: '0-100 km/h', value: '7.0 s', available: true, normalized_unit: 's', source_hint: 'YouTube review' },
      { attribute: 'preco', value: 'R$ 245.000', available: true, normalized_unit: 'BRL', source_hint: 'iCarros' },
      { attribute: 'consumo', value: '10.5 km/l combinado', available: true, normalized_unit: 'km/l', source_hint: 'Autoesporte review' },
      { attribute: 'garantia', value: '3 anos', available: true, normalized_unit: 'anos', source_hint: 'Site Ford' },
      { attribute: 'central multimidia', value: 'SYNC 4 8"', available: true, source_hint: 'Ford oficial' },
      { attribute: 'farois', value: 'LED', available: true, source_hint: 'Catálogo Ford' },
    ],
  },
  {
    key: 'ford-bronco-wildtrak-2024',
    brand: 'Ford',
    model: 'Bronco',
    version: 'Wildtrak 2024',
    specs: [
      { attribute: 'motor', value: '2.7 EcoBoost V6', available: true, source_hint: 'Ford.com' },
      { attribute: 'potencia', value: '335 cv', available: true, normalized_unit: 'cv', source_hint: 'Manual oficial' },
      { attribute: 'torque maximo', value: '563 Nm', available: true, normalized_unit: 'Nm', source_hint: 'Press kit Ford' },
      { attribute: 'transmissao', value: 'Automática 10 velocidades', available: true, source_hint: 'Catálogo oficial' },
      { attribute: 'tracao', value: '4x4 com 7 modos G.O.A.T.', available: true, source_hint: 'Ford oficial' },
      { attribute: 'modos de conducao', value: 'Normal, Eco, Sport, Slippery, Sand, Baja, Mud/Ruts, Rock Crawl', available: true, source_hint: 'Manual Ford' },
      { attribute: 'rodas e pneus', value: '35" BFGoodrich KO2', available: true, source_hint: 'Quatro Rodas' },
      { attribute: 'farois', value: 'LED com signature lighting', available: true, source_hint: 'Catálogo Ford' },
      { attribute: 'preco', value: 'R$ 410.000', available: true, normalized_unit: 'BRL', source_hint: 'iCarros' },
      // conflito intencional: dois valores diferentes pra 0-100
      { attribute: '0-100 km/h', value: '6.8 s', available: true, normalized_unit: 's', source_hint: 'Autoesporte review' },
      { attribute: '0-100 km/h', value: '7.2 s', available: true, normalized_unit: 's', source_hint: 'YouTube Garagem do Bellote' },
      { attribute: 'capacidade tanque', value: null, available: false, source_hint: null },
      { attribute: 'consumo', value: '7.8 km/l combinado', available: true, normalized_unit: 'km/l', source_hint: 'Motor1 review' },
    ],
  },
];

const queryStore: Map<string, QueryResponse> = new Map();
const summaryStore: QuerySummary[] = [];

function findFixture(payload: QueryPayload): VehicleFixture | null {
  const key = `${payload.brand} ${payload.model} ${payload.version}`.toLowerCase();
  const match = FIXTURES.find((f) => {
    const fixKey = `${f.brand} ${f.model} ${f.version}`.toLowerCase();
    return fixKey === key || key.includes(f.model.toLowerCase());
  });
  return match ?? null;
}

function buildSpecs(payload: QueryPayload, fixture: VehicleFixture | null): SpecOut[] {
  const result: SpecOut[] = [];
  const seenAttr = new Set<string>();
  for (const attr of payload.attributes) {
    const matches = fixture
      ? fixture.specs.filter((s) => s.attribute.toLowerCase() === attr.toLowerCase())
      : [];
    if (matches.length === 0) {
      result.push({
        attribute: attr,
        value: null,
        available: false,
        normalized_unit: null,
        source_hint: null,
      });
      continue;
    }
    for (const match of matches) {
      result.push({
        attribute: attr,
        value: match.value,
        available: match.available,
        normalized_unit: match.normalized_unit ?? null,
        source_hint: match.source_hint ?? null,
      });
    }
    seenAttr.add(attr);
  }
  return result;
}

export const mockAuthApi = {
  async register(payload: RegisterPayload): Promise<User> {
    await sleep(600);
    return { ...MOCK_USER, email: payload.email, full_name: payload.full_name ?? MOCK_USER.full_name };
  },
  async login(_payload: LoginPayload): Promise<TokenPair> {
    await sleep(500);
    return MOCK_TOKENS;
  },
  async me(): Promise<User> {
    await sleep(200);
    return MOCK_USER;
  },
};

export const mockVehiclesApi = {
  async query(payload: QueryPayload): Promise<QueryResponse> {
    await sleep(2500);
    const fixture = findFixture(payload);
    const specs = buildSpecs(payload, fixture);
    const id = uuid(`q-${Date.now()}`);
    const response: QueryResponse = {
      id,
      user_id: MOCK_USER.id,
      brand: payload.brand,
      model: payload.model,
      version: payload.version,
      status: 'completed',
      created_at: new Date().toISOString(),
      specs,
    };
    queryStore.set(id, response);
    summaryStore.unshift({
      id,
      brand: response.brand,
      model: response.model,
      version: response.version,
      status: response.status,
      created_at: response.created_at,
    });
    return response;
  },
  async list(limit = 50, _offset = 0): Promise<QuerySummary[]> {
    await sleep(200);
    return summaryStore.slice(0, limit);
  },
  async get(id: string): Promise<QueryResponse> {
    await sleep(200);
    const found = queryStore.get(id);
    if (!found) throw new Error('Consulta não encontrada (mock)');
    return found;
  },
};

export function seedMockHistory() {
  if (summaryStore.length > 0) return;
  const samples: QueryPayload[] = [
    {
      brand: 'Ford',
      model: 'Ranger Raptor',
      version: '2024',
      attributes: [
        'motor',
        'potencia',
        'torque maximo',
        'transmissao',
        'tracao',
        '0-100 km/h',
        'modos de conducao',
        'farois',
        'rodas e pneus',
        'preco',
      ],
    },
    {
      brand: 'Ford',
      model: 'Maverick',
      version: 'Tremor 2024',
      attributes: ['motor', 'potencia', 'tracao', 'consumo', 'preco'],
    },
  ];
  for (const payload of samples) {
    const fixture = findFixture(payload);
    const id = uuid(`seed-${payload.model}`);
    const response: QueryResponse = {
      id,
      user_id: MOCK_USER.id,
      brand: payload.brand,
      model: payload.model,
      version: payload.version,
      status: 'completed',
      created_at: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
      specs: buildSpecs(payload, fixture),
    };
    queryStore.set(id, response);
    summaryStore.push({
      id,
      brand: response.brand,
      model: response.model,
      version: response.version,
      status: response.status,
      created_at: response.created_at,
    });
  }
}
