import { Navigate, Outlet } from "react-router"

// Exemplo básico: verificar se existe um token de autenticação
// Em uma aplicação real, isso viria de um contexto de autenticação, localStorage, etc.
const isAuthenticated = () => {
  // return !!localStorage.getItem('authToken'); // Exemplo
  return true // Placeholder: assumir que está autenticado por enquanto
}

const ProtectedRoutes = () => {
  if (!isAuthenticated()) {
    // Redireciona para a página de login se não estiver autenticado
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet /> // Renderiza o conteúdo da rota filha se autenticado
}

export default ProtectedRoutes
