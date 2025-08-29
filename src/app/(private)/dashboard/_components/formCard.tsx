import { JSX } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { Form } from "@/lib/database"
import { motion } from "framer-motion"
import { BarChartIcon, ClockIcon, CopyIcon, TrashIcon } from "lucide-react"
import Link from "next/link"
import { DotsHorizontalIcon, EyeOpenIcon, Pencil1Icon, Share1Icon } from "@radix-ui/react-icons"
import useStore from "@/store"



type FormCardProps = {
  form: Form
  index: number
  onDuplicate: (form: Form) => void
  onDelete: (id: number) => void
  onCopyLink: (id: number) => void
  getStatusBadge: (state: number) => JSX.Element
}

const FormCard = ({
  form,
  index,
  onDuplicate,
  onDelete,
  onCopyLink,
  getStatusBadge
}: FormCardProps) => {
  const formatDate = (dateString: string) => {


    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      layout
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">{form.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{form.description || "No description"}</CardDescription>
            </div>
            <FormActionsMenu
              formId={form.id}
              onDuplicate={() => onDuplicate(form)}
              onDelete={() => onDelete(form.id)}
              onCopyLink={() => onCopyLink(form.id)}
              isPublished={form.state === 2}
              response={Number(form.totalResponse)}
            />
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <BarChartIcon className="w-4 h-4 mr-1" />
              <span>{form.totalResponse || 0} responses</span>
            </div>
            {getStatusBadge(form.state || 1)}
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Author</div>
            <div className="flex items-center space-x-2">
              {form.author_img ? (
                <img
                  className="w-6 h-6 rounded-full object-cover"
                  src={`data:image/jpeg;base64,${form.author_img}`}
                  alt={form.author_name}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {form.author_name ? form.author_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-700 truncate">{form.author_name || "Unknown Author"}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            Created {formatDate(form.created_at)}
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 pt-3 border-t border-gray-100">
          <div className="flex gap-2 w-full">
            <Link href={`/forms/response?id=${form.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-white">
                <EyeOpenIcon className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            {form.state !== 1 && <Link href={`/forms/test-responses?id=${form.id}`} className="flex-1">
              <Button
                variant={form.totalResponse! > 0 ? "default" : "outline"}
                size="sm"
                className="w-full"
                disabled={form.totalResponse === 0}
              >
                <BarChartIcon className="w-4 h-4 mr-2" />
                Responses
              </Button>
            </Link>}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export const FormCardSkeleton = () => (
  <Card className="h-full overflow-hidden border-gray-200">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mt-1" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardHeader>

    <CardContent className="pb-3">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
    </CardContent>

    <CardFooter className="bg-gray-50 pt-3 border-t border-gray-100">
      <div className="flex gap-2 w-full">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </CardFooter>
  </Card>
)


type FormActionsMenuProps = {
  formId: number
  onDuplicate: () => void
  onDelete: () => void
  onCopyLink: () => void
  isPublished: boolean
  response: number
}

const FormActionsMenu = ({ formId, onDuplicate, onDelete, onCopyLink, isPublished, response }: FormActionsMenuProps) => {
  const userData = useStore((state) => state.loginUser);

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <DotsHorizontalIcon className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      {/* <Link href={`/forms/${formId}/edit`}>
        <DropdownMenuItem>
          <Pencil1Icon className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </Link> */}
      <Link href={`/forms/response?id=${formId}`}>
        <DropdownMenuItem>
          <EyeOpenIcon className="w-4 h-4 mr-2" />
          Preview
        </DropdownMenuItem>
      </Link>
      {isPublished && (
        <DropdownMenuItem onClick={onCopyLink}>
          <Share1Icon className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      )}
      {/* <DropdownMenuItem onClick={onDuplicate}>
        <CopyIcon className="w-4 h-4 mr-2" />
        Duplicate
      </DropdownMenuItem> */}
      <DropdownMenuSeparator />
      {
        [462, 1639, 508].includes(Number(userData?.designationID)) && response == 0 && (
          <DropdownMenuItem
            onClick={onDelete}
            disabled={response > 0}
            className="text-red-600 focus:text-red-600"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )
      }


    </DropdownMenuContent>
  </DropdownMenu>
}


export default FormCard;