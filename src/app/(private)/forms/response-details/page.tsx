"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { surveyApi } from '@/apis/survey';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MoveLeft, Tag, Tags } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TagWithResponsiblePersons from './_components/tagWithResponsiblePersons';
import useStore from '@/store';
import { hasAdminValidDesignation, hasWelfairDesignation } from '@/constents';
import TagApproval from './_components/tagApproval';
import HrApproverCard from './_components/HrApproverCard';

// --- Data Types ---
interface IResponseData {
    message: string | null;
    formTitle: string;
    formDescription: string;
    created_at: string;
    id: number;
    answer: string;
    formId: number;
    questionId: number;
    questionTypeTitle: string;
    createdAt: string;
    userImg: string;
    userName: string;
    userDeptName: string;
    userSecName: string;
    empId: number;
    adminName: string;
    adminImg: string;
    adminId: number;
    question: string;
    placeholder: string;
    is_required: number;
    questionOptions: string;
    rating_max: number | null;
}

interface IChartData {
    name: string;
    count: number;
}

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">উত্তর: {payload[0].value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{payload[0].name}</p>
            </div>
        );
    }
    return null;
};

// Component for displaying individual text responses
const TextResponses = ({ data, isDarkMode }: { data: IResponseData[], isDarkMode: boolean }) => (
    <motion.div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
    >
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-6">
            Individual Responses/ ব্যক্তিগত উত্তর ({data.length})
        </h3>
        <div className="space-y-4">
            <AnimatePresence>
                {data.map((response, index) => (
                    <motion.div
                        key={response.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center rounded-lg p-4 transition-colors duration-200 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                        <div className="flex items-center w-full sm:w-auto">
                            <img
                                src={`data:image/jpeg;base64,${response.userImg}` || "https://placehold.co/40x40/cbd5e1/4b5563?text=User"}
                                alt="User"
                                className="h-10 w-10 rounded-full object-cover mr-4 border border-zinc-200 dark:border-zinc-700"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{response.userName}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{response.userDeptName} - {response.userSecName}</p>
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-auto text-right w-full sm:w-auto">
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {response.answer}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                {new Date(response.createdAt).toLocaleDateString('bn-BD')}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </motion.div>
);

// Main Component
const ResponseDetails: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    const router = useRouter();

    const formParams = useSearchParams();
    const questionId = formParams.get("id");

    const loginUser = useStore((state) => state.loginUser);

    const { mutate: getQuestionDetails, data: detailsData, isPending, error: isError } = useMutation({
        mutationFn: surveyApi.questionDetails,
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });

    const { mutate: useHRApprovalRemarks, data: hrApproRemarks } = useMutation({
        mutationFn: surveyApi.getSurveyRemarks,
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });

    useEffect(() => {
        if (questionId) {
            getQuestionDetails({ questionId: Number(questionId) });
            useHRApprovalRemarks({ questionId: Number(questionId), state: 2 })
        }
    }, [questionId, getQuestionDetails]);



    if (isPending) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans antialiased transition-colors duration-300">
                <div className="w-full mx-auto space-y-8">
                    {/* Header Card Skeleton */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <hr className="my-4 border-t border-zinc-200 dark:border-zinc-800" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>

                    {/* Responses Analytics Skeleton */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Summary Skeletons */}
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            {/* Chart Skeleton */}
                            <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center">
                                <Skeleton className="h-full w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Individual Responses Skeleton */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-center w-full sm:w-auto">
                                        <Skeleton className="h-10 w-10 rounded-full mr-4" />
                                        <div className="flex-grow space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 sm:ml-auto text-right w-full sm:w-auto space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !detailsData || detailsData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 text-center transition-colors duration-300">
                <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">No responses found/ কোনো তথ্য পাওয়া যায়নি</h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">অনুরোধকৃত প্রশ্নের বিবরণ লোড করা যায়নি বা বিদ্যমান নেই।</p>
            </div>
        );
    }

    const questionData = detailsData[0];
    const totalResponses = detailsData.length;

    const cleanText = (text: string | undefined): string => text ? text.replace(/^\d+\.\t/, '').trim() : '';

    const questionText = cleanText(questionData.question);
    const formTitle = questionData.formTitle.trim();

    const isChartable = ["radio", "checkbox", "select", "rating"].includes(questionData.questionTypeTitle);

    let chartData: IChartData[] = [];
    let answerCounts: { [key: string]: number } = {};
    let questionOptions: string[] = [];

    if (isChartable) {
        try {
            questionOptions = JSON.parse(questionData.questionOptions);
            questionOptions.forEach(option => (answerCounts[option] = 0));
            detailsData.forEach((item: any) => {
                const answers = item.answer.includes(",") ? item.answer.split(",").map((a: string) => a.trim()) : [item.answer];
                answers.forEach((answer: string) => {
                    if (answerCounts.hasOwnProperty(answer)) {
                        answerCounts[answer]++;
                    }
                });
            });

            // Transform data for Recharts
            chartData = questionOptions.map(option => ({
                name: option.split('/')[0].trim(),
                count: answerCounts[option] || 0,
            }));
        } catch (e) {
            console.error("Failed to parse question options:", e);
        }
    }

    const gradientId = 'chartGradient';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 sm:p-8 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <motion.div
                className="w-full mx-auto space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header Card (Shadcn-like) */}
                <motion.div
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <div className='flex items-center gap-3'>
                        <Button onClick={() => router.back()}>
                            <MoveLeft /> Back
                        </Button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
                            {formTitle}
                        </h1>
                    </div>
                    <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">{questionData.formDescription.trim()}</p>
                    <hr className="my-4 border-t border-zinc-200 dark:border-zinc-800" />
                    <h2 className="text-xl sm:text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                        Question/প্রশ্ন:
                    </h2>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400 font-medium">
                        {questionText}
                    </p>
                    <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Total Responses/মোট উত্তর:</span> {totalResponses}
                    </p>
                </motion.div>

                {isChartable ? (
                    <>
                        {/* Analytics & Charts Card */}
                        <motion.div
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                        >
                            <h3 className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-6">
                                Responses Analytics/ উত্তর বিশ্লেষণ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                {/* Summary with Progress Bars */}
                                <div className="space-y-4">
                                    {questionOptions.map((option, index) => {
                                        const count = answerCounts[option] || 0;
                                        const percentage = totalResponses > 0 ? ((count / totalResponses) * 100) : 0;
                                        return (
                                            <motion.div
                                                key={option}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                                className="relative w-full rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                                            >
                                                <div
                                                    className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500 ease-out"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                                                    }}
                                                ></div>
                                                <div className="relative z-10 flex justify-between items-center">
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{option}</span>
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{percentage.toFixed(1)}% ({count})</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {/* Recharts Bar Chart */}
                                <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex flex-col items-center justify-center">
                                    <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-4">Responses Analytics/ উত্তর বিশ্লেষণ</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-zinc-700" />
                                            <XAxis dataKey="name" stroke="#a1a1aa" className="text-xs" tick={{ fill: isDarkMode ? '#a1a1aa' : '#52525b' }} />
                                            <YAxis stroke="#a1a1aa" className="text-xs" tick={{ fill: isDarkMode ? '#a1a1aa' : '#52525b' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Bar key={`bar-${index}`} dataKey="count" fill="url(#chartGradient)" />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <svg style={{ position: 'absolute', opacity: 0 }}>
                                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </svg>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tag With Responsible Persons */}
                        {questionData.formState == 4 && <motion.div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 100 }}>
                            <div className='flex items-center justify-between'>
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-6">
                                    Tag With Responsible Persons/ দায়িত্বশীল ব্যক্তিদের সাথে ট্যাগ করুন
                                </h3>
                                {
                                    hasWelfairDesignation(loginUser) && <TagWithResponsiblePersons question={{ form_id: detailsData[0].formId, question_id: detailsData[0].questionId, adminId: loginUser?.empID || 1, field_type: detailsData[0].questionTypeTitle, number_of_responses: detailsData.length, question: detailsData[0].question }}>
                                        <Button>Tag <Tag /></Button>
                                    </TagWithResponsiblePersons>
                                }
                                {
                                    hasAdminValidDesignation(loginUser) && <TagApproval question={{ form_id: detailsData[0].formId, question_id: detailsData[0].questionId, adminId: loginUser?.empID || 1, field_type: detailsData[0].questionTypeTitle, number_of_responses: detailsData.length, question: detailsData[0].question }}><Button>Approve Responsible Persons <Tags /></Button></TagApproval>
                                }


                            </div>
                            <HrApproverCard hrApproRemarks={hrApproRemarks} />
                        </motion.div>}


                        {/* Individual Responses Card */}
                        <TextResponses data={detailsData} isDarkMode={isDarkMode} />
                    </>
                ) : (
                    <TextResponses data={detailsData} isDarkMode={isDarkMode} />
                )}


            </motion.div>
        </div>
    );
};

export default ResponseDetails;
