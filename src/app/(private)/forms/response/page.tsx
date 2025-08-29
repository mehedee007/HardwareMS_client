"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeftIcon,
    CheckCircledIcon,
    StarIcon,
} from "@radix-ui/react-icons";
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
import { surveyApi } from "@/apis/survey";
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
} from "@/components/ui/alert-dialog"

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
    if (!optionsString || optionsString.trim() === "[]" || optionsString.trim() === "[") return [];
    try {
        const parsed = JSON.parse(optionsString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Failed to parse options:", optionsString);
        return [];
    }
};

// ======================================================================
// Field Renderer Component
// ======================================================================

interface FormFieldProps {
    field: FormField;
    responses: Record<string, any>;
    onInputChange: (fieldId: number, fieldType: string, value: any) => void;
}

const FormField = ({ field, responses, onInputChange }: FormFieldProps) => {
    const fieldId = `field-${field.id}`;
    const fieldOptions = parseFieldOptions(field.options);
    const responseKey = `${field.field_type}_${field.id}`;
    const fieldResponse = responses[responseKey];

    switch (field.field_type) {
        case "text":
        case "email":
        case "number":
            return (
                <Input
                    id={fieldId}
                    type={field.field_type}
                    placeholder={field.placeholder || ""}
                    value={fieldResponse || ""}
                    onChange={(e) => onInputChange(field.id, field.field_type, e.target.value)}
                    required={field.is_required === 1}
                />
            );
        case "textarea":
            return (
                <Textarea
                    id={fieldId}
                    placeholder={field.placeholder || ""}
                    value={fieldResponse || ""}
                    onChange={(e) => onInputChange(field.id, field.field_type, e.target.value)}
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
                    onChange={(e) => onInputChange(field.id, field.field_type, e.target.value)}
                    required={field.is_required === 1}
                />
            );
        case "select":
            return (
                <Select
                    value={fieldResponse || ""}
                    onValueChange={(value) => onInputChange(field.id, field.field_type, value)}
                    required={field.is_required === 1}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        {fieldOptions.map((option, i) => (
                            <SelectItem key={i} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case "radio":
            return (
                <RadioGroup
                    value={fieldResponse || ""}
                    onValueChange={(value) => onInputChange(field.id, field.field_type, value)}
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
                    {fieldOptions.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox
                                id={`${fieldId}-${i}`}
                                checked={Array.isArray(fieldResponse) && fieldResponse.includes(option)}
                                onCheckedChange={(checked) => {
                                    const currentValues = Array.isArray(fieldResponse) ? fieldResponse : [];
                                    if (checked) {
                                        onInputChange(field.id, field.field_type, [...currentValues, option]);
                                    } else {
                                        onInputChange(
                                            field.id,
                                            field.field_type,
                                            currentValues.filter((v: string) => v !== option)
                                        );
                                    }
                                }}
                            />
                            <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
                        </div>
                    ))}
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
                                onClick={() => onInputChange(field.id, field.field_type, i + 1)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <StarIcon
                                    className={`h-6 w-6 ${i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    {currentRating > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onInputChange(field.id, field.field_type, 0)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Clear rating
                        </Button>
                    )}
                </div>
            );
        default:
            return (
                <div className="text-sm text-red-500">
                    Unsupported field type: {field.field_type}
                </div>
            );
    }
};

// ======================================================================
// Main Form Preview Component
// ======================================================================

export default function FormPreview() {
    const [searchParams, setSearchParams] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [selectedEmp, setSelectedEmp] = useState<number | null>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const router = useRouter();
    const search = useSearchParams();
    const formId = search.get("id");

    const employeeData = useStore((state) => state.loginUser);

    // Use a single query for form fields and header info
    const {
        data: formData,
        isLoading: isFormLoading,
        isError: isFormError,
    } = useQuery<{ formFields: FormField[]; surveyHeader: ISurveyHeader }>({
        queryKey: ["formPreviewData", formId],
        queryFn: async () => {
            const formFields = await surveyApi.getFormFields({ id: Number(formId) });
            //@ts-ignore
            const surveyHeader = (await surveyApi.surveyHeaderInfo({
                id: formId as string,
            }))[0];
            return { formFields, surveyHeader };
        },
        enabled: !!formId,
    });

    // Use debounce for search to prevent excessive API calls
    const debouncedSearch = useMemo(() => {
        let timeout: NodeJS.Timeout;
        return (value: string) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setSearchParams(value);
            }, 300); // 300ms debounce
        };
    }, []);

    const { data: searchEmpData, isLoading: isEmpLoading } = useQuery<IEmployee[]>({
        queryKey: ["searchEmp", searchParams],
        queryFn: () =>
            surveyApi.searchEmployee({
                Search: searchParams,
                formId: Number(formId),
            }),
        enabled: searchParams.length > 0 && !!formId,
    });

    const { mutate, isPending: isSubmitting } = useMutation({
        mutationFn: surveyApi.sendResponse,
        onSuccess: () => {
            toast.success("Response sent successfully!");
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Submission failed:", error);
            toast.error("Failed to submit response. Please try again.");
        },
    });

    const { mutate: muteApproval } = useMutation({
        mutationFn: surveyApi.formApprove,
        onSuccess: () => {
            toast.success("Approve Updated successfully!");
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Submission failed:", error);
            toast.error("Failed to submit response. Please try again.");
        },
    });

    const handleInputChange = (fieldId: number, fieldType: string, value: any) => {
        const responseKey = `${fieldType}_${fieldId}`;
        setResponses((prev) => ({
            ...prev,
            [responseKey]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!employeeData?.empID) {
            toast.warning("Admin not found!");
            return;
        }
        if (!selectedEmp) {
            toast.warning("Please select an employee before submitting.");
            return;
        }
        if (!formData?.formFields || formData.formFields.length === 0) {
            toast.warning("Form is empty.");
            return;
        }

        // Validation
        const requiredFields = formData.formFields.filter((field) => field.is_required === 1);
        const missingFields = requiredFields.filter((field) => {
            const responseKey = `${field.field_type}_${field.id}`;
            const value = responses[responseKey];
            if (typeof value === "string") return value.trim() === "";
            if (Array.isArray(value)) return value.length === 0;
            return !value;
        });

        if (missingFields.length > 0) {
            toast.error(`Please fill out all required fields.`);
            return;
        }

        // Format responses for API call
        const formattedResponses: Record<string, any> = {};
        Object.entries(responses).forEach(([key, value]) => {
            const [fieldType] = key.split('_');
            // Stringify array values for checkbox and file types as per original logic
            if (["checkbox", "file"].includes(fieldType)) {
                formattedResponses[fieldType] = JSON.stringify(value);
            } else if (fieldType === "select") {
                // Map 'select' to 'selects' as per original logic
                formattedResponses["selects"] = value;
            } else {
                formattedResponses[fieldType] = value;
            }
        });

        const userRes = {
            formId: formData.surveyHeader.id,
            userId: selectedEmp,
            adminId: employeeData.empID,
            ...formattedResponses,
        };

        mutate(userRes);
    };


    const handleApprove = async (state: number) => {
        const obj = {
            formId: Number(formData?.surveyHeader.id),
            state: state,
            remark: remarks,
            approvalId: Number(employeeData?.empID)
        }
        muteApproval(obj)
    }

    // State Management for UI
    if (isFormLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="ml-4 text-xl text-gray-700">Loading form...</span>
            </div>
        );
    }

    if (isFormError || !formData?.surveyHeader) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-full max-w-lg p-6 text-center shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-red-600">Form Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
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
            {/* Page Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {surveyHeader.title || "Untitled Form"}
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {surveyHeader.description || "No description provided."}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Main Form Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto w-full max-w-3xl"
            >
                <Card className="rounded-xl shadow-lg dark:bg-gray-800">
                    <CardContent className="space-y-8 p-6 md:p-8">
                        {/* Employee Search Section */}
                        <div>
                            <Label htmlFor="search-employee" className="text-sm font-medium">
                                Find Employee{" "}
                                <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    id="search-employee"
                                    type="text"
                                    placeholder="Search by ID or Name"
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    className="w-full"
                                />
                                {isEmpLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>
                            {searchEmpData && searchEmpData?.length > 0 && (
                                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-white p-2 shadow-inner dark:bg-gray-900">
                                    {searchEmpData.map((emp) => (
                                        <div
                                            key={emp.empno}
                                            onClick={() =>
                                                emp.responsed < 1 && setSelectedEmp(emp.empno)
                                            }
                                            className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900
                      ${emp.responsed >= 1
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                                }
                      ${selectedEmp === emp.empno
                                                    ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900"
                                                    : ""
                                                }`}
                                        >
                                            <div className="relative h-14 w-14 flex-shrink-0">
                                                <img
                                                    src={
                                                        emp.image && emp.image.trim() !== ""
                                                            ? `data:image/jpeg;base64,${emp.image}`
                                                            : `https://placehold.co/56x56/E5E7EB/4B5563?text=User`
                                                    }
                                                    alt={emp.fulL_NAME}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                                {selectedEmp === emp.empno && (
                                                    <CheckCircledIcon className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-white text-blue-500 ring-2 ring-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {emp.fulL_NAME}{" "}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        ({emp.empno})
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {emp.desgName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {emp.deptname} • {emp.secname}
                                                </p>
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
                            {searchParams.length > 0 && searchEmpData?.length === 0 && (
                                <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No employees found matching "{searchParams}".
                                </p>
                            )}
                        </div>

                        {/* Form Fields Section */}
                        {formFields.length > 0 && (
                            <div className="space-y-6">
                                {formFields.map((field) => (
                                    <motion.div
                                        key={field.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: field.field_order * 0.1 }}
                                    >
                                        <Label htmlFor={`field-${field.id}`} className="text-sm font-medium">
                                            {field.label}
                                            {field.is_required === 1 && (
                                                <span className="ml-1 text-red-500 dark:text-red-400">*</span>
                                            )}
                                        </Label>
                                        <div className="mt-2">
                                            <FormField
                                                field={field}
                                                responses={responses}
                                                onInputChange={handleInputChange}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        {formFields.length === 0 && (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                <p>No fields have been added to this form yet.</p>
                            </div>
                        )}



                        {
                            surveyHeader.state === 1 && (employeeData?.designationID == "462" || employeeData?.designationID == "1639" || employeeData?.designationID == "555") ? <div className="bg-secondary rounded-4xl p-10 flex flex-col items-center justify-center gap-5">
                                <strong>Please Review this form!</strong>
                                <div className="flex items-center justify-center gap-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger><Button>Approve</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleApprove(2)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger><Button variant="destructive">Cancel</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-red-500">
                                                    This action cannot be undone. This will permanently rejected.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleApprove(3)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>


                                </div>
                                <Label htmlFor="email">Remark</Label>
                                <Textarea onChange={(e) => setRemarks(e.target.value)} className="border-3" placeholder="Remark" />
                            </div> : surveyHeader.state === 3 ? <p className="text-red-500 font-bold">This form are rejected from approval!</p> : surveyHeader.state === 1 ? <p className="text-yellow-400 font-bold">This form need to approve form HR admin.</p> : surveyHeader.state === 0 ? <p className="text-red-500">This form has been deleted!</p> : <div className="pt-4">
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
                        }


                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
