import { CsvErrors } from "@/components/csv-errors"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Category, Product } from "@/types"

type ProductFormValues = {
  name: string
  brand: string
  price: string
  description: string
  categoryId: string
}

type ProductModalProps = {
  open: boolean
  editingProduct: Product | null
  formValues: ProductFormValues
  categories: Category[]
  csvFile: File | null
  csvStatus: string | null
  csvErrors: string[]
  onOpenChange: (open: boolean) => void
  onFormChange: (values: Partial<ProductFormValues>) => void
  onSubmit: () => void
  onCsvFileChange: (file: File | null) => void
  onUploadCsv: () => void
}

export function ProductModal({
  open,
  editingProduct,
  formValues,
  categories,
  csvFile,
  csvStatus,
  csvErrors,
  onOpenChange,
  onFormChange,
  onSubmit,
  onCsvFileChange,
  onUploadCsv,
}: ProductModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card/80">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Editar produto" : "Adicionar produto"}
          </DialogTitle>
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
              placeholder="Ex: Mouse Gamer"
              required
              value={formValues.name}
              onChange={(event) => onFormChange({ name: event.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Marca</span>
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              type="text"
              placeholder="Ex: HyperX"
              required
              value={formValues.brand}
              onChange={(event) => onFormChange({ brand: event.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Preco</span>
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 179.90"
              required
              value={formValues.price}
              onChange={(event) => onFormChange({ price: event.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Categoria</span>
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={formValues.categoryId}
              onChange={(event) => onFormChange({ categoryId: event.target.value })}
              required
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Descricao</span>
            <textarea
              className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Descricao do produto"
              rows={3}
              value={formValues.description}
              onChange={(event) =>
                onFormChange({ description: event.target.value })
              }
            />
          </label>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex flex-col items-start gap-2">
              <input
                id="csv-products"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(event) => onCsvFileChange(event.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="border-dashed" asChild>
                <label htmlFor="csv-products" className="cursor-pointer">
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
              <Button type="submit">
                {editingProduct ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
