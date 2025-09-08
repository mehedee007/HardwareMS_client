"use client";

import { surveyApi } from '@/apis/survey';
import { Button } from '@/components/ui/button';
import useStore from '@/store';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ResponsibleRemarks from './responsibleRemark';

// Define the shape of a single data item for type safety
interface SurveyItem {
    question: string;
    form_id: number;
    field_type: string;
    hrRemarks: string | null;
    hrAdminId: number;
    checkbox: string | null;
    radio: string | null;
    text: string | null;
    eEmail: string | null;
    number: string | null;
    date: string | null;
    rating: string | null;
    files: string | null;
    selects: string | null;
    fullName: string | null;
    hrImage: string | null;
    id: number;
    empId: number | null;
    message: string | null;
    select: string | null;
}

// Define the shape of the grouped data
interface GroupedData {
    [key: string]: SurveyItem[];
}

// Helper function to group data by field_type
const groupDataByFieldType = (data: SurveyItem[]): GroupedData => {
    return data.reduce((acc, item) => {
        const type = item.field_type || 'unspecified';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {} as GroupedData);
};

function Responsible() {
   const [isUpdate, setIsUpdate] = useState(false);
    const loginUser = useStore((state) => state.loginUser);

    const { mutate: getResponsibleData, data, isPending, isError } = useMutation<SurveyItem[]>({
        // @ts-ignore
        mutationFn: surveyApi.getResponsible,
        onError: () => {
            toast.error("Failed to fetch data. Please try again.");
        },
    });

    useEffect(() => {
        if (loginUser?.empID) {
            // @ts-ignore
            getResponsibleData({ empId: Number(loginUser?.empID) });
        }
    }, [loginUser, getResponsibleData, isUpdate]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-500 animate-pulse">Loading...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-red-500">Error fetching data. Please try again.</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-gray-500">No data available.</p>
            </div>
        );
    }

    const groupedData: GroupedData = groupDataByFieldType(data);
    const fieldTypes = Object.keys(groupedData);

    // --- Analytics Calculations ---
    const totalQuestions = data.length;
    const answeredQuestions = data.filter(item => {
        // Simple check to see if any response field has a value
        const values = [item.text, item.eEmail, item.number, item.date, item.selects, item.checkbox, item.radio, item.rating, item.files];
        return values.some(val => val && val !== 'N/A');
    }).length;
    // const completionRate = totalQuestions > 0 ? ((answeredQuestions / totalQuestions) * 100).toFixed(1) : 0;

    // Assuming ratings are numbers for analytics
    const ratings = data.filter(item => item.field_type === 'rating' && item.rating).map(item => Number(item.rating));
    const averageRating = ratings.length > 0 ? (ratings.reduce((sum, current) => sum + current, 0) / ratings.length).toFixed(1) : 'N/A';

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen text-gray-800">
            <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-800">
                Employee Survey Dashboard
            </h1>

            {/* --- Analytics Summary Section --- */}
            {/* <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
                <h2 className="text-3xl font-bold mb-6 text-blue-700">Analytics Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                        <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-purple-600">{answeredQuestions}</p>
                        <p className="text-sm text-gray-500">Answered Questions</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
                        <p className="text-sm text-gray-500">Average Rating</p>
                    </div>
                </div>
            </div> */}

            <hr className="my-10 border-t-2 border-gray-200" />

            {/* --- Detailed Responses Section --- */}
            {fieldTypes.map(type => (
                <div key={type} className="bg-white p-8 rounded-lg shadow-lg mb-12">
                    <div className='flex items-center justify-between gap-2 mb-4'>
                        <h2 className="text-2xl font-bold text-gray-700">
                            {groupedData[type][0]?.question || 'Question Responses'} <small className='text-sm'>Tatal response: {groupedData[type].length}</small>
                        </h2>
                        <ResponsibleRemarks setIsUpdate={setIsUpdate} id={groupedData[type][0].id}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Remark</Button>
                        </ResponsibleRemarks>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employees Responses 
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        HR Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groupedData[type].map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {(() => {
                                                switch (type) {
                                                    case 'text': return item.text || 'N/A';
                                                    case 'email': return item.eEmail || 'N/A';
                                                    case 'number': return item.number || 'N/A';
                                                    case 'date': return item.date || 'N/A';
                                                    case 'select': return item.select || 'N/A';
                                                    case 'checkbox': return item.checkbox ? JSON.parse(item.checkbox).join(', ') : 'N/A';
                                                    case 'radio': return item.radio || 'N/A';
                                                    case 'rating': return item.rating || 'N/A';
                                                    case 'files': return item.files ? 'File attached' : 'No file';
                                                    default: return 'N/A';
                                                }
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.hrRemarks || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Responsible;