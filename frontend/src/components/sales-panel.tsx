import { ChartBarStacked } from "@/components/sales-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ChartDatum = {
  month: string
  monthIndex: number
  quantity: number
  total: number
  profit: number
}

type SalesPanelProps = {
  chartData: ChartDatum[]
  salesYears: number[]
  selectedYear: number | null
  csvSalesFile: File | null
  csvSalesStatus: string | null
  onMonthClick: (month: number) => void
  onYearChange: (year: number | null) => void
  onCsvSalesChange: (file: File | null) => void
  onUploadCsvSales: () => void
  onDownloadCsvSales: () => void
}

export function SalesPanel({
  chartData,
  salesYears,
  selectedYear,
  csvSalesFile,
  csvSalesStatus,
  onMonthClick,
  onYearChange,
  onCsvSalesChange,
  onUploadCsvSales,
  onDownloadCsvSales,
}: SalesPanelProps) {
  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Painel</CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Ano</span>
              <select
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                value={selectedYear ?? ""}
                onChange={(event) =>
                  onYearChange(
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              >
                {salesYears.length === 0 ? (
                  <option value="">Sem dados</option>
                ) : null}
                {salesYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onDownloadCsvSales}>
              Baixar CSV
            </Button>
            <input
              id="csv-sales"
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={(event) =>
                onCsvSalesChange(event.target.files?.[0] ?? null)
              }
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <label htmlFor="csv-sales" className="cursor-pointer">
                Upload CSV
              </label>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!csvSalesFile || csvSalesStatus === "Enviando CSV..."}
              onClick={onUploadCsvSales}
            >
              Importar
            </Button>
            <div className="text-[11px] text-muted-foreground">
              {csvSalesStatus ??
                (csvSalesFile ? `Pronto: ${csvSalesFile.name}` : "")}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[320px] flex-1">
            <ChartBarStacked
              title="Quantidade de itens vendidos"
              description="Resumo mensal"
              data={chartData}
              series={[
                {
                  key: "quantity",
                  label: "Quantidade",
                  color: "var(--chart-1)",
                },
              ]}
              onMonthClick={onMonthClick}
            />
          </div>
          <div className="min-w-[320px] flex-1">
            <ChartBarStacked
              title="Variação de faturamento"
              description="Comparação com o mês anterior"
              data={chartData}
              series={[
                {
                  key: "profit",
                  label: "Variação",
                  color: "var(--chart-2)",
                },
              ]}
              onMonthClick={onMonthClick}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
