/** Converte o campo images (JSON string no SQLite) para array */
export function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images
  if (typeof images === 'string') {
    try { return JSON.parse(images) } catch { return [] }
  }
  return []
}

export function parseCar<T extends { images: unknown }>(car: T): T & { images: string[] } {
  return { ...car, images: parseImages(car.images) }
}

export function parseCars<T extends { images: unknown }>(cars: T[]): (T & { images: string[] })[] {
  return cars.map(parseCar)
}
