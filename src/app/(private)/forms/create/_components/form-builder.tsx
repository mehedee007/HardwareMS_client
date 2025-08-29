"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  TrashIcon,
  DragHandleDots2Icon,
  Pencil2Icon,
  CheckIcon,
} from "@radix-ui/react-icons";
import type { FormField } from "@/lib/database";
// import UseAI from "./useAi";

interface FormBuilderProps {
  fields: Omit<FormField, "id" | "form_id" | "created_at">[];
  onFieldsChange: (fields: Omit<FormField, "id" | "form_id" | "created_at">[]) => void;
}

const fieldTypes = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Single Choice" },
  { value: "checkbox", label: "Multiple Choice" },
  // { value: "file", label: "File Upload" },
  { value: "rating", label: "Star Rating" },
];

export function FormBuilder({ fields, onFieldsChange }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<number | null>(null);

  const addField = (type: FormField["field_type"]) => {
    const label = `${type=="checkbox"? "Multiple Choice": type=="radio" ? "Single Choice": type} field`.charAt(0).toUpperCase() + `${type=="checkbox"? "Multiple Choice": type=="radio" ? "Single Choice": type} field`.slice(1)
    const newField: Omit<FormField, "id" | "form_id" | "created_at"> = {
      field_type: type,
      label: label,
      placeholder: type === "textarea" ? "Enter your response..." : "Enter text...",
      is_required: false,
      options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1", "Option 2"] : null,
      field_order: 1, // This will be updated in the reordering below
      ...(type === "file" && {
        file_max_size: 10,
        file_max_count: 1,
        file_allowed_types: ["image/*", "application/pdf", ".doc,.docx"],
      }),
      ...(type === "rating" && { rating_max: 5 }),
    };

    // Add new field at the beginning and update field_order for all fields
    const updatedFields = [
      newField,
      ...fields.map((field, index) => ({ ...field, field_order: index + 2 }))
    ];

    onFieldsChange(updatedFields);
    setEditingField(0); // Set to edit the first field (the newly added one)
  };

  const updateField = (index: number, updates: Partial<Omit<FormField, "id" | "form_id" | "created_at">>) => {
    const updatedFields = fields.map((field, i) => (i === index ? { ...field, ...updates } : field));
    onFieldsChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, field_order: i + 1 }));
    onFieldsChange(updatedFields);
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      {/* Field Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Field</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {fieldTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                onClick={() => addField(type.value as FormField["field_type"])}
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
            {/* <UseAI>
              <Button
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 w-full"
              >
                <span className="text-xs">Create use AI</span>
              </Button>
            </UseAI> */}
          </div>
        </CardContent>
      </Card>

      {/* Render Fields */}
      <div className="space-y-4">
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DragHandleDots2Icon className="w-4 h-4 text-gray-400 cursor-move" />
                    <Badge variant="secondary">{field.label}</Badge>
                    {field.is_required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(editingField === index ? null : index)}
                    >
                      {editingField === index ? <CheckIcon /> : <Pencil2Icon />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {editingField === index ? (
                    <div className="space-y-4">
                      {/* Label */}
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      {/* Placeholder for text-like fields */}
                      {["text", "textarea", "email", "number", "date"].includes(field.field_type) && (
                        <div>
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {/* Options for Select, Radio, Checkbox */}
                      {["select", "radio", "checkbox"].includes(field.field_type) && (
                        <div>
                          <Label>Options</Label>
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 mt-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  updateField(index, { options: newOptions });
                                }}
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const newOptions = field.options?.filter((_, i) => i !== optIndex) || [];
                                  updateField(index, { options: newOptions });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}

                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() =>
                              // @ts-ignore
                              updateField(index, { options: [...(field.options || []), `Option ${field.options?.length + 1 || 1}`] })
                            }
                          >
                            Add Option
                          </Button>
                        </div>
                      )}

                      {/* File Upload Configuration */}
                      {field.field_type === "file" && (
                        <div className="space-y-2">
                          <Label>Allowed File Types</Label>
                          <Input
                            value={field.file_allowed_types?.join(", ") || ""}
                            onChange={(e) => updateField(index, { file_allowed_types: e.target.value.split(",") })}
                            placeholder="e.g. image/*, application/pdf"
                          />
                          <Label>Max File Size (MB)</Label>
                          <Input
                            type="number"
                            value={field.file_max_size || 10}
                            onChange={(e) => updateField(index, { file_max_size: Number(e.target.value) })}
                          />
                          <Label>Max File Count</Label>
                          <Input
                            type="number"
                            value={field.file_max_count || 1}
                            onChange={(e) => updateField(index, { file_max_count: Number(e.target.value) })}
                          />
                        </div>
                      )}

                      {/* Rating Configuration */}
                      {field.field_type === "rating" && (
                        <div>
                          <Label>Max Rating Stars</Label>
                          <Input
                            type="number"
                            value={field.rating_max || 5}
                            onChange={(e) => updateField(index, { rating_max: Number(e.target.value) })}
                          />
                        </div>
                      )}

                      {/* Required Toggle */}
                      <div className="flex items-center justify-between mt-4">
                        <Label>Required</Label>
                        <Switch
                          checked={field.is_required}
                          onCheckedChange={(checked) => updateField(index, { is_required: checked })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">{field.label}</h3>
                      {field.placeholder && <p className="text-sm text-gray-600 mt-1">{field.placeholder}</p>}
                    </div>
                  )}
                </CardContent>

              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {fields.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <PlusIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600">Start building your form by adding fields above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}