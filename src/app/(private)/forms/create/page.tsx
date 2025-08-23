"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormBuilder } from "@/components/form-builder"
import { FormPreview } from "@/components/form-preview"
import { ArrowLeftIcon, EyeOpenIcon, Pencil1Icon, CheckIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import type { FormField } from "@/lib/database"
import useStore from "@/store"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { surveyApi } from "@/apis/survey"
import { constents } from "@/constents"
import { useRouter } from "next/navigation"

export default function CreateFormPage() {
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build")
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [collectEmail, setCollectEmail] = useState(false)
  const [allowMultipleResponses, setAllowMultipleResponses] = useState(true)
  const [fields, setFields] = useState<Omit<FormField, "id" | "form_id" | "created_at">[]>([])

  const userData = useStore((state) => state.loginUser);

  const handleSaveForm = async () => {
    // TODO: Implement form saving with API
    console.log("Saving form:", {
      title: formTitle,
      description: formDescription,
      collectEmail,
      allowMultipleResponses,
      fields,
    })
  }

  const router = useRouter();


  const formCreateMutation = useMutation({
    mutationFn: surveyApi.publishForm,
    onSuccess: () => {
      toast.success("Form published successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Error publishing form: " + error.message);
    }
  })


  const handlePublishForm = async () => {

    if (!userData) {
      toast.warning("User data not found. Cannot publish form.")
      return
    }

    if (!formTitle || !formDescription) {
      toast.warning("Form title and description not found!");
      return;
    }

    if (fields.length === 0) {
      toast.warning("Please added fields and try again!");
      return;
    }

    try {
      const publishedForm = {
        user_id: userData.empID!,
        title: formTitle?.trim() || "Untitled Form",
        description: formDescription?.trim() || "",
        is_published: 0,
        companyID: userData.companyInfo?.[0]?.companyID ?? 1,
        form_fields: fields.map((field, index) => ({
          // "number" | "text" | "textarea" | "select" | "radio" | "checkbox" | "email" | "date" | "file" | "rating"
          field_type: field.field_type === "number" ? '4' : field.field_type === "textarea" ? '2' : field.field_type === "checkbox" ? '8' : field.field_type === "date" ? '5' : field.field_type === "email" ? '3' : field.field_type == "file" ? '9' : field.field_type === "radio" ? '7' : field.field_type === "rating" ? '10' : field.field_type === "select" ? '6' : '1',
          label: field.label,
          placeholder: field.placeholder,
          is_required: field.is_required ? 1 : 0,
          options: JSON.stringify(field.options ?? []),
          field_order: field.field_order ?? index + 1,
          rating_max: field.rating_max,
          file_allowed_types: JSON.stringify(field.file_allowed_types ?? []),
          file_max_count: field.file_max_count,
          file_max_size: field.file_max_size
        })),
      }

      console.log("Publishing form data:", publishedForm);

      // @ts-ignore
      formCreateMutation.mutate(publishedForm);


    } catch (error) {
      console.error("Error publishing form:", error)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Create New Form</h1>
                <p className="text-sm text-gray-600">Build your form step by step</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeTab === "build" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("build")}
                  className="text-xs"
                >
                  <Pencil1Icon className="w-3 h-3 mr-1" />
                  Build
                </Button>
                <Button
                  variant={activeTab === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                  className="text-xs"
                >
                  <EyeOpenIcon className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
              {/* <Button onClick={handleSaveForm} variant="outline">
                Save Draft
              </Button> */}
              <Button onClick={handlePublishForm} className="bg-blue-600 hover:bg-blue-700">
                <CheckIcon className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "build" ? (
            <motion.div
              key="build"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Form Settings */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Form Title</Label>
                      <Input
                        id="title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter form title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe your form"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <Label htmlFor="collect-email">Collect Email</Label>
                      <Switch id="collect-email" checked={collectEmail} onCheckedChange={setCollectEmail} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="multiple-responses">Allow Multiple Responses</Label>
                      <Switch
                        id="multiple-responses"
                        checked={allowMultipleResponses}
                        onCheckedChange={setAllowMultipleResponses}
                      />
                    </div> */}
                  </CardContent>
                </Card>
              </div>

              {/* Form Builder */}
              <div className="lg:col-span-2">
                <FormBuilder fields={fields} onFieldsChange={setFields} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FormPreview
                title={formTitle}
                description={formDescription}
                fields={fields}
                collectEmail={collectEmail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
