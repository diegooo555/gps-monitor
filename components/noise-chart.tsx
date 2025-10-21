"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Device } from "@/types/device"

interface NoiseChartProps {
  device: Device
}

export function NoiseChart({ device }: NoiseChartProps) {
  const [data, setData] = useState<Array<{ time: string; noise: number }>>([])

  useEffect(() => {
    // Generar datos históricos simulados
    const generateHistoricalData = () => {
      const now = new Date()
      const historicalData = []

      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        historicalData.push({
          time: time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          noise: Math.max(0, Math.min(100, device.noiseLevel + (Math.random() - 0.5) * 30)),
        })
      }

      return historicalData
    }

    setData(generateHistoricalData())

    // Actualizar datos cada 5 segundos
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        newData.push({
          time: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          noise: device.noiseLevel,
        })
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [device])

  return (
    <ChartContainer
      config={{
        noise: {
          label: "Nivel de Ruido (dB)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="time" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="noise"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            name="Nivel de Ruido (dB)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
