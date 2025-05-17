import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { type UsuarioResponseDto } from "@/api-generated/model"
import { format } from "date-fns"
import { UserActionRowDropdownMenu } from "./user-action-row-dropdown-menu"

/**
 * Definições de colunas para a tabela de usuários
 */
export const usersColumns: ColumnDef<UsuarioResponseDto>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "papel",
    header: "Papel",
    cell: ({ row }) => {
      const papel = row.getValue("papel") as string

      return (
        <Badge
          variant="outline"
          className="capitalize"
        >
          {papel.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dataCriacao",
    header: "Data de Criação",
    cell: ({ row }) => {
      const dataCriacao = row.getValue("dataCriacao") as string

      return format(new Date(dataCriacao), "dd/MM/yyyy HH:mm:ss")
    },
  },
  {
    id: "acoes",
    header: "Ações",
    cell: ({ row }) => {
      const usuario = row.original

      return <UserActionRowDropdownMenu user={usuario} />
    },
  },
]
