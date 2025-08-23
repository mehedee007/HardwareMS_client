// API client using Axios for form operations with JSON mock data
import axios from "axios"
import type { Form, FormField, FormResponse } from "./database"

import formsData from "../data/forms.json"
import responsesData from "../data/responses.json"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

export interface CreateFormData {
  title: string
  description?: string
  fields: Omit<FormField, "id" | "form_id" | "created_at">[]
}

export interface SubmitFormData {
  answers: { field_id: string; value?: string; values?: string[] }[]
  respondent_email?: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class ApiClient {
  private static useMockData = !process.env.NEXT_PUBLIC_API_URL

  // Forms
  static async getForms(): Promise<Form[]> {
    if (this.useMockData) {
      await delay(300) // Simulate network delay
      return formsData?.forms as unknown as Form[]
    }
    const response = await api.get("/forms")
    return response.data
  }

  static async getForm(id: string | number): Promise<Form & { fields: FormField[] }> {
    if (this.useMockData) {
      await delay(200)
      const form = formsData.forms.find((f) => f.id === id)
      if (!form) throw new Error("Form not found")
      return form as unknown as Form & { fields: FormField[] }
    }
    const response = await api.get(`/forms/${id}`)
    return response.data
  }

  static async createForm(data: CreateFormData): Promise<any> {
    if (this.useMockData) {
      await delay(500)
      // Simulate creating a new form
      const newForm: any = {
        id: 1,
        title: data.title,
        description: data.description || "",
        status: 1,
        user_id: 123,
        settings: {
          allow_multiple_responses: false,
          collect_email: true,
          show_progress_bar: true,
          confirmation_message: "Thank you for your response!",
        },
        fields: data.fields.map((field, index) => ({
          ...field,
          id: `field_${Date.now()}_${index}`,
          form_id: `form_${Date.now()}`,
          order: index + 1,
          created_at: new Date().toISOString(),
        })),
      }
      return newForm
    }
    const response = await api.post("/forms", data)
    return response.data
  }

  static async updateForm(id: string | number, data: Partial<Form>): Promise<Form> {
    if (this.useMockData) {
      await delay(400)
      const form = formsData.forms.find((f) => f.id === id)
      if (!form) throw new Error("Form not found")
      return { ...form, ...data, updated_at: new Date().toISOString() } as Form
    }
    const response = await api.put(`/forms/${id}`, data)
    return response.data
  }

  static async deleteForm(id: string | number): Promise<void> {
    if (this.useMockData) {
      await delay(300)
      return // Simulate successful deletion
    }
    await api.delete(`/forms/${id}`)
  }

  static async publishForm(id: string): Promise<Form> {
    if (this.useMockData) {
      await delay(300)
      const form = formsData.forms.find((f) => f.id === id)
      if (!form) throw new Error("Form not found")
      return { ...form, status: "published", updated_at: new Date().toISOString() } as unknown as Form
    }
    const response = await api.patch(`/forms/${id}/publish`)
    return response.data
  }

  static async duplicateForm(id: string): Promise<Form> {
    if (this.useMockData) {
      await delay(500)
      const originalForm = formsData.forms.find((f) => f.id === id)
      if (!originalForm) throw new Error("Form not found")

      const duplicatedForm: any = {
        ...originalForm,
        id: 1,
        title: `${originalForm.title} (Copy)`,
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        fields: originalForm.fields.map((field, index) => ({
          ...field,
          id: `field_${Date.now()}_${index}`,
          form_id: `form_${Date.now()}`,
        })),
      }
      return duplicatedForm
    }
    const response = await api.post(`/forms/${id}/duplicate`)
    return response.data
  }

  // Form Responses
  static async submitForm(formId: string | number, data: SubmitFormData): Promise<any> {
    if (this.useMockData) {
      await delay(600)
      const newResponse: any = {
        id: 1,
        form_id: 1,
        submitted_at: new Date().toISOString(),
        answers: data.answers.map((answer) => ({
          field_id: answer.field_id,
          value: answer.value,
          values: answer.values,
        })),
      }
      return newResponse
    }
    const response = await api.post(`/forms/${formId}/submit`, data)
    return response.data
  }

  static async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (this.useMockData) {
      await delay(300)
      return responsesData.responses.filter((r) => r.form_id === formId) as unknown as FormResponse[]
    }
    const response = await api.get(`/forms/${formId}/responses`)
    return response.data
  }

  static async exportFormResponses(formId: string, format: "csv" | "json" = "csv"): Promise<Blob> {
    if (this.useMockData) {
      await delay(800)
      const responses = responsesData.responses.filter((r) => r.form_id === formId)
      const form = formsData.forms.find((f) => f.id === formId)

      if (format === "json") {
        const jsonData = JSON.stringify({ form, responses }, null, 2)
        return new Blob([jsonData], { type: "application/json" })
      } else {
        // Generate CSV
        let csv = "Response ID,Submitted At"
        if (form) {
          form.fields.forEach((field) => {
            csv += `,${field.label}`
          })
        }
        csv += "\n"

        responses.forEach((response) => {
          csv += `${response.id},${response.submitted_at}`
          if (form) {
            form.fields.forEach((field) => {
              const answer = response.answers.find((a) => a.field_id === field.id)
              // @ts-ignore
              const value = answer?.value ? answer.value.join("; ") : answer?.value || ""
              csv += `,"${value.replace(/"/g, '""')}"`
            })
          }
          csv += "\n"
        })

        return new Blob([csv], { type: "text/csv" })
      }
    }
    const response = await api.get(`/forms/${formId}/export`, {
      params: { format },
      responseType: "blob",
    })
    return response.data
  }

  // Analytics
  static async getFormAnalytics(formId: string): Promise<any> {
    if (this.useMockData) {
      await delay(400)
      const responses = responsesData.responses.filter((r) => r.form_id === formId)
      const form = formsData.forms.find((f) => f.id === formId)

      // Generate mock analytics data
      const analytics = {
        total_responses: responses.length,
        completion_rate: 85,
        average_completion_time: 180, // seconds
        responses_over_time: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          responses: Math.floor(Math.random() * 10),
        })),
        field_analytics:
          form?.fields.map((field) => {
            const fieldResponses = responses.flatMap((r) => r.answers.filter((a) => a.field_id === field.id))

            if (field.type === "radio" || field.type === "select") {
              const distribution =
                field.options?.reduce(
                  (acc, option) => {
                    acc[option] = fieldResponses.filter((r) => r.value === option).length
                    return acc
                  },
                  {} as Record<string, number>,
                ) || {}

              return {
                field_id: field.id,
                field_label: field.label,
                field_type: field.type,
                response_count: fieldResponses.length,
                distribution,
              }
            }

            return {
              field_id: field.id,
              field_label: field.label,
              field_type: field.type,
              response_count: fieldResponses.length,
            }
          }) || [],
      }

      return analytics
    }
    const response = await api.get(`/forms/${formId}/analytics`)
    return response.data
  }
}
