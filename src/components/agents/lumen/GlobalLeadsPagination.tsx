'use client'

interface GlobalLeadsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function GlobalLeadsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GlobalLeadsPaginationProps) {
  const isFirst = currentPage === 1
  const isLast = currentPage >= totalPages

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
        aria-disabled={isFirst}
        className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm disabled:opacity-40"
      >
        &lt;
      </button>

      <span className="text-sm text-gray-400">
        Página {currentPage} de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Próxima página"
        aria-disabled={isLast}
        className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  )
}
