"use client"

import { useEffect, useState } from "react"
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
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { surveyApi } from "@/apis/survey"
import { Loader2 } from "lucide-react"
import useStore from "@/store"
import { toast } from "sonner"

interface ISurveyHeader {
    title: string;
    description: string;
    user_id: number;
    id: number;
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

// Helper functions to parse JSON strings from backend
const parseFieldOptions = (optionsString: string | null): string[] => {
    if (!optionsString || optionsString === "[" || optionsString === "[]" || optionsString.trim() === "") return [];
    try {
        const parsed = JSON.parse(optionsString);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Failed to parse options:", optionsString);
        return [];
    }
};

const parseFileTypes = (typesString: string | null): string[] => {
    return parseFieldOptions(typesString);
};

export default function FormPreview() {
    const [searchParams, setSearchParams] = useState<string>("");
    const [selectEmp, setSelectEmp] = useState<number | null>(null);
    const [surveyHeader, setSurveyHeader] = useState<ISurveyHeader | null>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});

    const employeeData = useStore((state) => state.loginUser);


    const formParams = useSearchParams();
    const formId = formParams.get('id');

    const route = useRouter();

    const { data: formFieldsData, isLoading, isError } = useQuery({
        queryKey: ["formFields", formId],
        queryFn: () => surveyApi.getFormFields({ id: Number(formId) }),
        enabled: !!formId,
    });

    const { data: searchEmpData, isLoading: empLoading } = useQuery({
        queryKey: ["searchEmp", searchParams],
        queryFn: () => surveyApi.searchEmployee({ Search: searchParams }),
        enabled: searchParams.length > 0
    });

    const surveyHeaderMutation = useMutation({
        mutationFn: surveyApi.surveyHeaderInfo
    })

    useEffect(() => {
        if (formId) {
            // @ts-ignore
            surveyHeaderMutation.mutate({ id: formId }, {
                onSuccess: (data) => {
                    setSurveyHeader(data?.[0]);
                },
                onError: (error) => {
                    console.error("Error fetching form data:", error)
                }
            });
        }
    }, [formId])


    const handleInputChange = (fieldId: number, fieldType: string, value: any) => {
        // Create a unique key using both field ID and field type
        const responseKey = `${fieldType}_${fieldId}`;
        setResponses((prev) => ({
            ...prev,
            [responseKey]: value,
        }))
    }


    const { mutate } = useMutation({
        mutationFn: surveyApi.sendResponse,
        onSuccess: (data)=>{
            if(data){
                toast.success("Response send done.");
                route.push("/dashboard");
            }
        },
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });


    const handleSubmit = async () => {
        const formattedResponses = Object.entries(responses).reduce((acc, [key, value]) => {
            const [fieldType, fieldId] = key.split('_');

            // For checkbox fields, stringify the array value
            if (fieldType === "checkbox") {
                acc[fieldType] = JSON.stringify(value);
            } else if (fieldType === "file") {
                acc[fieldType] = JSON.stringify(value);
            }
            else {
                acc[fieldType] = value;
            }

            return acc;
        }, {} as Record<string, any>);

        const userRes = {
            formId: surveyHeader?.id,
            userId: selectEmp,
            adminId: Number(employeeData?.empID) || selectEmp,
            ...formattedResponses
        };

        mutate(userRes);

        console.log("User res: ", userRes);
    }

    const renderField = (field: FormField) => {
        const fieldId = `field-${field.id}`
        const fieldOptions = parseFieldOptions(field.options);
        const fileAllowedTypes = parseFileTypes(field.file_allowed_types);
        // Create unique key for this field
        const responseKey = `${field.field_type}_${field.id}`;
        const fieldResponse = responses[responseKey] || "";

        switch (field.field_type) {
            case "text":
            case "email":
            case "number":
                return (
                    <Input
                        id={fieldId}
                        type={field?.field_type === "email" ? "email" : field.field_type === "number" ? "number" : "text"}
                        placeholder={field?.placeholder || ""}
                        value={fieldResponse}
                        onChange={(e) => handleInputChange(field.id, field.field_type, e.target.value)}
                    />
                )

            case "textarea":
                return (
                    <Textarea
                        id={fieldId}
                        placeholder={field?.placeholder || ""}
                        value={fieldResponse}
                        onChange={(e) => handleInputChange(field.id, field.field_type, e.target.value)}
                        rows={4}
                    />
                )

            case "date":
                return (
                    <Input
                        id={fieldId}
                        type="date"
                        value={fieldResponse}
                        onChange={(e) => handleInputChange(field.id, field.field_type, e.target.value)}
                    />
                )

            case "select":
                return (
                    <Select value={fieldResponse} onValueChange={(value) => handleInputChange(field.id, field.field_type, value)}>
                        <SelectTrigger>
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
                )

            case "radio":
                return (
                    <RadioGroup value={fieldResponse} onValueChange={(value) => handleInputChange(field.id, field.field_type, value)}>
                        {fieldOptions.map((option, i) => (
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
                        {fieldOptions.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${fieldId}-${i}`}
                                    checked={Array.isArray(fieldResponse) && fieldResponse.includes(option)}
                                    onCheckedChange={(checked) => {
                                        const currentValues = Array.isArray(fieldResponse) ? fieldResponse : [];
                                        if (checked) {
                                            handleInputChange(field.id, field.field_type, [...currentValues, option])
                                        } else {
                                            handleInputChange(
                                                field.id,
                                                field.field_type,
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
                            accept={fileAllowedTypes.join(",")}
                            onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                console.log("File upload:", {
                                    fieldId: field.id,
                                    fileCount: files.length,
                                    maxAllowed: field.file_max_count,
                                    maxSize: field.file_max_size,
                                })
                                handleInputChange(field.id, field.field_type, files)
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Max file size: {field.file_max_size || 10}MB</p>
                            <p>Max files: {field.file_max_count || 1}</p>
                            {fileAllowedTypes.length > 0 && <p>Allowed types: {fileAllowedTypes.join(", ")}</p>}
                        </div>
                    </div>
                )

            case "rating":
                const maxRating = field.rating_max || 5
                const currentRating = fieldResponse || 0
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: maxRating }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleInputChange(field.id, field.field_type, i + 1)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <StarIcon
                                        className={`w-6 h-6 ${i < currentRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
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
                                onClick={() => handleInputChange(field.id, field.field_type, 0)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear rating
                            </Button>
                        )}
                    </div>
                )

            default:
                return <div>Unsupported field type: {field.field_type}</div>
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2">Loading form...</span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">Error loading form data</div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{surveyHeader?.title || "Untitled Form"}</CardTitle>
                        {surveyHeader?.description && <p className="text-gray-600 mt-2">{surveyHeader?.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-sm font-medium">
                                Find Employee <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                onChange={(e) => setSearchParams(e.target.value)}
                                id="text"
                                type="text"
                                placeholder="A28969"
                                value={searchParams}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            {/* Loading State */}
                            {empLoading && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                                    <span className="ml-2 text-blue-500 font-medium">Searching...</span>
                                </div>
                            )}

                            {/* Results */}
                            {searchEmpData && <small>Total: {searchEmpData?.length || 0}</small>}
                            {searchEmpData && searchEmpData.length > 0 && (
                                <div className="mt-3 border rounded-lg bg-white shadow-md max-h-72 overflow-y-auto divide-y">
                                    {searchEmpData.map(
                                        (emp: {
                                            fulL_NAME: string;
                                            desgName: string;
                                            deptname: string;
                                            secname: string;
                                            empno: number;
                                            image: string;
                                        }) => (
                                            <Card
                                                key={emp.empno}
                                                onClick={() => setSelectEmp(emp.empno)}
                                                className={`mb-2 flex items-center gap-4 p-3 cursor-pointer transition hover:bg-blue-50 ${selectEmp === emp.empno ? "bg-blue-100 border border-blue-400" : ""
                                                    }`}
                                            >
                                                <img
                                                    src={emp.image && emp.image.trim() !== "" ? `data:image/jpeg;base64,${emp.image}` : "/assets/logo.png"}
                                                    alt={emp.fulL_NAME}
                                                    className="w-14 h-14 rounded-full border object-cover"
                                                />

                                                {/* Employee Info */}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800 text-sm">
                                                        {emp.fulL_NAME}{" "}
                                                        <span className="text-gray-500 text-xs">({emp.empno})</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{emp.desgName}</p>
                                                    <p className="text-xs text-gray-500">{emp.deptname} • {emp.secname}</p>
                                                </div>
                                            </Card>
                                        )
                                    )}
                                </div>
                            )}

                            {/* No Results */}
                            {!empLoading && searchParams.length > 0 && searchEmpData?.length === 0 && (
                                <p className="mt-3 text-center text-gray-500 text-sm">
                                    No employees found matching "{searchParams}"
                                </p>
                            )}
                        </div>

                        {formFieldsData?.map((field: FormField) => (
                            <motion.div key={field.id} className="mt-4">
                                <Label htmlFor={`field-${field.id}`} className="text-sm font-medium">
                                    {field.label}
                                    {field.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <div className="mt-1">{renderField(field)}</div>
                            </motion.div>
                        ))}

                        {(!formFieldsData || formFieldsData.length === 0) && (
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