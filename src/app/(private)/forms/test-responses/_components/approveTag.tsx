"use client";

import React, { ReactNode, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { surveyApi } from "@/apis/survey";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

function ApprovalTagPerson({ children }: { children: ReactNode }) {
    const formParams = useSearchParams();
    const formId = formParams.get("id");
    const queryClient = useQueryClient();

    const { mutate: useTagUser, data, isPending, isError } = useMutation({
        mutationFn: surveyApi.tagApproval,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taggedPeople', formId] });
        },
        onError: () => {
            toast.error("Invalid tag data. Please try again.");
        },
    });

    const { mutate: useRemoveTag } = useMutation({
        mutationFn: surveyApi.removeTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taggedPeople', formId] });
        },
        onError: () => {
            toast.error("Invalid tag data. Please try again.");
        },
    });

    useEffect(() => {
        if (formId) {
            useTagUser({ form_id: Number(formId) });
        }
    }, [formId]);

    // Group data by question
    const groupedData = data?.reduce((acc: any, item: any) => {
        if (!acc[item.question]) {
            acc[item.question] = [];
        }
        acc[item.question].push(item);
        return acc;
    }, {}) || {};

    const handleRemoveTag = async (id: number) => {
        useRemoveTag({id: id});
    }

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent className="max-h-[600px] min-w-[900px] overflow-y-auto">
                {isPending ? (
                    <p className="text-center text-blue-500">Loading...</p>
                ) : isError ? (
                    <p className="text-center text-red-500">Failed to load data.</p>
                ) : Object.keys(groupedData).length > 0 ? (
                    <div className="space-y-8">
                        {Object.keys(groupedData).map((question, index) => (
                            <div key={index} className="border-b pb-4">
                                {/* Question Title */}
                                <h2 className="text-lg font-semibold mb-2 border-b pb-1">{question}</h2>

                                {/* Table for each question */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center">Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedData[question].map((user: any, idx: number) => (
                                            <TableRow key={idx}>
                                                {/* Image */}
                                                <TableCell className="text-center">
                                                    {user.image ? (
                                                        <Image
                                                            src={`data:image/jpeg;base64,${user.image}`}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                            ?
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* User Info */}
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.dept}</TableCell>
                                                <TableCell>{user.deg}</TableCell>
                                                <TableCell>
                                                    <Button onClick={()=> handleRemoveTag(user.id)} variant="destructive" size="sm" className="rounded-full"><Delete /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No data found.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ApprovalTagPerson;
