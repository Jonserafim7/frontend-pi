import { DataTable } from "@/components/data-table/data-table"
import { usersColumns } from "./users-columns"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"

/**
 * Componente de tabela de dados para listar usuários
 */
export function UsersDataTable() {
  const {
    data: usersResponseOrval,
    isPending,
    isError,
  } = useUsuariosControllerFindAll()

  // TODO: Implementar loading e error states
  if (isPending) {
    return <div>Carregando...</div>
  }

  if (isError) {
    return <div>Erro ao carregar usuários</div>
  }

  const users = usersResponseOrval || []

  return (
    <DataTable
      columns={usersColumns}
      data={users}
    />
  )
}
