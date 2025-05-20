import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

/**
 * Propriedades para o componente SkeletonTable
 */
interface SkeletonTableProps {
  columns: number
  rows: number
}

/**
 * Componente que exibe uma tabela de skeleton para loading states
 */
export function SkeletonTable({ columns, rows }: SkeletonTableProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Barra de pesquisa com ícone */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72 max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 opacity-30" />
          <Skeleton className="h-10 w-full rounded-md pl-8" />
        </div>
      </div>

      {/* Tabela com estilo igual ao DataTable */}
      <div className="bg-background/50 overflow-hidden rounded-lg border backdrop-blur-sm transition">
        <div className="relative">
          <Table className="[&_thead]:bg-muted/50 [&_thead_tr]:border-b-2">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="text-primary h-12 px-8 text-sm font-bold"
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                  )}
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell 
                      key={colIndex}
                      className="px-8 py-3"
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  )
}
