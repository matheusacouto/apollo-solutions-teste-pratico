type CsvErrorsProps = {
  errors: string[]
}

export function CsvErrors({ errors }: CsvErrorsProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className="max-w-sm text-xs text-red-400">
      {errors.slice(0, 3).map((error) => (
        <div key={error}>{error}</div>
      ))}
      {errors.length > 3 ? <div>+{errors.length - 3} erros</div> : null}
    </div>
  )
}
