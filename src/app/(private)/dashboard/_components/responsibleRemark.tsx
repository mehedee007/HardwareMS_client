"use client"
import React, { ReactNode, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { surveyApi } from '@/apis/survey';
import useStore from '@/store';

function ResponsibleRemarks({ children, id, setIsUpdate }: { children: ReactNode; id: number; setIsUpdate: any }) {
    const [isOpen, setIsOpen] = useState(false);

    const [remarks, setRemarks] = useState<string>("");
    const loginUser = useStore((state) => state.loginUser);

    const { mutate: useSendRemerks } = useMutation({
        mutationFn: surveyApi.responsibleRemarks,

        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });

    const handleRemarks = () => {
        useSendRemerks({ id: Number(id), tagPersonRemark: remarks, tagWith: Number(loginUser?.empID) });
        toast.success("Remerk sended.");
        setIsOpen(false);
        setRemarks("");
        setIsUpdate((pre: boolean) => !pre);
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <div className='flex items-center gap-2 my-10'>
                    <Textarea onChange={(e) => setRemarks(e.target.value)} placeholder='Put your remarks...' />
                    <Button onClick={() => handleRemarks()} disabled={remarks.length == 0}>Send <Send /></Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ResponsibleRemarks