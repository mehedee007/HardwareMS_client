"use client"

import React, { ReactNode, useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { surveyApi } from '@/apis/survey'
import { Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useStore from '@/store'

interface IEmployee {
    fulL_NAME: string;
    desgName: string;
    deptname: string;
    secname: string;
    empno: number;
    image: string;
    responsed: number;
}

function TagWithResponsiblePerson({ children, formId }: { children: ReactNode; formId: number | string }) {
    const [searchParams, setSearchParams] = useState<string>("");
    const [selectedEmps, setSelectedEmps] = useState<IEmployee[]>([]);

    const tagResponse = useStore((state) => state.tagResponse);

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

    const toggleEmployeeSelection = (employee: IEmployee) => {
        setSelectedEmps(prevSelectedEmps => {
            const isAlreadySelected = prevSelectedEmps.some(emp => emp.empno === employee.empno);
            if (isAlreadySelected) {
                return prevSelectedEmps.filter(emp => emp.empno !== employee.empno);
            } else {
                return [...prevSelectedEmps, employee];
            }
        });
    };

    const isEmployeeSelected = (empno: number) => {
        return selectedEmps.some(emp => emp.empno === empno);
    };

    const removeSelectedEmp = (empno: number) => {
        setSelectedEmps(prevSelectedEmps => prevSelectedEmps.filter(emp => emp.empno !== empno));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className='min-w-[250px] md:min-w-[550px] lg:min-w-[850px]'>
                <DialogHeader>
                    <DialogTitle>Tag Responsible Persons </DialogTitle>
                    <DialogDescription>
                        Search for and select one or more employees to be responsible for this task.
                    </DialogDescription>
                </DialogHeader>

                <div>
                    {
                        tagResponse && tagResponse?.map((tag) => <p>{tag.question}</p>)
                    }
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
                                        <small>{emp.deptname}</small>
                                    </div>
                                    <button
                                        onClick={() => removeSelectedEmp(emp.empno)}
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
                    {searchEmpData && searchEmpData?.length > 0 && (
                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-white p-2 shadow-inner dark:bg-gray-900">
                            {searchEmpData.map((emp) => (
                                <div
                                    key={emp.empno}
                                    onClick={() => toggleEmployeeSelection(emp)}
                                    className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900 ${isEmployeeSelected(emp.empno)
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
    )
}

export default TagWithResponsiblePerson