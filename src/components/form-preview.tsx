"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StarIcon } from "@radix-ui/react-icons"
import type { FormField } from "@/lib/database"

interface FormPreviewProps {
  title: string
  description: string
  fields: Omit<FormField, "id" | "form_id" | "created_at">[]
  collectEmail: boolean
}

export function FormPreview({ title, description, fields, collectEmail }: FormPreviewProps) {
  console.log("Fields: ",fields);
  
  const [responses, setResponses] = useState<Record<string, any>>({})

  const handleInputChange = (fieldIndex: number, value: any) => {
    console.log(" Form preview - field response:", { fieldIndex, value, fieldType: fields[fieldIndex]?.field_type })

    setResponses((prev) => ({
      ...prev,
      [fieldIndex]: value,
    }))
  }

  const handleSubmit = () => {
    console.log(" Form preview - form submission:", {
      formTitle: title,
      responses,
      collectEmail,
      totalFields: fields.length,
    })
  }

  const renderField = (field: Omit<FormField, "id" | "form_id" | "created_at">, index: number) => {
    const fieldId = `field-${index}`

    switch (field.field_type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            id={fieldId}
            type={field.field_type === "email" ? "email" : field.field_type === "number" ? "number" : "text"}
            placeholder={field.placeholder || ""}
            value={responses[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        )

      case "textarea":
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder || ""}
            value={responses[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            rows={4}
          />
        )

      case "date":
        return (
          <Input
            id={fieldId}
            type="date"
            value={responses[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        )

      case "select":
        return (
          <Select value={responses[index] || ""} onValueChange={(value) => handleInputChange(index, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "radio":
        return (
          <RadioGroup value={responses[index] || ""} onValueChange={(value) => handleInputChange(index, value)}>
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${fieldId}-${i}`} />
                <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldId}-${i}`}
                  checked={(responses[index] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = responses[index] || []
                    if (checked) {
                      handleInputChange(index, [...currentValues, option])
                    } else {
                      handleInputChange(
                        index,
                        currentValues.filter((v: string) => v !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "file":
        return (
          <div className="space-y-2">
            <Input
              id={fieldId}
              type="file"
              multiple={!!(field?.file_max_count && field.file_max_count > 1)}
              accept={field.file_allowed_types?.join(",")}
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                console.log(" File upload:", {
                  fieldIndex: index,
                  fileCount: files.length,
                  maxAllowed: field.file_max_count,
                  maxSize: field.file_max_size,
                })
                handleInputChange(index, files)
              }}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>Max file size: {field.file_max_size || 10}MB</p>
              <p>Max files: {field.file_max_count || 1}</p>
              {field.file_allowed_types && <p>Allowed types: {field.file_allowed_types.join(", ")}</p>}
            </div>
          </div>
        )

      case "rating":
        const maxRating = field.rating_max || 5
        const currentRating = responses[index] || 0
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: maxRating }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInputChange(index, i + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <StarIcon
                    className={`w-6 h-6 ${
                      i < currentRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              {currentRating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {currentRating} of {maxRating} stars
                </span>
              )}
            </div>
            {currentRating > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange(index, 0)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear rating
              </Button>
            )}
          </div>
        )

      default:
        return <div>Unsupported field type</div>
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title || "Untitled Form"}</CardTitle>
            {description && <p className="text-gray-600 mt-2">{description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            {collectEmail && (
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input id="email" type="email" placeholder="your.email@example.com" className="mt-1" />
              </div>
            )}

            {fields.toReversed().map((field, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Label htmlFor={`field-${index}`} className="text-sm font-medium">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="mt-1">{renderField(field, index)}</div>
              </motion.div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No fields added yet. Switch to Build tab to add form fields.</p>
              </div>
            )}

            <div className="pt-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
