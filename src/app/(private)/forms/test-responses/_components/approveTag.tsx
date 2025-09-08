"use client";

import React, { ReactNode, useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { surveyApi } from "@/apis/survey";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Delete, Drone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import useStore from "@/store";

// Custom hook to fetch tagged people data
const useTaggedPeople = (formId: string | null, isDialogOpen: boolean) => {
    return useQuery({
        queryKey: ['taggedPeople', formId],
        queryFn: () => surveyApi.tagApproval({ form_id: Number(formId) }),
        // The query will only run when the dialog is open and formId exists
        enabled: isDialogOpen && !!formId,
    });
};

function ApprovalTagPerson({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [remark, setRemark] = useState("");
    const formParams = useSearchParams();
    const formId = formParams.get("id");
    const queryClient = useQueryClient();

    const loginuser = useStore((state)=> state.loginUser);

    // Fetch data using useQuery, which is enabled based on the dialog's open state
    const { data, isPending, isError } = useTaggedPeople(formId, isOpen);

    const { mutate: useRemoveTag } = useMutation({
        mutationFn: surveyApi.removeTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taggedPeople', formId] });
            toast.success("Remove done!");
        },
        onError: () => {
            toast.error("Invalid tag data. Please try again.");
        },
    });

    const { mutate: useApproveTags } = useMutation({
        mutationFn: surveyApi.approveTags,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taggedPeople', formId] });
            toast.success("Tags approved successfully!"); // Corrected toast message
        },
        onError: () => {
            toast.error("Approval failed. Please try again."); // Corrected toast message
        },
    });

    const groupedData = data?.reduce((acc: any, item: any) => {
        if (!acc[item.question]) {
            acc[item.question] = [];
        }
        acc[item.question].push(item);
        return acc;
    }, {}) || {};

    const handleRemoveTag = (id: number) => {
        useRemoveTag({ id: id });
    };

    const handleApproveTags = () => {
        // Collect all user IDs and the remark
        const allTaggedUsers = Object.values(groupedData).flat();

        const approveData = allTaggedUsers.map((user: any) => ({
            id: user.id,
            hrRemarks: remark,
            hrAdminId: loginuser?.empID
        }));

        useApproveTags(approveData);
        setIsOpen(!isOpen);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-h-[600px] min-w-[900px] overflow-y-auto">
                {isPending ? (
                    <p className="text-center text-blue-500">Loading...</p>
                ) : isError ? (
                    <p className="text-center text-red-500">Failed to load data.</p>
                ) : Object.keys(groupedData).length > 0 ? (
                    <div className="space-y-8">
                        {Object.keys(groupedData).map((question, index) => (
                            <div key={index} className="border-b pb-4">
                                <h2 className="text-lg font-semibold mb-2 border-b pb-1">{question}</h2>
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
                                        {groupedData[question].map((user: any) => (
                                            <TableRow key={user.id}>
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
                                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">?</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.dept}</TableCell>
                                                <TableCell>{user.deg}</TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleRemoveTag(user.id)} variant="destructive" size="sm" className="rounded-full">
                                                        <Delete />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                        <strong>Approval Remark: </strong>
                        <div className="flex items-center gap-2">
                            <Textarea onChange={(e) => setRemark(e.target.value)} placeholder="Remark" />
                            <div className="flex flex-col gap-1">
                                <Button onClick={() => handleApproveTags()} disabled={remark.length == 0} className="mt-2">Approve <Drone /></Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 my-10">The <span className="text-red-500">welfare officer</span> not tag any person yet!</p>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ApprovalTagPerson;