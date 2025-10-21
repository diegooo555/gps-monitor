"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Radio } from "lucide-react"
import type { Device } from "@/types/device"
import { cn } from "@/lib/utils"

interface DeviceListProps {
  devices: Device[]
  selectedDevice: Device | null
  onDeviceSelect: (device: Device) => void
}

export function DeviceList({ devices, selectedDevice, onDeviceSelect }: DeviceListProps) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {devices.map((device) => (
          <Button
            key={device.id}
            variant="ghost"
            className={cn("w-full justify-start text-left h-auto p-3", selectedDevice?.id === device.id && "bg-accent")}
            onClick={() => onDeviceSelect(device)}
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{device.name}</span>
                </div>
                <Badge variant={getStatusVariant(device.status)}>{device.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Radio className="h-3 w-3" />
                  <span>{Math.round(device.noiseLevel)} dB</span>
                </div>
                <span className="text-xs text-muted-foreground">{device.id}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    device.noiseLevel < 40 && "bg-green-500",
                    device.noiseLevel >= 40 && device.noiseLevel < 70 && "bg-yellow-500",
                    device.noiseLevel >= 70 && "bg-red-500",
                  )}
                  style={{ width: `${device.noiseLevel}%` }}
                />
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "warning":
      return "secondary"
    case "critical":
      return "destructive"
    default:
      return "outline"
  }
}
