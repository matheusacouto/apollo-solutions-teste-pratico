import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CategoriesPanel } from "@/components/categories-panel"
import { CategoryModal } from "@/components/category-modal"
import { ProductModal } from "@/components/product-modal"
import { ProductsPanel } from "@/components/products-panel"
import { SalesEditModal } from "@/components/sales-edit-modal"
import { SalesPanel } from "@/components/sales-panel"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import type { Category, Product, SalesSummary } from "@/types"

function App() {
  const API_BASE = "/api"

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [salesSummary, setSalesSummary] = useState<SalesSummary[]>([])
  const [salesYears, setSalesYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [salesForm, setSalesForm] = useState({
    quantity: "",
    total: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 4
  const [page, setPage] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [priceOrder, setPriceOrder] = useState("asc")
  const [formValues, setFormValues] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    categoryId: "",
  })
  const [categoryName, setCategoryName] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvStatus, setCsvStatus] = useState<string | null>(null)
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [csvCategoryFile, setCsvCategoryFile] = useState<File | null>(null)
  const [csvCategoryStatus, setCsvCategoryStatus] = useState<string | null>(null)
  const [csvCategoryErrors, setCsvCategoryErrors] = useState<string[]>([])
  const [csvSalesFile, setCsvSalesFile] = useState<File | null>(null)
  const [csvSalesStatus, setCsvSalesStatus] = useState<string | null>(null)

  const formatPrice = (value: Product["price"]) => {
    const numberValue =
      typeof value === "number"
        ? value
        : (() => {
            const raw = value.toString().replace(/[^\d,.-]/g, "")
            const hasComma = raw.includes(",")
            const hasDot = raw.includes(".")
            if (hasComma && hasDot) {
              return Number(raw.replace(/\./g, "").replace(",", "."))
            }
            if (hasComma) {
              return Number(raw.replace(",", "."))
            }
            return Number(raw)
          })()
    if (Number.isNaN(numberValue)) {
      return value.toString()
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue)
  }

  const monthLabels = [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const chartData = useMemo(() => {
    const summaryMap = new Map(
      salesSummary.map((item) => [item.month, item])
    )

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      const data = summaryMap.get(month)
      return {
        month: monthLabels[index],
        monthIndex: month,
        quantity: data?.quantity ?? 0,
        total: data?.total_price ?? 0,
        profit: data?.profit_variation ?? 0,
      }
    })
  }, [salesSummary])

  const filteredProducts = useMemo(() => {
    const nameQuery = filterName.trim().toLowerCase()

    const filtered = products.filter((product) => {
      if (filterCategory && product.category_id.toString() !== filterCategory) {
        return false
      }

      if (nameQuery && !product.name.toLowerCase().includes(nameQuery)) {
        return false
      }

      return true
    })

    const sorted = [...filtered].sort((a, b) => {
      const priceA =
        typeof a.price === "number"
          ? a.price
          : Number(a.price.toString().replace(",", "."))
      const priceB =
        typeof b.price === "number"
          ? b.price
          : Number(b.price.toString().replace(",", "."))

      return priceOrder === "desc" ? priceB - priceA : priceA - priceB
    })

    return sorted
  }, [
    products,
    filterCategory,
    filterName,
    priceOrder,
  ])

  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [page, filteredProducts])

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [filterName, filterCategory, priceOrder])

  useEffect(() => {
    const controller = new AbortController()

    const loadData = async () => {
      try {
        setIsLoading(true)
        const [productsResponse, categoriesResponse, yearsResponse] =
          await Promise.all([
            fetch(`${API_BASE}/products/`, { signal: controller.signal }),
            fetch(`${API_BASE}/categories/`, { signal: controller.signal }),
            fetch(`${API_BASE}/sales/years`, { signal: controller.signal }),
          ])

        if (productsResponse.ok) {
          const data = (await productsResponse.json()) as Product[]
          setProducts(data)
        }

        if (categoriesResponse.ok) {
          const data = (await categoriesResponse.json()) as Category[]
          setCategories(data)
          setFormValues((prev) => ({
            ...prev,
            categoryId: prev.categoryId || data[0]?.id?.toString() || "",
          }))
        }

        if (yearsResponse.ok) {
          const data = (await yearsResponse.json()) as number[]
          setSalesYears(data)
          if (data.length && selectedYear === null) {
            setSelectedYear(data[data.length - 1])
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao carregar dados", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    return () => controller.abort()
  }, [API_BASE, selectedYear])

  useEffect(() => {
    const controller = new AbortController()
    const loadSales = async () => {
      try {
        const yearParam = selectedYear ? `?year=${selectedYear}` : ""
        const response = await fetch(
          `${API_BASE}/sales/summary${yearParam}`,
          {
            signal: controller.signal,
          }
        )
        if (response.ok) {
          const data = (await response.json()) as SalesSummary[]
          setSalesSummary(data)
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao carregar vendas", error)
        }
      }
    }

    loadSales()

    return () => controller.abort()
  }, [API_BASE, selectedYear])

  useEffect(() => {
    if (!isProductModalOpen) {
      setCsvFile(null)
      setCsvStatus(null)
      setCsvErrors([])
      setEditingProduct(null)
      setFormValues({
        name: "",
        brand: "",
        price: "",
        description: "",
        categoryId: categories[0]?.id?.toString() ?? "",
      })
    }
  }, [isProductModalOpen, categories])

  useEffect(() => {
    if (!isCategoryModalOpen) {
      setCsvCategoryFile(null)
      setCsvCategoryStatus(null)
      setCsvCategoryErrors([])
      setEditingCategory(null)
      setCategoryName("")
    }
  }, [isCategoryModalOpen])

  useEffect(() => {
    setCsvSalesFile(null)
    setCsvSalesStatus(null)
  }, [])

  const openSalesEditModal = (month: number) => {
    if (!selectedYear) {
      toast.error("Selecione um ano para editar as vendas.")
      return
    }
    const current = chartData.find((item) => item.monthIndex === month)
    setSelectedMonth(month)
    setSalesForm({
      quantity: current ? String(current.quantity ?? "") : "",
      total: current ? String(current.total ?? "") : "",
    })
    setIsSalesModalOpen(true)
  }

  const handleCsvUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    setCsvStatus("Enviando CSV...")
    setCsvErrors([])

    try {
      const response = await fetch(`${API_BASE}/products/upload`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || result?.success === false) {
        const errors = (result?.data?.errors ?? []).map(
          (item: { row: number; error: string }) =>
            `Linha ${item.row}: ${item.error}`
        )
        setCsvErrors(errors)
        throw new Error(result?.message || "Falha no upload do CSV")
      }
      const created = result?.data?.created ?? 0
      const skipped = result?.data?.skipped ?? 0
      setCsvStatus(`Importado: ${created} | Ignorados: ${skipped}`)
      toast.success("CSV importado", {
        description: `Criados: ${created} | Ignorados: ${skipped}`,
      })

      const refreshed = await fetch(`${API_BASE}/products/`)
      if (refreshed.ok) {
        const data = (await refreshed.json()) as Product[]
        setProducts(data)
      }
      setIsProductModalOpen(false)
    } catch (error) {
      console.error(error)
      setCsvStatus("Erro ao importar CSV")
      toast.error("Erro ao importar CSV", {
        description:
          error instanceof Error ? error.message : "Tente novamente.",
      })
    }
  }

  const handleCategoryCsvUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    setCsvCategoryStatus("Enviando CSV...")
    setCsvCategoryErrors([])

    try {
      const response = await fetch(`${API_BASE}/categories/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha no upload do CSV")
      }

      const result = await response.json()
      if (result?.success === false) {
        const errors = (result?.data?.errors ?? []).map(
          (item: { row: number; error: string }) =>
            `Linha ${item.row}: ${item.error}`
        )
        setCsvCategoryErrors(errors)
        throw new Error(result?.message || "CSV invalido")
      }
      const created = result?.data?.created ?? 0
      const skipped = result?.data?.skipped ?? 0
      setCsvCategoryStatus(`Importado: ${created} | Ignorados: ${skipped}`)
      toast.success("CSV importado", {
        description: `Criados: ${created} | Ignorados: ${skipped}`,
      })

      const refreshed = await fetch(`${API_BASE}/categories/`)
      if (refreshed.ok) {
        const data = (await refreshed.json()) as Category[]
        setCategories(data)
      }
      setIsCategoryModalOpen(false)
    } catch (error) {
      console.error(error)
      setCsvCategoryStatus("Erro ao importar CSV")
      toast.error("Erro ao importar CSV", {
        description: "Tente novamente.",
      })
    }
  }

  const handleSalesCsvUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    setCsvSalesStatus("Enviando CSV...")

    try {
      const response = await fetch(`${API_BASE}/sales/upload`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Falha no upload do CSV")
      }
      const created = result?.created ?? result?.data?.created ?? 0
      const skipped = result?.skipped ?? result?.data?.skipped ?? 0
      setCsvSalesStatus(`Importado: ${created} | Ignorados: ${skipped}`)

      const refreshed = await fetch(`${API_BASE}/sales/summary`)
      if (refreshed.ok) {
        const data = (await refreshed.json()) as SalesSummary[]
        setSalesSummary(data)
      }

      const yearsResponse = await fetch(`${API_BASE}/sales/years`)
      if (yearsResponse.ok) {
        const years = (await yearsResponse.json()) as number[]
        setSalesYears(years)
        if (years.length) {
          setSelectedYear(years[years.length - 1])
        }
      }
    } catch (error) {
      console.error(error)
      setCsvSalesStatus("Erro ao importar CSV")
    }
  }

  const handleSalesOverrideSave = async () => {
    if (!selectedYear || !selectedMonth) {
      return
    }
    const quantity = Number(salesForm.quantity)
    const total = Number(salesForm.total)

    if (Number.isNaN(quantity) || Number.isNaN(total)) {
      toast.error("Preencha quantidade e total corretamente.")
      return
    }

    try {
      const response = await fetch(
        `${API_BASE}/sales/override/${selectedYear}/${selectedMonth}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity,
            total_price: total,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Falha ao salvar vendas do mes")
      }

      const yearParam = selectedYear ? `?year=${selectedYear}` : ""
      const refreshed = await fetch(`${API_BASE}/sales/summary${yearParam}`)
      if (refreshed.ok) {
        const data = (await refreshed.json()) as SalesSummary[]
        setSalesSummary(data)
      }

      setIsSalesModalOpen(false)
      toast.success("Vendas atualizadas", {
        description: `Mês ${selectedMonth}`,
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar vendas", {
        description: "Tente novamente.",
      })
    }
  }

  const handleProductSave = async () => {
    const payload = {
      name: formValues.name,
      brand: formValues.brand,
      description: formValues.description,
      category_id: Number(formValues.categoryId),
      price: Number(formValues.price),
    }

    try {
      const response = await fetch(
        editingProduct
          ? `${API_BASE}/products/${editingProduct.id}`
          : `${API_BASE}/products/`,
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()
      if (!response.ok || result?.success === false) {
        throw new Error("Falha ao salvar produto")
      }

      const savedProduct = result?.data ?? result
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === savedProduct.id ? savedProduct : item
          )
        )
        toast.success("Produto atualizado", { description: savedProduct.name })
      } else {
        setProducts((prev) => [...prev, savedProduct])
        toast.success("Produto criado", { description: savedProduct.name })
      }
      setIsProductModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar produto", {
        description: "Verifique os dados e tente novamente.",
      })
    }
  }

  const handleCategorySave = async () => {
    if (!categoryName.trim()) {
      return
    }

    try {
      const response = await fetch(
        editingCategory
          ? `${API_BASE}/categories/${editingCategory.id}`
          : `${API_BASE}/categories/`,
        {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
        }
      )

      const result = await response.json()
      if (!response.ok || result?.success === false) {
        throw new Error("Falha ao salvar categoria")
      }

      const savedCategory = result?.data ?? result
      if (!savedCategory) {
        throw new Error("Categoria nao encontrada")
      }

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((item) =>
            item.id === savedCategory.id ? savedCategory : item
          )
        )
        toast.success("Categoria atualizada", {
          description: savedCategory.name,
        })
      } else {
        setCategories((prev) => [...prev, savedCategory])
        setFormValues((prev) => ({
          ...prev,
          categoryId: savedCategory.id?.toString() ?? prev.categoryId,
        }))
        toast.success("Categoria criada", {
          description: savedCategory.name,
        })
      }
      setIsCategoryModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar categoria", {
        description: "Tente novamente.",
      })
    }
  }

  const downloadCsv = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Falha ao baixar CSV")
      }
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao baixar CSV", {
        description: "Tente novamente.",
      })
    }
  }

  const openCreateProductModal = () => {
    setEditingProduct(null)
    setFormValues({
      name: "",
      brand: "",
      price: "",
      description: "",
      categoryId: categories[0]?.id?.toString() ?? "",
    })
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product)
    setFormValues({
      name: product.name,
      brand: product.brand,
      price: product.price?.toString() ?? "",
      description: product.description,
      categoryId: product.category_id?.toString() ?? "",
    })
    setIsProductModalOpen(true)
  }

  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCategoryName("")
    setIsCategoryModalOpen(true)
  }

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${product.name}?`
    )
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/products/${product.id}`, {
        method: "DELETE",
      })
      const payload = await response.json()
      if (!response.ok || payload?.success === false) {
        throw new Error("Falha ao remover produto")
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id))
      toast.success("Produto removido", { description: product.name })

      const yearParam = selectedYear ? `?year=${selectedYear}` : ""
      const refreshed = await fetch(`${API_BASE}/sales/summary${yearParam}`)
      if (refreshed.ok) {
        const data = (await refreshed.json()) as SalesSummary[]
        setSalesSummary(data)
      }
      const yearsResponse = await fetch(`${API_BASE}/sales/years`)
      if (yearsResponse.ok) {
        const years = (await yearsResponse.json()) as number[]
        setSalesYears(years)
        if (years.length === 0) {
          setSelectedYear(null)
        } else if (selectedYear && !years.includes(selectedYear)) {
          setSelectedYear(years[years.length - 1])
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao remover produto", {
        description: "Tente novamente.",
      })
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 sm:px-8">
        <section>
          <SalesPanel
            chartData={chartData}
            salesYears={salesYears}
            selectedYear={selectedYear}
            csvSalesFile={csvSalesFile}
            csvSalesStatus={csvSalesStatus}
            onMonthClick={openSalesEditModal}
            onYearChange={setSelectedYear}
            onCsvSalesChange={(file) => {
              setCsvSalesFile(file)
              setCsvSalesStatus(null)
            }}
            onUploadCsvSales={() =>
              csvSalesFile && handleSalesCsvUpload(csvSalesFile)
            }
            onDownloadCsvSales={() => {
              const yearParam = selectedYear ? `?year=${selectedYear}` : ""
              downloadCsv(
                `${API_BASE}/sales/csv${yearParam}`,
                `sales_${selectedYear ?? "all"}.csv`
              )
            }}
          />
        </section>

        <section>
          <ProductsPanel
            products={pagedProducts}
            categories={categories}
            filtersOpen={filtersOpen}
            filterName={filterName}
            filterCategory={filterCategory}
            priceOrder={priceOrder}
            page={page}
            totalPages={totalPages}
            isLoading={isLoading}
            formatPrice={formatPrice}
            onToggleFilters={() => setFiltersOpen((prev) => !prev)}
            onFilterNameChange={setFilterName}
            onFilterCategoryChange={setFilterCategory}
            onPriceOrderChange={setPriceOrder}
            onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
            onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            onOpenCreateProduct={openCreateProductModal}
            onEditProduct={openEditProductModal}
            onDeleteProduct={handleDeleteProduct}
            onDownloadCsv={() =>
              downloadCsv(`${API_BASE}/products/csv`, "products.csv")
            }
          />
        </section>

        <section>
          <CategoriesPanel
            categories={categories}
            isLoading={isLoading}
            onOpenCreateCategory={openCreateCategoryModal}
            onEditCategory={openEditCategoryModal}
          />
        </section>

        <ProductModal
          open={isProductModalOpen}
          editingProduct={editingProduct}
          formValues={formValues}
          categories={categories}
          csvFile={csvFile}
          csvStatus={csvStatus}
          csvErrors={csvErrors}
          onOpenChange={setIsProductModalOpen}
          onFormChange={(values) =>
            setFormValues((prev) => ({ ...prev, ...values }))
          }
          onSubmit={handleProductSave}
          onCsvFileChange={(file) => {
            setCsvFile(file)
            setCsvStatus(null)
            setCsvErrors([])
          }}
          onUploadCsv={() => csvFile && handleCsvUpload(csvFile)}
        />

        <CategoryModal
          open={isCategoryModalOpen}
          title={editingCategory ? "Editar categoria" : "Adicionar categoria"}
          submitLabel={editingCategory ? "Salvar alteracoes" : "Salvar"}
          categoryName={categoryName}
          csvFile={csvCategoryFile}
          csvStatus={csvCategoryStatus}
          csvErrors={csvCategoryErrors}
          onOpenChange={setIsCategoryModalOpen}
          onCategoryNameChange={setCategoryName}
          onSubmit={handleCategorySave}
          onCsvFileChange={(file) => {
            setCsvCategoryFile(file)
            setCsvCategoryStatus(null)
            setCsvCategoryErrors([])
          }}
          onUploadCsv={() =>
            csvCategoryFile && handleCategoryCsvUpload(csvCategoryFile)
          }
        />

        <SalesEditModal
          open={isSalesModalOpen}
          quantity={salesForm.quantity}
          total={salesForm.total}
          onOpenChange={setIsSalesModalOpen}
          onQuantityChange={(value) =>
            setSalesForm((prev) => ({ ...prev, quantity: value }))
          }
          onTotalChange={(value) =>
            setSalesForm((prev) => ({ ...prev, total: value }))
          }
          onSave={handleSalesOverrideSave}
        />
      </main>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
