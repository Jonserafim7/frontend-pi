import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon, PenSquare, Trash } from "lucide-react"
import { useState } from "react"
import { DeleteCourseAlertDialog } from "../delete-course-alert-dialog"
import { CreateEditCourseFormDialog } from "../create-edit-course-form-dialog"
import type { CursoResponseDto } from "@/api-generated/model"

interface CourseActionRowDropdownMenuProps {
  course: CursoResponseDto
}

export function CourseActionRowDropdownMenu({
  course,
}: CourseActionRowDropdownMenuProps) {
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menu de ações</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditMenuOpen(true)}>
            <PenSquare className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteMenuOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCourseAlertDialog
        course={course}
        isOpen={isDeleteMenuOpen}
        onOpenChange={setIsDeleteMenuOpen}
      />
      <CreateEditCourseFormDialog
        course={course}
        isOpen={isEditMenuOpen}
        onOpenChange={setIsEditMenuOpen}
      />
    </>
  )
}
