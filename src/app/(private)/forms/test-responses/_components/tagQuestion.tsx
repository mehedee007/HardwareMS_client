"use client";

import { ReactNode, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useStore from '@/store';
import { surveyApi } from '@/apis/survey';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Loader2, Share, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ItagUser } from '@/lib/userTypes';
import { toast } from 'sonner';

interface ITagQuestion {
    form_id: number;
    question_id: number;
    question: string;
    field_type: number | string;
    number_of_responses: number;
    adminId: number;
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

function TagQuestion({ children, question }: { children: ReactNode; question: ITagQuestion }) {
    const [searchParams, setSearchParams] = useState<string>("");
    const [selectedEmps, setSelectedEmps] = useState<IEmployee[]>([]);
    const loginUser = useStore((state) => state.loginUser);
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const {
        mutate: tagQuestionMutation,
        isPending: isTagging,
    } = useMutation({
        mutationFn: surveyApi.tagForm,
        onSuccess: () => {
            toast.success("Persons tagged successfully.");
            setIsOpen(false);
            queryClient.invalidateQueries({ queryKey: ['alreadyTaggedPeople', question.form_id, question.question_id] });
            setSelectedEmps([]);
        },
        onError: () => {
            toast.error("Invalid tag.");
        },
    });

    const debouncedSearch = useMemo(() => {
        let timeout: NodeJS.Timeout;
        return (value: string) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setSearchParams(value);
            }, 300);
        };
    }, []);

    const { data: searchEmpData, isLoading: isEmpLoading } = useQuery<IEmployee[]>({
        queryKey: ["searchEmp", searchParams],
        queryFn: () => surveyApi.searchEmployee({ Search: searchParams }),
        enabled: searchParams.length > 0
    });

    const {
        data: alreadyTaggedData,
        isLoading: isAlreadyTaggedLoading,
        isFetched: isAlreadyTaggedFetched,
    } = useQuery<IEmployee[]>({
        queryKey: ['alreadyTaggedPeople', question.form_id, question.question_id],
        queryFn: () => surveyApi.alreadyTag({
            form_id: question.form_id,
            question_id: question.question_id,
        }),
        enabled: isOpen,
        // @ts-ignore
        onSuccess: (data) => {
            setSelectedEmps(data || []);
        }
    });

    const toggleEmployeeSelection = (employee: IEmployee) => {
        setSelectedEmps(prevSelectedEmps => {
            const isAlreadySelected = prevSelectedEmps.some(emp => emp.empno === employee.empno);
            return isAlreadySelected
                ? prevSelectedEmps.filter(emp => emp.empno !== employee.empno)
                : [...prevSelectedEmps, employee];
        });
    };

    const isEmployeeSelected = (empno: number) => {
        return selectedEmps.some(emp => emp.empno === empno);
    };

    const handleTag = () => {
        const obj: ItagUser = {
            form_id: question.form_id,
            question_id: question.question_id,
            question: question.question,
            field_type: question.field_type,
            number_of_responses: question.number_of_responses,
            adminId: loginUser?.empID || 1,
            tagsWith: selectedEmps?.map((emp) => Number(emp?.empno)) || [],
            type: 2
        };
        tagQuestionMutation(obj);
    };

    const handleRemoveTag = (empno: number) => {
        const obj: ItagUser = {
            form_id: question.form_id,
            question_id: question.question_id,
            question: question.question,
            field_type: question.field_type,
            number_of_responses: question.number_of_responses,
            adminId: loginUser?.empID || 1,
            tagsWith: [empno],
            type: 3
        };
        tagQuestionMutation(obj);
    };

    const handleOpenDialog = () => {
        setIsOpen(true);
        // Reset state when the dialog is opened
        setSelectedEmps([]);
        setSearchParams("");
    };

    return (
        <>
            <div onClick={handleOpenDialog}>{children}</div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='min-w-[250px] md:min-w-[550px] lg:min-w-[790px]'>
                    <DialogHeader>
                        <DialogTitle>Tag Responsible Persons</DialogTitle>
                        <DialogDescription>
                            Search for and select one or more employees to be responsible for this task.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Already Tagged People Section */}
                    {isAlreadyTaggedLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            <p className="ml-2 text-sm text-gray-500">Loading already tagged persons...</p>
                        </div>
                    ) : (
                        // @ts-ignore
                        alreadyTaggedData && alreadyTaggedData.length > 0 && (
                            <div className="border-b pb-4 mb-4">
                                <p className="text-sm font-semibold mb-2">Already Tagged Persons:</p>
                                <div className="flex flex-wrap gap-2">
                                    {/* @ts-ignore */}
                                    {alreadyTaggedData && alreadyTaggedData.map(emp => (
                                        <div
                                            key={emp.empno}
                                            className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                                        >
                                            <img
                                                src={emp.image && emp.image.trim() !== "" ? `data:image/jpeg;base64,${emp.image}` : `https://placehold.co/24x24/D1FAE5/065F46?text=User`}
                                                alt={emp.fulL_NAME}
                                                width={24}
                                                height={24}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span>{emp.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}

                    <div className='flex items-center justify-between'>
                        <div>
                            <p>
                                <strong>Question: </strong> <span className="text-sm text-gray-600 dark:text-gray-400">{question.question}</span>
                            </p>
                            <p>
                                <strong>Number Of Response: </strong> <span className="text-sm text-gray-600 dark:text-gray-400">{question.number_of_responses}</span>
                            </p>
                        </div>
                        <Button onClick={handleTag} disabled={isTagging}>
                            {isTagging ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Share className="h-4 w-4 mr-2" />
                            )}
                            Tag
                        </Button>
                    </div>

                    {/* Selected Employees Section */}
                    {selectedEmps.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                            <Label className="w-full text-sm font-medium text-gray-700 dark:text-gray-300">
                                Selected Persons ({selectedEmps.length})
                            </Label>
                            <div className="flex flex-wrap gap-2 mt-1 max-h-28 space-y-2 overflow-y-auto">
                                {selectedEmps.map(emp => (
                                    <div
                                        key={emp.empno}
                                        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                                    >
                                        <div className='flex flex-col items-start'>
                                            <span className="font-medium text-sm">{emp.fulL_NAME}</span>
                                            <small className="text-xs text-blue-700 dark:text-blue-200">{emp.deptname}</small>
                                        </div>
                                        <button
                                            onClick={() => toggleEmployeeSelection(emp)}
                                            className="p-1 transition-colors rounded-full hover:bg-blue-200 dark:hover:bg-blue-700"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Employee Search Section */}
                    <div>
                        <Label htmlFor="search-employee" className="text-sm font-medium">
                            Find Responsible Person{" "}
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
                        {searchEmpData && searchParams.length > 0 && searchEmpData?.length > 0 && (
                            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-white p-2 shadow-inner dark:bg-gray-900">
                                {searchEmpData.map((emp) => (
                                    <div
                                        key={emp.empno}
                                        onClick={() => toggleEmployeeSelection(emp)}
                                        className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900 ${isEmployeeSelected(emp.empno) ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900" : ""}`}
                                    >
                                        <div className="relative h-14 w-14 flex-shrink-0">
                                            <img
                                                src={emp.image && emp.image.trim() !== "" ? `data:image/jpeg;base64,${emp.image}` : `https://placehold.co/56x56/E5E7EB/4B5563?text=User`}
                                                alt={emp.fulL_NAME}
                                                width={56}
                                                height={56}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                            {isEmployeeSelected(emp.empno) && (
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
                </DialogContent>
            </Dialog>
        </>
    );
}

export default TagQuestion;