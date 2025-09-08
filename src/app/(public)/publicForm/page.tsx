"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckCircledIcon, StarIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import useStore from "@/store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { surveyApi } from "@/apis/survey";
import { AxiosResponse } from "axios";
import axiosInstance from "@/lib/axiosInstance";

// ======================================================================
// Type Definitions
// ======================================================================

interface ISurveyHeader {
    title: string;
    description: string;
    user_id: number;
    id: number;
    state: number;
}

interface FormField {
    id: number;
    form_id: number;
    state: any;
    field_type: string;
    label: string;
    placeholder: string | null;
    is_required: number;
    options: string | null;
    field_order: number;
    rating_max: number | null;
    file_allowed_types: string | null;
    file_max_count: number | null;
    file_max_size: number | null;
}

interface IEmployee {
    fulL_NAME: string;
    desgName: string;
    deptname: string;
    secname: string;
    empno: number;
    image: string;
    responsed: number;
}

// ======================================================================
// Helper Functions
// ======================================================================

const parseFieldOptions = (optionsString: string | null): string[] => {
    if (!optionsString) return [];
    try {
        const parsed = JSON.parse(optionsString);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
    } catch (error) {
        console.warn("Failed to parse options:", optionsString);
        return [];
    }
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ======================================================================
// Field Renderer Component
// ======================================================================

interface FormFieldProps {
    field: FormField;
    responses: Record<string, any>;
    onInputChange: (fieldId: number, fieldType: string, value: any) => void;
    error?: string;
}

const FormFieldComponent = ({ field, responses, onInputChange, error }: FormFieldProps) => {
    const fieldId = `field-${field.id}`;
    const fieldOptions = parseFieldOptions(field.options);
    const fieldResponse = responses[field.id];
    const normalizedType = field.field_type.toLowerCase();

    const renderInput = () => {
        switch (normalizedType) {
            case "text":
            case "email":
            case "number":
                return (
                    <Input
                        id={fieldId}
                        type={normalizedType}
                        placeholder={field.placeholder || ""}
                        value={fieldResponse || ""}
                        onChange={(e) => onInputChange(field.id, normalizedType, e.target.value)}
                        required={field.is_required === 1}
                    />
                );
            case "textarea":
                return (
                    <Textarea
                        id={fieldId}
                        placeholder={field.placeholder || ""}
                        value={fieldResponse || ""}
                        onChange={(e) => onInputChange(field.id, normalizedType, e.target.value)}
                        rows={4}
                        required={field.is_required === 1}
                    />
                );
            case "date":
                return (
                    <Input
                        id={fieldId}
                        type="date"
                        value={fieldResponse || ""}
                        onChange={(e) => onInputChange(field.id, normalizedType, e.target.value)}
                        required={field.is_required === 1}
                    />
                );
            case "select":
                return (
                    <Select
                        value={fieldResponse || ""}
                        onValueChange={(value) => onInputChange(field.id, normalizedType, value)}
                        required={field.is_required === 1}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {fieldOptions.map((option, i) => (
                                <SelectItem key={i} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case "radio":
                return (
                    <RadioGroup
                        value={fieldResponse || ""}
                        onValueChange={(value) => onInputChange(field.id, normalizedType, value)}
                        required={field.is_required === 1}
                    >
                        {fieldOptions.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${fieldId}-${i}`} />
                                <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            case "checkbox":
                return (
                    <div className="space-y-2">
                        {fieldOptions.map((option, i) => {
                            const currentValues = Array.isArray(fieldResponse) ? fieldResponse : [];
                            return (
                                <div key={i} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${fieldId}-${i}`}
                                        checked={currentValues.includes(option)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                onInputChange(field.id, normalizedType, [...currentValues, option]);
                                            } else {
                                                onInputChange(field.id, normalizedType, currentValues.filter((v: string) => v !== option));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
                                </div>
                            );
                        })}
                    </div>
                );
            case "rating":
                const maxRating = field.rating_max || 5;
                const currentRating = Number(fieldResponse) || 0;
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: maxRating }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => onInputChange(field.id, normalizedType, i + 1)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <StarIcon
                                        className={`h-6 w-6 ${i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
                                    />
                                </button>
                            ))}
                        </div>
                        {currentRating > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onInputChange(field.id, normalizedType, 0)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear rating
                            </Button>
                        )}
                    </div>
                );
            default:
                return <div className="text-sm text-red-500">Unsupported field type: {field.field_type}</div>;
        }
    };

    return (
        <div className="space-y-1">
            {renderInput()}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

// ======================================================================
// Main Form Preview Component
// ======================================================================

export default function FormPreview() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedEmp, setSelectedEmp] = useState<number | null>(null);
    const [responses, setResponses] = useState<Record<number, any>>({});
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

    const router = useRouter();
    const searchParams = useSearchParams();
    const formId = searchParams.get("id"); //1037
    const empId = searchParams.get("empId"); //25620






    const {
        data: formData,
        isLoading: isFormLoading,
        isError: isFormError,
    } = useQuery<{ formFields: FormField[]; surveyHeader: ISurveyHeader }>({
        queryKey: ["formPreviewData", formId],
        queryFn: async () => {
            if (!formId) throw new Error("Form ID is missing");
            const formFields = await surveyApi.getFormFields({ id: Number(formId) });
            // @ts-ignore
            const surveyHeader = (await surveyApi.surveyHeaderInfo({ id: formId as string }))[0];
            return { formFields, surveyHeader };
        },
        enabled: !!formId,
    });

    // const debouncedSearch = useMemo(() => {
    //     let timeout: NodeJS.Timeout;
    //     return (value: string = empId+'') => {
    //         clearTimeout(timeout);
    //         timeout = setTimeout(() => {
    //             setSearchQuery(value);
    //         }, 300);
    //     };
    // }, []);

    useEffect(() => {
        setSearchQuery(empId + '');
        setSelectedEmp(Number(empId));
    }, [empId])

    const { data: searchEmpData, isLoading: isEmpLoading } = useQuery<IEmployee[]>({
        queryKey: ["searchEmp", searchQuery, formId],
        queryFn: () =>
            surveyApi.searchEmployee({
                Search: searchQuery,
                formId: Number(formId),
            }),
        enabled: searchQuery.length > 0 && !!formId,
    });

    const { mutate: sendResponseMutate, isPending: isSubmitting, data: submitFormRes } = useMutation({
        mutationFn: surveyApi.userResponses,
        onSuccess: (data) => {
            // 'data' here is the response from the backend
            if (data && Array.isArray(data) && data.length > 0) {
                // Access the message from the first object in the response array
                if (data[0].message == "Already responded") {
                    toast.error("This user has already submitted the response.");
                } else {
                    toast.success("Response sent successfully! 🎉");
                    router.push("/dashboard")
                }
            } else {
                // Fallback for an unexpected response format
                toast.success("Response sent successfully! 🎉");
                router.push("/dashboard");
            }
        },
        onError: (error) => {
            toast.error("Failed to submit response. Please try again.");
        },
    });




    const handleInputChange = useCallback((fieldId: number, fieldType: string, value: any) => {
        setResponses((prev) => ({ ...prev, [fieldId]: value }));
        setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    }, []);

    const validateForm = (): boolean => {
        const errors: Record<number, string> = {};
        if (!selectedEmp) {
            toast.warning("Please select an employee before submitting.");
            return false;
        }
        if (!formData?.formFields) {
            toast.error("Form data is missing.");
            return false;
        }

        formData.formFields.forEach((field) => {
            const value = responses[field.id];

            if (field.is_required === 1) {
                const isEmpty = (val: any) => {
                    if (val === null || val === undefined) return true;
                    if (typeof val === "string") return val.trim() === "";
                    if (Array.isArray(val)) return val.length === 0;
                    if (typeof val === "number") return isNaN(val) || val === 0;
                    return false;
                };

                if (isEmpty(value)) {
                    errors[field.id] = `${field.label} is required.`;
                }
            }

            if (field.field_type.toLowerCase() === "email" && value && !validateEmail(value)) {
                errors[field.id] = "Please enter a valid email address.";
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const formattedResponses = formData?.formFields.map((field) => {
            const value = responses[field.id];
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                return null; // Skip fields with no value
            }

            let answerValue = value;
            // For checkbox, store the answer as a stringified array
            if (field.field_type.toLowerCase() === "checkbox") {
                answerValue = JSON.stringify(value);
            }

            return {
                formId: formData.surveyHeader.id,
                adminId: empId,
                questionID: field.id,
                questionType: field.field_type.toLowerCase(),
                answer: answerValue
            };
        }).filter(response => response !== null);

        if (formattedResponses && formattedResponses.length > 0) {
            const newFormattedResponses = formattedResponses.map((response) => ({
                answer: typeof response.answer === "string" ? response.answer : JSON.stringify(response.answer),
                formId: response.formId,
                questionId: response.questionID,
                questionTypeTitle: response.questionType,
                empId: selectedEmp || 1,
                adminId: Number(empId) || selectedEmp || 1
            }));

            sendResponseMutate(newFormattedResponses);

            console.log(newFormattedResponses);
        } else {
            toast.error("No responses to submit.");
        }
    };



    if (isFormLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading form...</span>
            </div>
        );
    }

    if (isFormError || !formData?.surveyHeader) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Card className="w-full max-w-lg p-6 text-center shadow-lg dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-2xl text-red-600">Form Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                            The requested form could not be loaded. Please check the URL and try again.
                        </p>
                        <Button onClick={() => router.push("/dashboard")} className="mt-6">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { formFields, surveyHeader } = formData;

    return (
        <div className="min-h-screen bg-gray-100 p-4 transition-colors duration-300 dark:bg-gray-900 md:p-8">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
            >
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{surveyHeader.title || "Untitled Form"}</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">{surveyHeader.description || "No description provided."}</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto w-full max-w-3xl"
            >
                <Card className="rounded-xl shadow-lg dark:bg-gray-800">
                    <CardContent className="space-y-8 p-6 md:p-8">
                        <div>
                            <Label htmlFor="search-employee" className="text-sm font-medium">IF Will It You, Please Select <span className="text-red-500 dark:text-red-400">*</span></Label>
                            
                            {searchEmpData && searchEmpData.length > 0 && (
                                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-white p-2 shadow-inner dark:bg-gray-900">
                                    {searchEmpData.map((emp) => (
                                        <div
                                            key={emp.empno}
                                            onClick={() => emp.responsed < 1 && setSelectedEmp(emp.empno)}
                                            className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900
                                                ${emp.responsed >= 1 ? "cursor-not-allowed opacity-50" : ""}
                                                ${selectedEmp === emp.empno ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900" : ""}`}
                                        >
                                            <div className="relative h-14 w-14 flex-shrink-0">
                                                <img
                                                    src={emp.image && emp.image.trim() !== "" ? `data:image/jpeg;base64,${emp.image}` : `https://placehold.co/56x56/E5E7EB/4B5563?text=User`}
                                                    alt={emp.fulL_NAME}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                                {selectedEmp === emp.empno && <CheckCircledIcon className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-white text-blue-500 ring-2 ring-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {emp.fulL_NAME} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({emp.empno})</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{emp.desgName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{emp.deptname} • {emp.secname}</p>
                                            </div>
                                            {emp.responsed >= 1 && (
                                                <div className="flex items-center text-sm font-medium text-green-600">
                                                    <CheckCircledIcon className="mr-1 h-4 w-4" />
                                                    Done
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchQuery.length > 0 && searchEmpData?.length === 0 && (
                                <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">No employees found matching "{searchQuery}".</p>
                            )}
                        </div>

                        {formFields.length > 0 ? (
                            <div className="space-y-6">
                                {formFields.toReversed().map((field) => (
                                    <motion.div
                                        key={field.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: field.field_order * 0.1 }}
                                    >
                                        <Label htmlFor={`field-${field.id}`} className="text-sm font-medium">
                                            {field.label}
                                            {field.is_required === 1 && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
                                        </Label>
                                        <div className="mt-2">
                                            <FormFieldComponent
                                                field={field}
                                                responses={responses}
                                                onInputChange={handleInputChange}
                                                error={validationErrors[field.id]}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                <p>No fields have been added to this form yet.</p>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Form"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}