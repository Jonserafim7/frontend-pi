interface IconContainerProps {
  Icon: React.ElementType
}

export function HeaderIconContainer({ Icon }: IconContainerProps) {
  return (
    <div className="bg-primary flex size-10 items-center justify-center rounded-md p-1.5">
      <Icon className="text-primary-foreground size-6" />
    </div>
  )
}
