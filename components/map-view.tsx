"use client"

import type React from "react"
import { useRef, useState } from "react"
import type { Device } from "@/types/device"

interface MapViewProps {
  devices: Device[]
  selectedDevice: Device | null
  onDeviceSelect: (device: Device) => void
}

export function MapView({ devices, selectedDevice, onDeviceSelect }: MapViewProps) {
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  // Convertir coordenadas lat/lng a píxeles en el mapa
  const latLngToPixel = (lat: number, lng: number) => {
    const scale = Math.pow(2, zoom)
    const worldWidth = 256 * scale

    const x = ((lng + 180) / 360) * worldWidth
    const latRad = (lat * Math.PI) / 180
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
    const y = worldWidth / 2 - (worldWidth * mercN) / (2 * Math.PI)

    const centerX = ((center.lng + 180) / 360) * worldWidth
    const centerLatRad = (center.lat * Math.PI) / 180
    const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2))
    const centerY = worldWidth / 2 - (worldWidth * centerMercN) / (2 * Math.PI)

    return {
      x: x - centerX + 400 + dragOffset.x,
      y: y - centerY + 200 + dragOffset.y,
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((prev) => Math.max(10, Math.min(16, prev + (e.deltaY > 0 ? -0.5 : 0.5))))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setDragOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    const scale = Math.pow(2, zoom)
    const worldWidth = 256 * scale

    const dlng = (-dragOffset.x / worldWidth) * 360
    const dlat = (dragOffset.y / worldWidth) * 180

    setCenter((prev) => ({
      lat: Math.max(-85, Math.min(85, prev.lat + dlat)),
      lng: ((prev.lng + dlng + 180) % 360) - 180,
    }))

    setDragOffset({ x: 0, y: 0 })
    setIsDragging(false)
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border bg-muted">
      <div
        ref={mapRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {[-1, 0, 1].map((dx) =>
            [-1, 0, 1].map((dy) => {
              const tileX = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom)) + dx
              const tileY =
                Math.floor(
                  ((1 -
                    Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) /
                      Math.PI) /
                    2) *
                    Math.pow(2, zoom),
                ) + dy

              const centerTileX = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom))
              const centerTileY = Math.floor(
                ((1 -
                  Math.log(Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)) /
                    Math.PI) /
                  2) *
                  Math.pow(2, zoom),
              )

              return (
                <div
                  key={`${dx}-${dy}`}
                  className="absolute"
                  style={{
                    left: `${400 + (tileX - centerTileX) * 256 - 128}px`,
                    top: `${200 + (tileY - centerTileY) * 256 - 128}px`,
                    width: "256px",
                    height: "256px",
                    backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png)`,
                    backgroundSize: "cover",
                  }}
                />
              )
            }),
          )}
        </div>

        <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
          {devices.map((device) => {
            const pos = latLngToPixel(device.lat, device.lng)
            const color = getNoiseColor(device.noiseLevel)
            const isSelected = selectedDevice?.id === device.id

            return (
              <g key={device.id} className="pointer-events-auto cursor-pointer" onClick={() => onDeviceSelect(device)}>
                <circle cx={pos.x} cy={pos.y} r={isSelected ? 20 : 16} fill="white" opacity={0.9} />
                <circle cx={pos.x} cy={pos.y} r={isSelected ? 17 : 13} fill={color} />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={isSelected ? "12" : "10"}
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {Math.round(device.noiseLevel)}
                </text>
                {isSelected && (
                  <g>
                    <rect x={pos.x - 60} y={pos.y - 60} width="120" height="50" rx="4" fill="white" opacity={0.95} />
                    <text
                      x={pos.x}
                      y={pos.y - 45}
                      textAnchor="middle"
                      fill="black"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {device.name}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y - 30}
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      className="pointer-events-none"
                    >
                      ID: {device.id}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y - 18}
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      className="pointer-events-none"
                    >
                      Ruido: {Math.round(device.noiseLevel)} dB
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(16, prev + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-background border border-border shadow-sm hover:bg-accent"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(10, prev - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-background border border-border shadow-sm hover:bg-accent"
        >
          −
        </button>
      </div>

      <div className="absolute top-4 left-4 rounded-md bg-background/95 p-3 shadow-md border border-border">
        <div className="text-xs font-semibold mb-2">Nivel de Ruido</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
            <span>{"< 40 dB (Bajo)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            <span>40-70 dB (Medio)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <span>{"> 70 dB (Alto)"}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-md bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md border border-border">
        Arrastra para mover • Rueda para zoom
      </div>
    </div>
  )
}

function getNoiseColor(noiseLevel: number): string {
  if (noiseLevel < 40) return "#10b981" // Verde
  if (noiseLevel < 70) return "#f59e0b" // Amarillo
  return "#ef4444" // Rojo
}
