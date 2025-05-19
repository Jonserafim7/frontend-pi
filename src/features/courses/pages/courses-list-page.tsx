import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GraduationCapIcon, Plus } from "lucide-react"
import { CreateEditCourseFormDialog } from "../components/create-edit-course-form-dialog"
import { CourseDataTable } from "../components/data-table/course-data-table"
import { HeaderIconContainer } from "@/components/icon-container"

/**
 * Página de listagem de cursos
 */
export function CoursesListPage() {
  const [isCreateEditCourseFormDialogOpen, setIsCreateEditCourseFormDialogOpen] =
    useState(false)

  return (
    <div className="container mx-auto flex flex-col gap-8 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderIconContainer Icon={GraduationCapIcon} />
          <div>
            <h1 className="text-2xl font-bold">Cursos</h1>
            <p className="text-muted-foreground">Gerencie os cursos do sistema</p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateEditCourseFormDialogOpen(true)}
          disabled={isCreateEditCourseFormDialogOpen}
        >
          Novo Curso
          <Plus />
        </Button>
      </div>
      <CreateEditCourseFormDialog
        isOpen={isCreateEditCourseFormDialogOpen}
        onOpenChange={setIsCreateEditCourseFormDialogOpen}
      />
      <CourseDataTable />
    </div>
  )
}
