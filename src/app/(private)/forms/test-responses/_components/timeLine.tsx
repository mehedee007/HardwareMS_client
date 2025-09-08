"use client";

import React, { ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    VerticalTimeline,
    VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { WorkflowIcon, StarIcon, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { surveyApi } from "@/apis/survey";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define the data structure for type safety
interface TagState {
    full_Name: string;
    tagCreated: string;
    hrRemarks: string;
    tgName: string;
    tagPersonRemarkDate: string;
    tgDept: string;
    tgDes: string;
    tagPersonRemark: string;
}

// Define the props for the component
interface TimelineProps {
    children: ReactNode;
    question_id: number;
    form_id: number;
}

function Timeline({ children, question_id, form_id }: TimelineProps) {
    const [open, setOpen] = useState(false);

    // Mutation hook to fetch timeline data
    const { mutate: fetchTagState, data, isPending } = useMutation<TagState[]>({
        // @ts-ignore
        mutationFn: surveyApi.tagState,
        onError: () => {
            toast.error("Failed to fetch timeline data. Please try again.");
        },
    });

    // Handle dialog state and API call
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            // @ts-ignore
            fetchTagState({ form_id, question_id });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="min-w-4xl h-[90vh] flex flex-col p-6 bg-white rounded-2xl shadow-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-800">Review Timeline</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        A chronological record of feedback and actions for this question.
                    </DialogDescription>
                </DialogHeader>

                {/* Loading State */}
                {isPending && (
                    <div className="flex-1 flex justify-center items-center text-gray-500 text-lg">
                        <span className="animate-spin mr-2 h-6 w-6 border-4 border-t-blue-500 rounded-full"></span>
                        Loading timeline...
                    </div>
                )}

                {/* No data state */}
                {!isPending && (!data || data.length === 0) && (
                    <div className="flex-1 flex justify-center items-center text-gray-500 text-lg">
                        No timeline data available for this question.
                    </div>
                )}

                {/* Timeline content */}
                {!isPending && data && data.length > 0 && (
                    <div className="flex-1 overflow-y-auto pr-4 -mr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <VerticalTimeline>
                            {data.map((item, index) => (
                                <React.Fragment key={index}>
                                    {/* HR Admin Action */}
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--work"
                                        contentStyle={{ background: "#4a90e2", color: "#fff" }}
                                        contentArrowStyle={{ borderRight: "7px solid #4a90e2" }}
                                        date={item.tagCreated}
                                        iconStyle={{ background: "#4a90e2", color: "#fff" }}
                                        icon={<WorkflowIcon />}
                                    >
                                        <h3 className="vertical-timeline-element-title font-bold text-xl">
                                            HR Admin Tagged Responsible Person
                                        </h3>
                                        <p className="mt-2 text-sm">
                                            <span className="font-semibold">{item.full_Name}</span> was tagged with the remark:
                                        </p>
                                        <p className="italic text-base">"{item.hrRemarks}"</p>
                                    </VerticalTimelineElement>

                                    {/* Responsible Person's Response */}
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--education"
                                        contentStyle={{ background: "#e27d60", color: "#fff" }}
                                        contentArrowStyle={{ borderRight: "7px solid #e27d60" }}
                                        date={item.tagPersonRemarkDate}
                                        iconStyle={{ background: "#e27d60", color: "#fff" }}
                                        icon={<ChevronRight />}
                                    >
                                        <h3 className="vertical-timeline-element-title font-bold text-xl">
                                            Responsible Person's Feedback
                                        </h3>
                                        <p className="mt-2 text-sm">
                                            From: <span className="font-semibold">{item.tgName}</span>, <br />
                                            <span className="font-medium">{item.tgDes}</span> in <span className="font-medium">{item.tgDept}</span>
                                        </p>
                                        <p className="italic text-base mt-2">"{item.tagPersonRemark}"</p>
                                    </VerticalTimelineElement>
                                </React.Fragment>
                            ))}
                            <VerticalTimelineElement
                                iconStyle={{ background: "#39ad6a", color: "#fff" }}
                                icon={<StarIcon />}
                            />
                        </VerticalTimeline>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default Timeline;
