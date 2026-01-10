import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type SalesEditModalProps = {
  open: boolean
  quantity: string
  total: string
  onOpenChange: (open: boolean) => void
  onQuantityChange: (value: string) => void
  onTotalChange: (value: string) => void
  onSave: () => void
}

export function SalesEditModal({
  open,
  quantity,
  total,
  onOpenChange,
  onQuantityChange,
  onTotalChange,
  onSave,
}: SalesEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card/80">
        <DialogHeader>
          <DialogTitle>Editar vendas do mes</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span>Quantidade</span>
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(event) => onQuantityChange(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span>Total</span>
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              type="number"
              min="0"
              step="0.01"
              value={total}
              onChange={(event) => onTotalChange(event.target.value)}
            />
          </label>
          <div className="mt-2 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={onSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
