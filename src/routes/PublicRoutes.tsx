import { Navigate, Outlet } from "react-router"

// Exemplo básico: verificar se existe um token de autenticação
const isAuthenticated = () => {
  // return !!localStorage.getItem('authToken'); // Exemplo
  return false // Placeholder: assumir que não está autenticado para rotas públicas por enquanto
}

const PublicRoutes = () => {
  if (isAuthenticated()) {
    // Redireciona para a home page se já estiver autenticado e tentar acessar uma rota pública (ex: login)
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <Outlet /> // Renderiza o conteúdo da rota pública se não autenticado
}

export default PublicRoutes
