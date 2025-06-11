import { DataTable } from "@/components/data-table/data-table"
import { usersColumns } from "./users-columns"
import { useUsuariosControllerFindAll } from "@/api-generated/client/usuarios/usuarios"
import { useSearchParams } from "react-router"
import { UsuarioResponseDtoPapel } from "@/api-generated/model/usuario-response-dto-papel"

/**
 * Componente de tabela de dados para listar usuários
 * @component
 * @example
 * <UsersDataTable />
 *
 * @description
 * Exibe uma tabela com todos os usuários do sistema, com suporte a filtros por papel
 * através de query parameters na URL (ex: ?papel=PROFESSOR)
 *
 * @returns {JSX.Element} Tabela de usuários com filtros
 *
 * @since 1.0.0
 * @see {@link UserListPage} - Página que utiliza este componente
 */
export function UsersDataTable() {
  const [searchParams] = useSearchParams()

  /**
   * Parâmetro de filtro por papel na URL
   * @type {UsuarioResponseDtoPapel | undefined}
   */
  const papelFilter = searchParams.get("papel") as UsuarioResponseDtoPapel | null

  const {
    data: usersResponseOrval,
    isPending,
    isError,
  } = useUsuariosControllerFindAll({
    // Passa o filtro por papel se estiver presente na URL
    papel: papelFilter || undefined,
  })

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
