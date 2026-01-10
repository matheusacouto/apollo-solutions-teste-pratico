"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ChartSeries = {
  key: string
  label: string
  color: string
}

type ChartBarStackedProps = {
  title: string
  description?: string
  data: Array<Record<string, string | number>>
  series: ChartSeries[]
  onMonthClick?: (month: number) => void
}

export function ChartBarStacked({
  title,
  description,
  data,
  series,
  onMonthClick,
}: ChartBarStackedProps) {
  const chartConfig = series.reduce<ChartConfig>((acc, item) => {
    acc[item.key] = { label: item.label, color: item.color }
    return acc
  }, {})
  const hasData = data.some((item) =>
    series.some((serie) => {
      const rawValue = item[serie.key]
      const value =
        typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0)
      return Number.isFinite(value) && value !== 0
    })
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-48 w-full aspect-auto">
            <BarChart
              accessibilityLayer
              data={data}
              onClick={(event) => {
                const payload = event?.activePayload?.[0]?.payload as
                  | { monthIndex?: number }
                  | undefined
                if (payload?.monthIndex && onMonthClick) {
                  onMonthClick(payload.monthIndex)
                }
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {series.length > 1 ? (
                <ChartLegend content={<ChartLegendContent />} />
              ) : null}
              {series.map((item, index) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  stackId={series.length > 1 ? "a" : undefined}
                  fill={`var(--color-${item.key})`}
                  radius={
                    series.length > 1
                      ? index === 0
                        ? [0, 0, 4, 4]
                        : [4, 4, 0, 0]
                      : [4, 4, 4, 4]
                  }
                />
              ))}
            </BarChart>
          </ChartContainer>
          {!hasData ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground">
              Sem dados
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
