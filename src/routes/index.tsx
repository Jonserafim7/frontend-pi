import { Route, Routes } from "react-router"
// import AppLayout from '@/components/Layout/AppLayout'; // Será usado quando AppLayout for criado
// import LoginPage from '@/features/autenticacao/pages/LoginPage'; // Exemplo, será criado depois
// import HomePage from '@/pages/HomePage'; // Exemplo, será criado depois

// import ProtectedRoutes from './ProtectedRoutes';
// import PublicRoutes from './PublicRoutes';

export function AppRoutes() {
  return (
    <Routes>
      {/* Exemplo de Rota Pública (será encapsulada por PublicRoutes) */}
      {/* <Route path="/login" element={<LoginPage />} /> */}

      {/* Exemplo de Rotas Protegidas (serão encapsuladas por ProtectedRoutes e usarão AppLayout) */}
      {/* <Route element={<ProtectedRoutes />}> */}
      {/*   <Route element={<AppLayout />}> */}
      {/*     <Route path="/" element={<HomePage />} /> */}
      {/*     {/* Outras rotas protegidas aqui... */}
      {/*   </Route> */}
      {/* </Route> */}

      {/* Rota de fallback ou página não encontrada */}
      <Route
        path="*"
        element={<div>Página não encontrada</div>}
      />
    </Routes>
  )
}
