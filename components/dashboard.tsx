"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapView } from "@/components/map-view"
import { DeviceList } from "@/components/device-list"
import { NoiseChart } from "@/components/noise-chart"
import { Activity, MapPin, Radio } from "lucide-react"
import type { Device } from "@/types/device"

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    // Simular datos de dispositivos GPS con niveles de ruido
    const mockDevices: Device[] = [
      {
        id: "GPS-001",
        name: "Dispositivo Norte",
        lat: 40.7128,
        lng: -74.006,
        noiseLevel: 45,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-002",
        name: "Dispositivo Sur",
        lat: 40.758,
        lng: -73.9855,
        noiseLevel: 72,
        status: "warning",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-003",
        name: "Dispositivo Este",
        lat: 40.7489,
        lng: -73.968,
        noiseLevel: 28,
        status: "active",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-004",
        name: "Dispositivo Oeste",
        lat: 40.7282,
        lng: -74.0776,
        noiseLevel: 89,
        status: "critical",
        lastUpdate: new Date(),
      },
      {
        id: "GPS-005",
        name: "Dispositivo Centro",
        lat: 40.741,
        lng: -73.9896,
        noiseLevel: 55,
        status: "active",
        lastUpdate: new Date(),
      },
    ]

    setDevices(mockDevices)
    setSelectedDevice(mockDevices[0])

    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((device) => ({
          ...device,
          noiseLevel: Math.max(0, Math.min(100, device.noiseLevel + (Math.random() - 0.5) * 10)),
          lastUpdate: new Date(),
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const avgNoiseLevel =
    devices.length > 0 ? Math.round(devices.reduce((sum, d) => sum + d.noiseLevel, 0) / devices.length) : 0

  const activeDevices = devices.filter((d) => d.status === "active").length
  const criticalDevices = devices.filter((d) => d.status === "critical").length

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-blue-600">Monitor de Dispositivos GPS</h1>
            <p className="text-muted-foreground">Monitoreo en tiempo real de ubicación y niveles de ruido</p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Activity className="mr-2 h-4 w-4" />
            {devices.length} Dispositivos Activos
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispositivos Activos</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDevices}</div>
              <p className="text-xs text-muted-foreground">{criticalDevices} en estado crítico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nivel de Ruido Promedio</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgNoiseLevel} dB</div>
              <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Operativo</div>
              <p className="text-xs text-muted-foreground">Todos los sistemas funcionando</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mapa de Ubicaciones</CardTitle>
              <CardDescription>Ubicación en tiempo real de todos los dispositivos GPS</CardDescription>
            </CardHeader>
            <CardContent>
              <MapView devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </CardContent>
          </Card>

          {/* Device List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Dispositivos</CardTitle>
              <CardDescription>Haz clic para ver detalles</CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceList devices={devices} selectedDevice={selectedDevice} onDeviceSelect={setSelectedDevice} />
            </CardContent>
          </Card>
        </div>

        {/* Noise Chart */}
        {selectedDevice && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ruido - {selectedDevice.name}</CardTitle>
              <CardDescription>Niveles de ruido en las últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <NoiseChart device={selectedDevice} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
