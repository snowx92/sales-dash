import type * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ActionItem {
  icon: React.ElementType
  label: string
  onClick: () => void
  color: string
}

interface ActionDropdownProps {
  actions: ActionItem[]
}

const getColorClasses = (color: string) => {
  switch (color) {
    case 'blue': return { icon: 'text-blue-600', text: 'text-blue-600' };
    case 'green': return { icon: 'text-green-600', text: 'text-green-600' };
    case 'purple': return { icon: 'text-purple-600', text: 'text-purple-600' };
    case 'gray': return { icon: 'text-gray-600', text: 'text-gray-600' };
    case 'yellow': return { icon: 'text-yellow-600', text: 'text-yellow-600' };
    case 'indigo': return { icon: 'text-indigo-600', text: 'text-indigo-600' };
    case 'red': return { icon: 'text-red-600', text: 'text-red-600' };
    default: return { icon: 'text-gray-600', text: 'text-gray-600' };
  }
};

export function ActionDropdown({ actions }: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          const colorClasses = getColorClasses(action.color);
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <action.icon className={`h-4 w-4 ${colorClasses.icon}`} />
              <span className={colorClasses.text}>
                {action.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

