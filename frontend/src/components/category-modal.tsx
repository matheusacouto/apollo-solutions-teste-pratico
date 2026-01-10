import { CsvErrors } from "@/components/csv-errors"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CategoryModalProps = {
  open: boolean
  title: string
  submitLabel: string
  categoryName: string
  csvFile: File | null
  csvStatus: string | null
  csvErrors: string[]
  onOpenChange: (open: boolean) => void
  onCategoryNameChange: (value: string) => void
  onSubmit: () => void
  onCsvFileChange: (file: File | null) => void
  onUploadCsv: () => void
}

export function CategoryModal({
  open,
  title,
  submitLabel,
  categoryName,
  csvFile,
  csvStatus,
  csvErrors,
  onOpenChange,
  onCategoryNameChange,
  onSubmit,
  onCsvFileChange,
  onUploadCsv,
}: CategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card/80">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <label className="grid gap-1.5 text-sm">
            <span>Nome</span>
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              type="text"
              placeholder="Ex: Perifericos"
              required
              value={categoryName}
              onChange={(event) => onCategoryNameChange(event.target.value)}
            />
          </label>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex flex-col items-start gap-2">
              <input
                id="csv-categories"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(event) => onCsvFileChange(event.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="border-dashed" asChild>
                <label htmlFor="csv-categories" className="cursor-pointer">
                  Upload CSV
                </label>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!csvFile || csvStatus === "Enviando CSV..."}
                onClick={onUploadCsv}
              >
                Importar
              </Button>
              <div className="text-xs text-muted-foreground">
                {csvStatus ?? (csvFile ? `Pronto: ${csvFile.name}` : "")}
              </div>
              <CsvErrors errors={csvErrors} />
            </div>
            <div className="flex items-center gap-3">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
