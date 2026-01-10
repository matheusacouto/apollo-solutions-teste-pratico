import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Category, Product } from "@/types"

type ProductsPanelProps = {
  products: Product[]
  categories: Category[]
  filtersOpen: boolean
  filterName: string
  filterCategory: string
  priceOrder: string
  page: number
  totalPages: number
  isLoading: boolean
  formatPrice: (value: Product["price"]) => string
  onToggleFilters: () => void
  onFilterNameChange: (value: string) => void
  onFilterCategoryChange: (value: string) => void
  onPriceOrderChange: (value: string) => void
  onPrevPage: () => void
  onNextPage: () => void
  onOpenCreateProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => void
  onDownloadCsv: () => void
}

export function ProductsPanel({
  products,
  categories,
  filtersOpen,
  filterName,
  filterCategory,
  priceOrder,
  page,
  totalPages,
  isLoading,
  formatPrice,
  onToggleFilters,
  onFilterNameChange,
  onFilterCategoryChange,
  onPriceOrderChange,
  onPrevPage,
  onNextPage,
  onOpenCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onDownloadCsv,
}: ProductsPanelProps) {
  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Lista de produtos</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-dashed"
              onClick={onDownloadCsv}
            >
              Baixar CSV
            </Button>
            <Button
              variant="outline"
              className="border-dashed"
              onClick={onToggleFilters}
            >
              Filtros
            </Button>
            <Button
              className="ring-1 ring-border/60 ring-offset-2 ring-offset-background"
              disabled={isLoading}
              onClick={onOpenCreateProduct}
            >
              Adicionar produto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {filtersOpen ? (
          <div className="mb-4 grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span>Nome</span>
              <input
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                type="text"
                placeholder="Buscar por nome"
                value={filterName}
                onChange={(event) => onFilterNameChange(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span>Categoria</span>
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={filterCategory}
                onChange={(event) => onFilterCategoryChange(event.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span>Ordenar preco</span>
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={priceOrder}
                onChange={(event) => onPriceOrderChange(event.target.value)}
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </label>
          </div>
        ) : null}
        <ul className="grid gap-3">
          {products.map((product) => (
            <li
              key={product.name}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{product.name}</span>
                <span className="text-sm text-muted-foreground">
                  {product.brand}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditProduct(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteProduct(product)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={onPrevPage}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Pagina {page} de {totalPages}
            </span>
            <button
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={onNextPage}
              disabled={page === totalPages}
            >
              Proxima
            </button>
          </div>
        ) : null}

      </CardContent>
    </Card>
  )
}
