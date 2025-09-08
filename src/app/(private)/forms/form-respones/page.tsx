"use client"

import { surveyApi } from '@/apis/survey';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDateRangePicker } from './_components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, MoveLeft, TagIcon } from 'lucide-react';
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
import useStore from '@/store';
import { hasAdminValidDesignation } from '@/constents';

// Type definitions for the backend data
interface FormResponse {
    message: string | null;
    formTitle: string;
    formDescription: string;
    created_at: string;
    id: number;
    answer: string;
    formId: number;
    questionId: number;
    questionTypeTitle: "text" | "textarea" | "email" | "number" | "date" | "select" | "radio" | "checkbox" | "rating";
    createdAt: string;
    userImg: string;
    userName: string;
    userDeptName: string;
    userSecName: string;
    empId: number;
    adminName: string;
    adminDeptName: string;
    adminImg: string;
    adminId: number;
    question: string;
    placeholder: string;
    is_required: number;
    questionOptions: string;
    rating_max: number | null;
}

// Utility function to clean up user names and department names
const cleanString = (str: string) => str.replace(/\s+/g, ' ').trim();

// Component to display an individual user's responses
const UserResponsesCard = ({ userResponses, index }: { userResponses: FormResponse[], index: number }) => {
    const firstResponse = userResponses[0];
    const userName = cleanString(firstResponse.userName);
    const formattedDate = format(new Date(firstResponse.createdAt), 'dd MMM yyyy hh:mm a');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <img src={`data:image/jpeg;base64,${firstResponse.userImg}`} alt={userName} className="rounded-full w-10 h-10" />
                        <div>
                            <CardTitle>{userName}</CardTitle>
                            <CardDescription className="text-sm">{cleanString(firstResponse.userDeptName)} - {cleanString(firstResponse.userSecName)}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-500 mb-4">
                        Submitted at: {formattedDate}
                    </div>
                    {userResponses.map((res, qIndex) => (
                        <div key={res.id} className="mb-4 last:mb-0">
                            <p className="font-semibold text-gray-800">{qIndex + 1}. {res.question}</p>
                            <div className="mt-1 text-gray-600">
                                <ResponseRenderer response={res} />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Component to render different types of answers
const ResponseRenderer = ({ response }: { response: FormResponse }) => {
    try {
        let answer = response.answer.replace(/^"|"$/g, ''); // Clean up quotes
        if (response.questionTypeTitle === 'checkbox') {
            const parsedAnswer = JSON.parse(response.answer.replace(/^"|"$/g, ''));
            answer = parsedAnswer.join(', ');
        }
        return <p className="text-gray-700 font-medium">{answer}</p>;
    } catch (e) {
        return <p className="text-red-500">Error parsing answer</p>;
    }
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ff559f'];

// Component for question-level analytics
const QuestionAnalyticsCard = ({ questionId, allResponses }: { questionId: number, allResponses: FormResponse[] }) => {
    const questionResponses = allResponses.filter(res => res.questionId === questionId);
    if (questionResponses.length === 0) return null;

    const firstResponse = questionResponses[0];
    const totalResponses = questionResponses.length;

    const renderAnalytics = () => {
        switch (firstResponse.questionTypeTitle) {
            case 'rating':
                const ratingCounts = new Array(firstResponse.rating_max || 5).fill(0).map((_, i) => ({
                    name: `Rating ${i + 1}`,
                    count: 0,
                    rating: i + 1,
                }));
                questionResponses.forEach(res => {
                    const rating = parseFloat(res.answer);
                    if (!isNaN(rating) && rating > 0 && rating <= (firstResponse.rating_max || 5)) {
                        ratingCounts[rating - 1].count++;
                    }
                });

                const averageRating = questionResponses.reduce((sum, res) => sum + parseFloat(res.answer), 0) / totalResponses;

                return (
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                            <span className="text-gray-500">/ {firstResponse.rating_max || 5}</span>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratingCounts} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'radio':
            case 'select':
            case 'checkbox':
                const allAnswers = questionResponses.flatMap(res => {
                    const answer = res.answer.replace(/^"|"$/g, '');
                    return res.questionTypeTitle === 'checkbox' ? JSON.parse(answer) : [answer];
                });

                const optionCounts = allAnswers.reduce((acc, curr) => {
                    acc[curr] = (acc[curr] || 0) + 1;
                    return acc;
                }, {} as { [key: string]: number });

                const options = JSON.parse(firstResponse.questionOptions);
                const chartData = options.map((option: string) => ({
                    name: option,
                    count: optionCounts[option] || 0
                }));

                return (
                    <div
                        // className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        className="w-full"
                    >
                        {/* <div className="h-64">
                            <p className="text-center font-semibold text-gray-700 mb-2">Bar Chart</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count">
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div> */}
                        <div className="h-72">
                            <p className="text-center font-semibold text-gray-700 mb-2">Pie Chart</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'text':
            case 'textarea':
            case 'email':
            case 'number':
            case 'date':
            default:
                return (
                    <>
                        <p className="text-sm text-gray-600 mb-2">Total Responses: <Badge>{totalResponses}</Badge></p>
                        <p className="font-semibold mb-2">Sample Responses:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {questionResponses.slice(0, 3).map(res => (
                                <p key={res.id} className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded-md truncate">
                                    <ResponseRenderer response={res} />
                                </p>
                            ))}
                            {totalResponses > 3 && (
                                <p className="text-sm text-gray-500">...and {totalResponses - 3} more</p>
                            )}
                        </div>
                    </>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
        >
            <Card className="bg-white shadow-sm">
                <CardHeader>
                    <div>
                        <CardTitle className="text-lg flex items-center justify-between"><span>{firstResponse.question}</span>
                            <Link href={`/forms/response-details?id=${firstResponse.questionId}`}>
                                <Button size="sm">Details <MoreVertical /></Button>
                            </Link>
                        </CardTitle>
                        <CardDescription>Analytics for this question</CardDescription>
                    </div>

                </CardHeader>
                <CardContent>
                    {renderAnalytics()}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Main component
function FormResponses() {
    const formParams = useSearchParams();
    const formId = formParams.get("id");

    const [department, setDepartment] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const route = useRouter();

    const loginUser = useStore((state) => state.loginUser);

    const {
        mutate: useFormResponses,
        data: formResponses,
        isPending,
        isError,
    } = useMutation({
        mutationFn: surveyApi.formResponses,
        onError: () => {
            toast.error("An error occurred while fetching responses.");
        },
    });

    const {
        mutate: useSuveyStateChange
    } = useMutation({
        mutationFn: surveyApi.surveyState,
        onError: () => {
            toast.error("An error occurred while fetching responses.");
        },
    });

    useEffect(() => {
        if (formId) {
            useFormResponses({
                formId: Number(formId),
                UserDeptName: department == 'all' ? null : department,
                fromDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
                toDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
            });
        }
    }, [formId, department, dateRange, useFormResponses]);

    const groupedData = useMemo(() => {
        if (!formResponses) return null;

        const users: { [key: string]: FormResponse[] } = {};
        const questions: { [key: number]: FormResponse[] } = {};

        formResponses.forEach((res: any) => {
            const userKey = `${res.empId}-${cleanString(res.userName)}`;
            if (!users[userKey]) users[userKey] = [];
            users[userKey].push(res);

            const questionKey = res.questionId;
            if (!questions[questionKey]) questions[questionKey] = [];
            questions[questionKey].push(res);
        });

        const uniqueQuestions = Object.values(questions).map(q => q[0]).sort((a, b) => a.questionId - b.questionId);
        const sortedUsers = Object.values(users).sort((a, b) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime());

        return { uniqueQuestions, sortedUsers };
    }, [formResponses]);

    const departments = useMemo(() => {
        if (!formResponses) return [];
        const uniqueDeptNames = [...new Set(formResponses.map((res: any) => cleanString(res.userDeptName)))];
        return uniqueDeptNames.filter(name => name).sort();
    }, [formResponses]);

    if (isPending) {
        return (
            <div className="p-8 sm:p-12 md:p-16 lg:p-24 container mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>

                {/* Filter Card Skeleton */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4 md:p-6 space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>

                {/* Badges Skeleton */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-40" />
                </div>

                {/* Accordion Skeletons */}
                <div className="space-y-4">
                    {/* Analytics Accordion Skeleton */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="flex justify-between items-center p-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-6 w-6" />
                        </div>
                    </div>
                    {/* Individual Responses Accordion Skeleton */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="flex justify-between items-center p-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Individual Cards Skeleton (within a conceptual open accordion) */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-lg">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-2/3" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !formResponses || formResponses.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen p-8">
                <Card className="max-w-xl text-center p-8">
                    <CardTitle>No responses found</CardTitle>
                    <CardDescription className="mt-4">
                        Either the form ID is invalid or there are no submissions matching your filter criteria.
                    </CardDescription>
                </Card>
            </div>
        );
    }

    const firstResponse = formResponses[0];
    const { uniqueQuestions, sortedUsers } = groupedData!;


    const handleSurveyDone = (id: number, state: number, type: number) => {
        useSuveyStateChange({ id: id, state: state, type: type });
        toast.success("Survey completed!");
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 sm:p-12 container mx-auto"
        >
            <div>
                <div className='flex items-center gap-3'>
                    <Button onClick={() => route.back()}><MoveLeft /> Back</Button>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"> {firstResponse.formTitle}</h1>
                </div>
                <p className="text-md sm:text-lg text-gray-600">{firstResponse.formDescription}</p>
            </div>

            <Card className="mb-8 p-4 md:p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Filter Responses</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Select onValueChange={setDepartment}>
                            <SelectTrigger id="department">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept: any) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        {
                            hasAdminValidDesignation(loginUser) && firstResponse?.formState == 2 &&

                            <AlertDialog><AlertDialogTrigger><Button>Survey Compleated </Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className='text-yellow-500'>
                                            This action cannot be undone. This will permanently action.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleSurveyDone(Number(formId), 4, 1)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        }
                        {
                            firstResponse?.formState !== 2 && <h3 className='text-xl bg-green-500 p-2 rounded-3xl text-white font-bold'>Survey Completed</h3>
                        }


                    </div>
                    {/* <div>
                        <Label>Date Range</Label>
                        <CalendarDateRangePicker
                            date={dateRange}
                            onDateChange={setDateRange}
                        />
                    </div> */}
                </div>
            </Card>

            <Separator className="my-8" />

            <div className="flex flex-wrap gap-2 mb-8 text-sm text-gray-500">
                <Badge variant="secondary">Total Submissions: {sortedUsers.length}</Badge>
                <Badge variant="secondary">Total Questions: {uniqueQuestions.length}</Badge>
            </div>

            <Accordion defaultValue="analytics" type="single" collapsible className="w-full">
                <AccordionItem value="analytics">
                    <AccordionTrigger className="text-xl font-extrabold">Overall Analytics</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            {uniqueQuestions.map((q) => (
                                <QuestionAnalyticsCard key={q.questionId} questionId={q.questionId} allResponses={formResponses} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="responses">
                    <AccordionTrigger className="text-xl font-extrabold">Individual Responses</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {sortedUsers.map((userResponses, index) => (
                                <UserResponsesCard key={userResponses[0].empId} userResponses={userResponses} index={index} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </motion.div>
    );
}

export default FormResponses;
