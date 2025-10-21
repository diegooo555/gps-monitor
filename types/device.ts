export interface Device {
  id: string
  name: string
  lat: number
  lng: number
  noiseLevel: number
  status: "active" | "warning" | "critical"
  lastUpdate: Date
}
