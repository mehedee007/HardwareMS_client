"use client";
import React, { ReactNode, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { surveyApi } from '@/apis/survey';
import useStore from '@/store';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
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

// --- Interface Definitions ---
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

// --- Component ---
const TagWithResponsiblePersons = ({ children, question }: { children: ReactNode; question: ITagQuestion }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const loginUser = useStore((state) => state.loginUser);
    const queryClient = useQueryClient();

    // Use a single query for already tagged people that's enabled when the dialog is open
    const { data: alreadyTaggedData, isLoading: isAlreadyTaggedLoading } = useQuery<IEmployee[]>({
        queryKey: ['alreadyTaggedPeople', question.question_id],
        queryFn: () => surveyApi.tagedPersons({ questionId: question.question_id }),
        enabled: isOpen, // Only run this query when the dialog is open
    });

    // Use a debounced search query to reduce API calls
    const { data: searchEmpData, isLoading: isEmpLoading } = useQuery<IEmployee[]>({
        queryKey: ["searchEmp", searchQuery],
        queryFn: () => surveyApi.searchEmployee({ Search: searchQuery }),
        enabled: searchQuery.length > 0,
        refetchInterval: false,
    });

    const {
        mutate: toggleTaggingMutation,
        isPending: isToggling,
    } = useMutation({
        mutationFn: surveyApi.tagQuestion,
        onSuccess: () => {
            // Invalidate the cache for the 'alreadyTaggedPeople' query
            // This will automatically refetch the data and update the UI
            queryClient.invalidateQueries({ queryKey: ['alreadyTaggedPeople', question.question_id] });
            toast.success("Tag updated successfully.");
        },
        onError: (error) => {
            console.error("Tagging error:", error);
            toast.error("Failed to update tag.");
        },
    });

    const handleToggleEmployee = (employee: IEmployee) => {
        const isCurrentlyTagged = alreadyTaggedData?.some((emp) => emp.empno === employee.empno);
        const tagData = {
            addedBy: loginUser?.empID || 1,
            addedWith: Number(employee.empno),
            questionId: question.question_id,
        };

        // If the employee is already tagged, untag them. Otherwise, tag them.
        if (isCurrentlyTagged) {
            // Assuming you have an untag function. You may need to create this API endpoint.
            // For now, let's just show an error or ignore. The prompt implies adding a new tag.
            toast.error("This person is already tagged. Untagging functionality is not implemented yet.");
        } else {
            toggleTaggingMutation([tagData]);
            setSearchQuery(""); // Clear the search query after tagging
        }
    };

    const isEmployeeTagged = (empno: number) => {
        return alreadyTaggedData?.some((emp) => emp.empno === empno);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className='min-w-[750px] overflow-hidden rounded-xl bg-background p-6 shadow-2xl'>
                <DialogHeader>
                    <DialogTitle className='text-2xl font-bold text-foreground'>
                        Tag Responsible Persons
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                        Search for employees to tag them as responsible for this question.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-6 md:grid-cols-2'>
                    {/* Already Tagged Section */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    >
                        <h3 className='text-lg font-semibold text-foreground'>Already Tagged</h3>
                        {isAlreadyTaggedLoading ? (
                            <div className='flex items-center justify-center h-24'>
                                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto'>
                                <AnimatePresence>
                                    {alreadyTaggedData && alreadyTaggedData.length > 0 ? (
                                        alreadyTaggedData.map((taged: any) => ( // Use 'any' here as the type is not fully defined
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
                                                    {/* Add a button to untag the person */}
                                                    {/* {taged.state !== 2 &&<button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent dialog from closing
                                                            handleToggleEmployee({ ...taged, empno: taged.empno });
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/50 transition-colors hover:text-red-500"
                                                        aria-label="Untag person"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>} */}
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className='text-sm text-center text-muted-foreground w-full'>
                                            No persons tagged yet.
                                        </p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>

                    {/* Employee Search Section */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    >
                        <Label htmlFor="search-employee" className="text-sm font-medium">
                            Find Responsible Person
                        </Label>
                        <div className="relative mt-2">
                            <Input
                                id="search-employee"
                                type="text"
                                placeholder="Search by ID or Name"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                value={searchQuery}
                                className="w-full"
                            />
                            {isEmpLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                </div>
                            )}
                        </div>

                        {searchQuery.length > 0 && (
                            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border bg-secondary/30 p-2 shadow-inner">
                                <AnimatePresence>
                                    {searchEmpData && searchEmpData.length > 0 ? (
                                        searchEmpData.map((emp) => (
                                            <motion.div
                                                key={emp.empno}
                                                layout
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                            >
                                                <AlertDialog>
                                                    <AlertDialogTrigger>
                                                        <div
                                                            className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-primary/5 ${isEmployeeTagged(emp.empno) ? "bg-primary/10 ring-2 ring-primary" : ""}`}
                                                        >
                                                            <div className="relative h-12 w-12 flex-shrink-0">
                                                                <Avatar className='h-12 w-12'>
                                                                    <AvatarImage
                                                                        src={emp.image && emp.image.trim() !== "" ? `data:image/jpeg;base64,${emp.image}` : `https://placehold.co/56x56/E5E7EB/4B5563?text=User`}
                                                                        alt={emp.fulL_NAME}
                                                                    />
                                                                    <AvatarFallback>{emp.fulL_NAME.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                {isEmployeeTagged(emp.empno) && (
                                                                    <CheckCircledIcon className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-background text-primary ring-2 ring-background" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="font-semibold text-foreground">
                                                                    {emp.fulL_NAME}{" "}
                                                                    <span className="text-sm font-normal text-muted-foreground">
                                                                        ({emp.empno})
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {emp.desgName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {emp.deptname} • {emp.secname}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete your account
                                                                and remove your data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleToggleEmployee(emp)}
                                                            >Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>




                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.p
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 text-center text-sm text-muted-foreground"
                                        >
                                            No employees found matching "{searchQuery}".
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TagWithResponsiblePersons;