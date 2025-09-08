"use client";

import { JSX, useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { surveyApi } from "@/apis/survey";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import FormAnalytics from "./_components/FormAnalytics";
import TagWithResponsiblePerson from "./_components/tagResponsible";
import { Checkbox } from "@/components/ui/checkbox";
import useStore from "@/store";
import { Clock, Share } from "lucide-react";
import TagQuestion from "./_components/tagQuestion";
import ApprovalTagPerson from "./_components/approveTag";
import Timeline from "./_components/timeLine";

interface Field {
  id: number;
  field_type: string;
  label: string;
  field: string;
  field_order: number;
  rating_max?: number;
}

interface Response {
  userId: string;
  adminId: string;
  fulL_NAME: string;
  desgName: string;
  deptname: string;
  secname: string;
  UserImg?: string;
  AdminImg?: string;
  [key: string]: any;
}

const getAnswerValue = (response: Response, field: Field): JSX.Element | string => {
  const fieldName = field.field;
  const value = response[fieldName];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  switch (field.field_type) {
    case "checkbox":
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.join(", ") : String(value);
      } catch {
        return String(value);
      }
    case "selects":
    case "radio":
    case "text":
    case "textarea":
    case "date":
    case "time":
    case "email":
      return String(value);
    case "files":
      return value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 transition-colors"
        >
          Download
        </a>
      ) : (
        "-"
      );
    case "rating":
      const rating = Number(value);
      if (isNaN(rating)) return "-";
      return (
        <div className="flex items-center justify-center space-x-0.5">
          {Array.from({ length: field.rating_max || 5 }, (_, i) => (
            <span
              key={i}
              className={`text-xl transition-colors ${i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
            >
              ★
            </span>
          ))}
        </div>
      );
    default:
      return String(value);
  }
};

export default function FormResponsesPage() {
  const formParams = useSearchParams();
  const formId = formParams.get("id");

  const loginUser = useStore((state) => state.loginUser);
  const setTagResponse = useStore((state) => state.setTagResponse);

  const [selectedFields, setSelectedFields] = useState<number[]>([]);

  const {
    data: formResponses,
    isLoading: responsesLoading,
    isError: responsesError,
  } = useQuery<Response[]>({
    queryKey: ["userResponse", formId],
    queryFn: () => surveyApi.getUserResponse({ formId: Number(formId) }),
    enabled: !!formId,
  });

  const {
    data: formQuestions,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useQuery<Field[]>({
    queryKey: ["formFields", formId],
    queryFn: () => surveyApi.getFormFields({ id: Number(formId) }),
    enabled: !!formId,
  });

  const isLoading = responsesLoading || questionsLoading;
  const isError = responsesError || questionsError;

  const formFields = useMemo(() => {
    if (!formQuestions) return [];
    return [...formQuestions].sort((a, b) => a.field_order - b.field_order);
  }, [formQuestions]);

  const responses = useMemo(() => {
    return formResponses || [];
  }, [formResponses]);

  const handleCheckboxChange = (fieldId: number, isChecked: boolean) => {
    setSelectedFields((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, fieldId];
      } else {
        return prevSelected.filter((id) => id !== fieldId);
      }
    });
  };

  const selectedColumns = useMemo(() => {
    if (selectedFields.length === 0) {
      return [];
    }

    return formFields
      .filter((field) => selectedFields.includes(field.id))
      .map((field) => ({
        form_id: Number(formId),
        question_id: field.id,
        question: field.label,
        field_type: field.field_type,
        number_of_responses: responses.length,
        adminId: loginUser?.empID || 1
      }));
  }, [formId, selectedFields, formFields, responses.length]);

  useEffect(() => {
    setTagResponse(selectedColumns)
  }, [selectedColumns])

  console.log("Selected Columns Metadata:", selectedColumns);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ReloadIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  if (isError || !formFields.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg animate-fadeIn">
          <CardContent className="py-8 px-6">
            <PersonIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Form Not Found
            </h2>
            <p className="text-gray-600">
              This form may have been deleted or is not available. Please check the URL.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block">
              <Button>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Forms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <Link href="/dashboard" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="hover:bg-gray-200">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Forms
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Form Responses</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overview & Analytics</p>
              </div>
              <Badge variant="secondary" className="px-4 py-2 text-md mt-2 md:mt-0 flex-shrink-0">
                Total Responses: {responses.length}
              </Badge>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0">
              {loginUser?.designationID &&
                ['462', '1639', '555'].includes(loginUser.designationID) && (
                  <ApprovalTagPerson>
                    <Button>Approve Tags</Button>
                  </ApprovalTagPerson>
                )}

            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="analytics">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-6">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="responses">Detailed Responses</TabsTrigger>
            </TabsList>
            <TabsContent value="analytics" className="mt-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Response Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormAnalytics responses={responses} formFields={formFields} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="responses" className="mt-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Detailed Responses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {responses.length === 0 ? (
                    <div className="text-center py-12">
                      <PersonIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No responses yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Responses will appear here once people start submitting your form.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <Table className="min-w-[800px] lg:min-w-full border border-gray-300 dark:border-gray-700">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                          <TableRow className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                            <TableHead className="w-12 text-center font-bold text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-700">
                              Sl
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-600 dark:text-gray-300 min-w-[150px] border-r border-gray-300 dark:border-gray-700">
                              User ID
                            </TableHead>
                            <TableHead className="text-center font-bold text-gray-600 dark:text-gray-300 min-w-[150px] border-r border-gray-300 dark:border-gray-700">
                              Surveyor
                            </TableHead>
                            {formFields.map((field) => (
                              <TableHead
                                key={field.id}
                                className="text-center font-bold text-gray-600 dark:text-gray-300 min-w-[200px] border-r border-gray-300 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <span>{field.label}</span>
                                  {loginUser?.designationID && loginUser?.designationID == '508' && <TagQuestion question={{
                                    form_id: Number(formId),
                                    question_id: field.id,
                                    question: field.label,
                                    field_type: field.field_type,
                                    number_of_responses: responses.length,
                                    adminId: loginUser?.empID || 1
                                  }}>
                                    <Button className="w-fit rounded-full border flex" variant="default" size="sm"><Share /></Button>
                                  </TagQuestion>}
                                  {loginUser?.designationID &&
                                    ['462', '1639', '555'].includes(loginUser.designationID) && (
                                      <Timeline question_id={field.id} form_id={Number(formId)}>
                                        <Button className="w-fit rounded-full border flex" variant="default" size="sm">
                                          <Clock />
                                        </Button>
                                      </Timeline>

                                    )}

                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responses.map((response, index) => (
                            <TableRow
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-300 dark:border-gray-700"
                            >
                              <TableCell className="text-center border-r border-gray-300 dark:border-gray-700">
                                {index + 1}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-300 dark:border-gray-700">
                                <HoverCard>
                                  <HoverCardTrigger className="cursor-pointer text-blue-700 dark:text-blue-400 hover:underline">
                                    {response.fulL_NAME}
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80 p-4 shadow-lg rounded-xl dark:bg-gray-900">
                                    <div className="flex items-center space-x-4">
                                      {response?.UserImg && (
                                        <div className="flex-shrink-0">
                                          <img
                                            className="w-12 h-12 rounded-full object-cover"
                                            src={`data:image/jpeg;base64,${response?.UserImg}`}
                                            alt="user-image"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <strong className="block text-md font-semibold text-gray-900 dark:text-gray-100">
                                          {response?.fulL_NAME} <strong>ID: ({response?.userId})</strong>
                                        </strong>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{response?.desgName}</p>
                                        <small className="text-xs text-gray-500 dark:text-gray-400">
                                          Dept: {response?.deptname} | Sec: {response?.secname}
                                        </small>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-300 dark:border-gray-700">
                                <HoverCard>
                                  <HoverCardTrigger className="cursor-pointer text-blue-700 dark:text-blue-400 hover:underline">
                                    {response.adminName}
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80 p-4 shadow-lg rounded-xl dark:bg-gray-900">
                                    <div className="flex items-center space-x-4">
                                      {response?.AdminImg && (
                                        <div className="flex-shrink-0">
                                          <img
                                            className="w-12 h-12 rounded-full object-cover"
                                            src={`data:image/jpeg;base64,${response?.AdminImg}`}
                                            alt="admin-image"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <strong className="block text-md font-semibold text-gray-900 dark:text-gray-100">
                                          {response?.adminName} <strong>ID: ({response?.adminId})</strong>
                                        </strong>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{response?.adminDesg}</p>
                                        <small className="text-xs text-gray-500 dark:text-gray-400">
                                          Dept: {response?.adminDept} | Sec: {response?.adminSec}
                                        </small>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                              {formFields.map((field) => (
                                <TableCell
                                  key={field.id}
                                  className="max-w-[200px] text-center truncate border-r border-gray-300 dark:border-gray-700"
                                >
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}