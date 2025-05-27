import { DndProvider } from "../components/dnd-provider"
import { AlocacaoGrid } from "../components/alocacao-grid"
import { TurmasPanel } from "../components/turmas-panel"
import { Header } from "../components/header"

export default function AlocacaoHorariosPage() {
  return (
    <div className="">
      <DndProvider>
        <Header />
        <div className="flex gap-6 p-6">
          <div className="w-96">
            <TurmasPanel />
          </div>
          <div className="flex-1">
            <AlocacaoGrid />
          </div>
        </div>
      </DndProvider>
    </div>
  )
}
