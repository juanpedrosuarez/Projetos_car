export interface CityCoord {
  city: string
  state: string
  lat: number
  lng: number
}

// Principais cidades brasileiras com coordenadas
export const CITIES_COORDS: CityCoord[] = [
  { city: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333 },
  { city: 'Guarulhos', state: 'SP', lat: -23.4543, lng: -46.5338 },
  { city: 'Campinas', state: 'SP', lat: -22.9056, lng: -47.0608 },
  { city: 'São Bernardo do Campo', state: 'SP', lat: -23.6914, lng: -46.5646 },
  { city: 'Santo André', state: 'SP', lat: -23.6639, lng: -46.5383 },
  { city: 'Osasco', state: 'SP', lat: -23.5329, lng: -46.7917 },
  { city: 'Sorocaba', state: 'SP', lat: -23.5015, lng: -47.4526 },
  { city: 'Ribeirão Preto', state: 'SP', lat: -21.1775, lng: -47.8103 },
  { city: 'São José dos Campos', state: 'SP', lat: -23.2237, lng: -45.9009 },
  { city: 'Santos', state: 'SP', lat: -23.9618, lng: -46.3322 },
  { city: 'Mauá', state: 'SP', lat: -23.6678, lng: -46.4611 },
  { city: 'São Caetano do Sul', state: 'SP', lat: -23.6167, lng: -46.55 },
  { city: 'Diadema', state: 'SP', lat: -23.6861, lng: -46.6228 },
  { city: 'Jundiaí', state: 'SP', lat: -23.1864, lng: -46.8981 },
  { city: 'Bauru', state: 'SP', lat: -22.3246, lng: -49.0761 },
  { city: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729 },
  { city: 'Niterói', state: 'RJ', lat: -22.8838, lng: -43.1044 },
  { city: 'Duque de Caxias', state: 'RJ', lat: -22.7856, lng: -43.3117 },
  { city: 'Nova Iguaçu', state: 'RJ', lat: -22.7595, lng: -43.4511 },
  { city: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345 },
  { city: 'Uberlândia', state: 'MG', lat: -18.9113, lng: -48.2622 },
  { city: 'Contagem', state: 'MG', lat: -19.9317, lng: -44.0536 },
  { city: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177 },
  { city: 'Caxias do Sul', state: 'RS', lat: -29.1681, lng: -51.1793 },
  { city: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733 },
  { city: 'Londrina', state: 'PR', lat: -23.3045, lng: -51.1696 },
  { city: 'Maringá', state: 'PR', lat: -23.4273, lng: -51.9375 },
  { city: 'Florianópolis', state: 'SC', lat: -27.5954, lng: -48.548 },
  { city: 'Joinville', state: 'SC', lat: -26.3044, lng: -48.8487 },
  { city: 'Blumenau', state: 'SC', lat: -26.9194, lng: -49.0661 },
  { city: 'Salvador', state: 'BA', lat: -12.9714, lng: -38.5014 },
  { city: 'Feira de Santana', state: 'BA', lat: -12.2664, lng: -38.9663 },
  { city: 'Fortaleza', state: 'CE', lat: -3.7172, lng: -38.5433 },
  { city: 'Recife', state: 'PE', lat: -8.0539, lng: -34.8811 },
  { city: 'Olinda', state: 'PE', lat: -7.9994, lng: -34.8494 },
  { city: 'Caruaru', state: 'PE', lat: -8.2760, lng: -35.9819 },
  { city: 'Manaus', state: 'AM', lat: -3.1019, lng: -60.025 },
  { city: 'Brasília', state: 'DF', lat: -15.7801, lng: -47.9292 },
  { city: 'Goiânia', state: 'GO', lat: -16.6864, lng: -49.2643 },
  { city: 'Belém', state: 'PA', lat: -1.4558, lng: -48.4902 },
  { city: 'Maceió', state: 'AL', lat: -9.6658, lng: -35.735 },
  { city: 'Natal', state: 'RN', lat: -5.7945, lng: -35.2110 },
  { city: 'Teresina', state: 'PI', lat: -5.0892, lng: -42.8019 },
  { city: 'Campo Grande', state: 'MS', lat: -20.4697, lng: -54.6201 },
  { city: 'João Pessoa', state: 'PB', lat: -7.1195, lng: -34.845 },
  { city: 'Aracaju', state: 'SE', lat: -10.9472, lng: -37.0731 },
  { city: 'São Luís', state: 'MA', lat: -2.5297, lng: -44.3028 },
  { city: 'Vitória', state: 'ES', lat: -20.3155, lng: -40.3128 },
  { city: 'Vila Velha', state: 'ES', lat: -20.3297, lng: -40.2922 },
  { city: 'Cuiabá', state: 'MT', lat: -15.5989, lng: -56.0949 },
  { city: 'Porto Velho', state: 'RO', lat: -8.7612, lng: -63.9004 },
  { city: 'Palmas', state: 'TO', lat: -10.2491, lng: -48.3243 },
]

/** Fórmula de Haversine — retorna distância em km */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Retorna cidades dentro do raio (km) a partir de uma coordenada */
export function citiesWithinRadius(lat: number, lng: number, radiusKm: number): string[] {
  return CITIES_COORDS.filter(c => haversine(lat, lng, c.lat, c.lng) <= radiusKm).map(c => c.city)
}

/** Retorna coordenadas de uma cidade pelo nome (normalizado) */
export function getCityCoords(cityName: string): CityCoord | undefined {
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  return CITIES_COORDS.find(c => normalize(c.city) === normalize(cityName))
}
