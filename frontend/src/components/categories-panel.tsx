import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Category } from "@/types"

type CategoriesPanelProps = {
  categories: Category[]
  isLoading: boolean
  onOpenCreateCategory: () => void
  onEditCategory: (category: Category) => void
}

export function CategoriesPanel({
  categories,
  isLoading,
  onOpenCreateCategory,
  onEditCategory,
}: CategoriesPanelProps) {
  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Categorias</CardTitle>
          <Button
            className="ring-1 ring-border/60 ring-offset-2 ring-offset-background"
            disabled={isLoading}
            onClick={onOpenCreateCategory}
          >
            Adicionar categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          <ul className="grid gap-3">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="font-semibold">{category.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditCategory(category)}
                >
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
