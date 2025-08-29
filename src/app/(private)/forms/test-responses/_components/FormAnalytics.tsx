"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { motion } from "framer-motion";
import { PersonIcon } from "@radix-ui/react-icons";

// Type definitions for props and data
interface Field {
    id: number;
    field_type: string;
    label: string;
    field: string;
    rating_max?: number;
}

interface Response {
    [key: string]: any;
}

interface FormAnalyticsProps {
    responses: Response[];
    formFields: Field[];
}

interface ChartDataPoint {
    name: string;
    value: number;
}

interface AnalyticsResult {
    label: string;
    type: string;
    data: ChartDataPoint[];
}

// Color palette for the Pie and Bar charts
const COLORS = [
    "#6B46C1", // A rich purple
    "#48BB78", // A vibrant green
    "#F6E05E", // A cheerful yellow
    "#ED8936", // A warm orange
    "#E53E3E", // A bold red
    "#4299E1", // A cool blue
    "#9F7AEA", // A soft lavender
];

const FormAnalytics: React.FC<FormAnalyticsProps> = ({
    responses,
    formFields,
}) => {
    // useMemo caches the analytics data to prevent re-calculation on every render.
    const analyticsData = useMemo(() => {
        // Return an empty object if there are no responses
        if (!responses || responses.length === 0) return {};

        const data: { [key: string]: AnalyticsResult } = {};

        formFields.forEach((field) => {
            // Only analyze specific field types that can be charted
            if (["select", "radio", "checkbox", "rating"].includes(field.field_type)) {
                const fieldResponses: { [key: string]: number } = {};

                responses.forEach((response) => {
                    const value = response[field.field];

                    // This is the key section that now handles the multi-value checkbox
                    // by counting combinations instead of individual items.
                    if (field.field_type === "checkbox" && value) {
                        try {
                            // It attempts to parse the value as a JSON array.
                            const parsedValues: string[] = JSON.parse(value);
                            // If the parsing is successful and the result is an array...
                            if (Array.isArray(parsedValues)) {
                                // To ensure that "yes" and "no" is the same as "no" and "yes",
                                // we sort the array alphabetically.
                                parsedValues.sort();
                                // We create a unique key by joining the sorted values.
                                const combinationKey = parsedValues.join(" and ");
                                // We now count this unique combination as a single entry.
                                fieldResponses[combinationKey] = (fieldResponses[combinationKey] || 0) + 1;
                            }
                        } catch (e) {
                            // Fallback for parsing errors, treating the value as a single item.
                            fieldResponses[String(value)] = (fieldResponses[String(value)] || 0) + 1;
                        }
                    } else if (value) {
                        // For all other field types (select, radio, rating), it directly counts the value.
                        fieldResponses[String(value)] = (fieldResponses[String(value)] || 0) + 1;
                    }
                });

                // Convert the frequency map to an array of objects for Recharts.
                const chartData = Object.entries(fieldResponses).map(
                    ([name, value]) => ({
                        name,
                        value,
                    })
                );
                data[field.field] = {
                    label: field.label,
                    type: field.field_type,
                    data: chartData,
                };
            }
        });

        return data;
    }, [responses, formFields]);

    // Display a message if there are no responses.
    if (responses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
                <PersonIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No responses yet
                </h3>
                <p className="text-gray-500 max-w-sm">
                    Responses will appear here once people start submitting your form.
                </p>
            </div>
        );
    }

    // Render the analytics cards and charts.
    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-8 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(analyticsData).map((fieldData, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer"
                    >
                        <Card className="rounded-xl border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-700 font-semibold">{fieldData.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    {fieldData.type === "select" || fieldData.type === "radio" ? (
                                        <PieChart>
                                            <Pie
                                                data={fieldData.data}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {fieldData.data.map((entry, i) => (
                                                    <Cell
                                                        key={`cell-${i}`}
                                                        fill={COLORS[i % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    ) : (
                                        <BarChart data={fieldData.data} margin={{ top: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                tick={{ fontSize: 10 }}
                                            />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FormAnalytics;
