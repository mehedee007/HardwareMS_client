"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  PlusIcon,
  FileTextIcon,
  BarChartIcon,
  Pencil1Icon,
  EyeOpenIcon,
  Share1Icon,
  TrashIcon,
  CopyIcon,
  DotsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ApiClient } from "@/lib/api-client"
import type { Form } from "@/lib/database"
import { surveyApi } from "@/apis/survey"
import DashboardHeader from "./_components/header"
import QuickStats from "./_components/quickStats"
import RecentIssues from "./_components/recentIssues"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter] = useState<"all" | "published" | "draft">("all")

const queryClient = useQueryClient();

const surveyHeaderDelete = useMutation({
  mutationKey: ["deleteSurvey"],
  mutationFn: surveyApi.deleteSurvey,
  // @ts-ignore
  onMutate: async ({ id }) => {
    // Cancel ongoing dashboard fetches
    await queryClient.cancelQueries({ queryKey: ["dashboard"] });

    // Get previous cache
    const previousDashboard = queryClient.getQueryData<Form[]>(["dashboard"]);

    // Optimistically update UI
    queryClient.setQueryData<Form[]>(["dashboard"], (old) =>
      old ? old.filter((form) => form.id !== Number(id)) : []
    );

    return { previousDashboard };
  },
  onError: (_err, _id, context) => {
    // Rollback if mutation fails
    if (context?.previousDashboard) {
      queryClient.setQueryData(["dashboard"], context.previousDashboard);
    }
  },
  onSettled: () => {
    // Refetch final data
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  },
});


const { data: dashboardData = [], isLoading } = useQuery({
  queryKey: ["dashboard"],
  queryFn: surveyApi.dashboardInfo,
});


  const [filteredForms, setFilteredForms] = useState<Form[]>([])

  // Filter forms based on search and status
  useEffect(() => {
    let filtered = dashboardData

    if (searchQuery) {
      filtered = filtered.filter(
        (form: any) =>
          form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((form: any) =>
        statusFilter === "published" ? form.is_published : !form.is_published
      )
    }

    setFilteredForms(filtered)
  }, [dashboardData, searchQuery, statusFilter])

  const handleDuplicateForm = async (form: Form) => {
    try {
      console.log("Duplicating form:", form.id)
      // TODO: Implement duplication
    } catch (error) {
      console.error("Error duplicating form:", error)
    }
  }

const handleDeleteForm = async (formId: number) => {
  if (!formId) return;
  // @ts-ignore
  surveyHeaderDelete.mutate({ id: formId + "" });
};


  const copyFormLink = (formId: number) => {
    const formUrl = `${window.location.origin}/forms/${formId}`
    navigator.clipboard.writeText(formUrl)
    // TODO: Show toast notification
  }

  const getResponseCount = (formId: number) => {
    // TODO: Replace with actual data from API
    const mockCounts: Record<number, number> = { 1: 24, 2: 156, 3: 0 }
    return mockCounts[formId] || 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <QuickStats />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Forms Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredForms.map((form, index) => (
            <FormCard
              key={form.id}
              form={form}
              index={index}
              onDuplicate={handleDuplicateForm}
              onDelete={handleDeleteForm}
              onCopyLink={copyFormLink}
              responseCount={getResponseCount(form.id)}
            />
          ))}
        </motion.div>

        {filteredForms.length === 0 && (
          <EmptyState
            hasSearch={!!searchQuery || statusFilter !== "all"}
          />
        )}
        <br /><br />
        {/* <RecentIssues /> */}
      </div>

    </div>
  )
}

type FormCardProps = {
  form: Form
  index: number
  onDuplicate: (form: Form) => void
  onDelete: (id: number) => void
  onCopyLink: (id: number) => void
  responseCount: number
}

const FormCard = ({
  form,
  index,
  onDuplicate,
  onDelete,
  onCopyLink,
  responseCount
}: FormCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{form.title}</CardTitle>
              <Badge variant="default">
                Published
              </Badge>
            </div>
            <CardDescription>{form.description}</CardDescription>
          </div>
          <FormActionsMenu
            formId={form.id}
            onDuplicate={() => onDuplicate(form)}
            onDelete={() => onDelete(form.id)}
            onCopyLink={() => onCopyLink(form.id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{form.totalResponse} responses</span>
          <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/forms/response?id=${form.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">

              <EyeOpenIcon className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Link href={`/forms/test-responses?id=${form.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <BarChartIcon className="w-3 h-3 mr-1" />
              Responses
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

type FormActionsMenuProps = {
  formId: number
  onDuplicate: () => void
  onDelete: () => void
  onCopyLink: () => void
}

const FormActionsMenu = ({ formId, onDuplicate, onDelete, onCopyLink }: FormActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <DotsHorizontalIcon className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
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
      {/* <DropdownMenuItem onClick={onCopyLink}>
        <Share1Icon className="w-4 h-4 mr-2" />
        Copy Link
      </DropdownMenuItem> */}
      {/* <DropdownMenuItem onClick={onDuplicate}>
        <CopyIcon className="w-4 h-4 mr-2" />
        Duplicate
      </DropdownMenuItem> */}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={onDelete}
        className="text-red-600 focus:text-red-600"
      >
        <TrashIcon className="w-4 h-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

type EmptyStateProps = {
  hasSearch: boolean
}

const EmptyState = ({ hasSearch }: EmptyStateProps) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
    <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {hasSearch ? "No forms found" : "No forms yet"}
    </h3>
    <p className="text-gray-600 mb-4">
      {hasSearch
        ? "Try adjusting your search or filter criteria"
        : "Get started by creating your first form"}
    </p>
    {!hasSearch && (
      <a href="/forms/create">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Your First Form
        </Button>
      </a>
    )}

  </motion.div>
)