"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { toast } from "@/components/ui/use-toast"
import type { Form } from "@/lib/database"
import { surveyApi } from "@/apis/survey"
import QuickStats from "./_components/quickStats"
import EmptyState from "./_components/emptyState"
import FormCard, { FormCardSkeleton } from "./_components/formCard"
import useStore from "@/store"
import { hasValidDesignation } from "@/constents"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | "all">("all")

  const loginUser = useStore((state) => state.loginUser)

  const queryClient = useQueryClient();

  const surveyHeaderDelete = useMutation({
    mutationKey: ["deleteSurvey"],
    mutationFn: surveyApi.deleteSurvey,
    // @ts-ignore
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });
      const previousDashboard = queryClient.getQueryData<Form[]>(["dashboard"]);

      queryClient.setQueryData<Form[]>(["dashboard"], (old) =>
        old ? old.filter((form) => form.id !== Number(id)) : []
      );

      return { previousDashboard };
    },
    onError: (_err, _id, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
      toast({
        title: "Error deleting form",
        description: "There was a problem deleting your form. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Form deleted",
        description: "Your form has been successfully deleted.",
      });
    },
    onSettled: () => {
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



    if (statusFilter === 1) {
      filtered = filtered.filter((form: any) => form.state === 1);
    } else if (statusFilter == "all") {
      if (hasValidDesignation(loginUser)) {
        filtered = filtered.filter((form: any) => form.state === 1 || form.state === 2 || form.state === 3);
      } else {
        filtered = filtered.filter((form: any) => form.state === 2);
      }
    }


    setFilteredForms(filtered)
  }, [dashboardData, searchQuery, statusFilter])

  const handleDuplicateForm = async (form: Form) => {
    try {
      // TODO: Implement duplication API call
      toast({
        title: "Duplicating form...",
        description: "Your form is being duplicated.",
      });
    } catch (error) {
      console.error("Error duplicating form:", error)
      toast({
        title: "Error duplicating form",
        description: "There was a problem duplicating your form. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteForm = async (formId: number) => {
    if (!formId) return;
    // @ts-ignore
    surveyHeaderDelete.mutate({ id: formId.toString() });
  }

  const copyFormLink = (formId: number) => {
    const formUrl = `${window.location.origin}/forms/${formId}`
    navigator.clipboard.writeText(formUrl)
    toast({
      title: "Link copied!",
      description: "Form link has been copied to clipboard.",
    });
  }

  const getStatusBadge = (state: number) => {
    switch (state) {
      case 2: // Published
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircledIcon className="w-3 h-3 mr-1" />
          Published
        </Badge>
      case 1: // Pending approval
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200">
          <ClockIcon className="w-3 h-3 mr-1" />
          Pending Approval
        </Badge>
      default:
        return <Badge variant="destructive" className="text-white border-gray-300">
          Rejected From Approval
        </Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* <DashboardHeader /> */}
        <QuickStats />

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search forms by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-2">
            {hasValidDesignation(loginUser) && <Link href="/forms/create">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4" />
                  Create Form
                </Button>
              </Link>}
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All Forms
              </Button>
              {hasValidDesignation(loginUser) && (
                loginUser?.designationID === "462" ||
                loginUser?.designationID === "1639" ||
                loginUser?.designationID === "555"
              ) && (
                <Button
                  variant={statusFilter === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(1)}
                >
                  Pending Approval
                </Button>
              )}
              <Button
                variant={statusFilter === -3 ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(-3)}
              >
                Share Responsibilities
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Forms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <FormCardSkeleton key={i} />
            ))}
          </div>
        ) : statusFilter == 1 ? <>
          {filteredForms.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredForms.length} of {dashboardData.length} forms
            </p>
          )}
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
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
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredForms.length === 0 && (
            <div>
              <strong>There are no panding list...</strong>
            </div>
          )}
        </> : statusFilter == -2 ? <>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error asperiores aut accusamus repudiandae necessitatibus natus, explicabo itaque possimus rerum deleniti, expedita id quod, impedit sed voluptatibus porro quis nesciunt temporibus?</p>
        </> : statusFilter == -3 ? <>
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nam, provident aliquam quisquam illum, repellat porro necessitatibus optio maxime nisi blanditiis expedita magnam aliquid incidunt nesciunt suscipit ratione minima illo saepe.</p></> : (
          <>
            {filteredForms.length > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredForms.length} of {filteredForms.length} forms
              </p>
            )}
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
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
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredForms.length === 0 && (
              <EmptyState
                hasSearch={!!searchQuery}
                hasFilter={statusFilter !== "all"}
              />
            )}
          </>
        )}

        <br /><br />

      </div>
    </div>
  )
}

