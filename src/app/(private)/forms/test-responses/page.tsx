"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, CalendarIcon, PersonIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { surveyApi } from "@/apis/survey";

export default function FormResponsesPage() {
  const [loading, setLoading] = useState(true);
  const formParams = useSearchParams();
  const formId = formParams.get("id");

  // API: Get responses
  const {
    data: formFieldsData,
    isLoading: responseLoading,
    isError: responseError,
  } = useQuery({
    queryKey: ["userResponse", formId],
    queryFn: () => surveyApi.getUserResponse({ formId: Number(formId) }),
    enabled: !!formId,
  });

  // API: Get questions
  const {
    data: formQuestions,
    isLoading: questionLoading,
    isError: questionError,
  } = useQuery({
    queryKey: ["formFields", formId],
    queryFn: () => surveyApi.getFormFields({ id: Number(formId) }),
    enabled: !!formId,
  });

  const isDataLoading = responseLoading || questionLoading;
  const isDataError = responseError || questionError;

  // Prepare form fields sorted by order
  const formFields = useMemo(() => {
    if (!formQuestions) return [];
    return [...formQuestions].sort((a, b) => a.field_order - b.field_order);
  }, [formQuestions]);

  // Prepare response data
  const responses = useMemo(() => {
    if (!formFieldsData) return [];
    return formFieldsData;
  }, [formFieldsData]);

  // Helper: Get answer value dynamically based on field type
  const getAnswerValue = (response: any, field: any) => {
    const fieldName = field.field; // like "text", "checkbox", "radio"
    const value = response[fieldName];

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    switch (field.field_type) {
      case "checkbox":
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.join(", ") : "-";
        } catch {
          return value;
        }

      case "select":
      case "radio":
        return value;

      case "file":
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Download
          </a>
        ) : "-";

      case "rating":
        return `${value} / ${field.rating_max || 5}`;

      default:
        return value;
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (isDataError || !formFields.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-gray-600">This form may have been deleted or is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Forms
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Form Responses</h1>
                <p className="text-sm text-gray-600">Responses Summary</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Total Responses: {responses.length}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PersonIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
                  <p className="text-gray-600">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formFields.length}</p>
                  <p className="text-gray-600">Form Fields</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="default">Published</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Responses Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <PersonIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                  <p className="text-gray-600">Responses will appear here once people start submitting your form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        {formFields.map((field) => (
                          <TableHead key={field.id} className="min-w-[150px]">
                            {field.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{response.userId}</TableCell>
                          {formFields.map((field) => (
                            <TableCell key={field.id} className="max-w-[200px] truncate">
                              {getAnswerValue(response, field)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
