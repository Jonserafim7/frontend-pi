import { Outlet } from "react-router"

const AppLayout = () => {
  return (
    <div className="app-layout">
      <header>
        {/* Placeholder para Header */}
        <h1>Header</h1>
      </header>
      <aside>
        {/* Placeholder para Sidebar */}
        <p>Sidebar</p>
      </aside>
      <main>
        <Outlet /> {/* Conteúdo da rota será renderizado aqui */}
      </main>
      <footer>
        {/* Placeholder para Footer */}
        <p>Footer</p>
      </footer>
    </div>
  )
}

export default AppLayout
