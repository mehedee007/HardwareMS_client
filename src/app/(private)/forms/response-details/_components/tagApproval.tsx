"use client"
import React, { ReactNode, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';
import { surveyApi } from '@/apis/survey';
import useStore from '@/store';





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
    state: number
}

function TagApproval({ children, question }: { children: ReactNode; question: ITagQuestion }) {
    const [remarks, setRemarks] = useState<string>("");
    const [remarksError, setRemarksError] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const loginUser = useStore((state) => state.loginUser);

    const { data: alreadyTaggedData, isLoading: isAlreadyTaggedLoading } = useQuery<IEmployee[]>({
        queryKey: ['alreadyTaggedPeople', question.question_id],
        queryFn: () => surveyApi.tagedPersons({ questionId: question.question_id }),
        enabled: isOpen,
    });


    const { mutate: useApproveTags } = useMutation({
        mutationFn: surveyApi.tagedApproval,
        onSuccess: () => {
            toast.success("Approve done!");
        },
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });


    const { mutate: useRemarks } = useMutation({
        mutationFn: surveyApi.surveyRemarks,
        onSuccess: () => {
            toast.success("Remarks saved!");
        },
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });

    const handleApprove = ({ questionId, type }: { questionId: number; type: number }) => {
        useApproveTags({
            questionId: questionId,
            type: type
        })
        useRemarks({ empID: loginUser?.empID || 1, questionId: question.question_id, remarks: remarks, state: 2 })

        setIsOpen(false)
    }

    const handleRejectApprove = ({ questionId, type }: { questionId: number; type: number }) => {
        useApproveTags({
            questionId: questionId,
            type: type
        })
        setIsOpen(false)
    }

    const hasPendingApprovals = alreadyTaggedData?.some(emp => emp.state !== 2);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setRemarks(value);

        // Validate length dynamically
        if (value.length > 0 && value.length < 15) {
            setRemarksError("Remarks must be at least 15 characters.");
        } else {
            setRemarksError("");
        }
    };

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger>{children}</DialogTrigger>
                <DialogContent className='min-w-[750px]'>
                    <div className='grid grid-cols-2 gap-2 mt-2 max-h-52 overflow-y-auto my-5'>
                        <AnimatePresence>
                            {isAlreadyTaggedLoading ? (
                                <p className='text-sm text-center text-muted-foreground w-full'>Loading...</p>
                            ) : alreadyTaggedData && alreadyTaggedData.length > 0 ? (
                                alreadyTaggedData.map((taged: any) => (
                                    <motion.div
                                        key={taged.empno}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                    >
                                        <Card className='relative flex flex-row items-center gap-3 p-2 rounded-full border shadow-sm pr-10'>
                                            <Avatar className='h-8 w-8'>
                                                <AvatarImage
                                                    src={taged.addedWithImg && taged.addedWithImg.trim() !== "" ? `data:image/jpeg;base64,${taged.addedWithImg}` : `https://placehold.co/56x56/E5E7EB/4B5563?text=User`}
                                                    alt={taged.addedWithName}
                                                />
                                                <AvatarFallback>{taged.addedWithName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className='flex flex-col overflow-hidden'>
                                                <span className='font-medium text-sm truncate max-w-[120px]'>
                                                    {taged.addedWithName}
                                                </span>
                                                <small className='text-xs text-muted-foreground truncate'>
                                                    {taged.addedWithDept}
                                                </small>
                                            </div>
                                            {taged.state === 2 ? (
                                                <Button className='bg-green-500 text-white' variant="default" size="sm">Approved</Button>
                                            ) : (
                                                <Button className='bg-red-500 text-white' variant="default" size="sm">Pending...</Button>
                                            )}

                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <p className='text-sm text-center text-muted-foreground w-full'>
                                    The Welfare Officer No persons tagged yet.
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                    {hasPendingApprovals && (
                        <div>
                            <div className='flex items-center justify-center my-5 gap-2'>
                                <Button disabled={remarks.length === 0} onClick={() => handleApprove({ questionId: question.question_id, type: 1 })}>Approve</Button>
                                <Button onClick={() => handleRejectApprove({ questionId: question.question_id, type: 2 })} variant="destructive">Reject</Button>
                            </div>
                            <Textarea onChange={(e) => setRemarks(e.target.value)} placeholder='Remarks' />

                            <Textarea
                                value={remarks}
                                onChange={handleChange}
                                placeholder="Remarks"
                                className={`${remarksError ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                    }`}
                            />
                            {remarksError && <p className="text-red-500 text-sm">{remarksError}</p>}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TagApproval
