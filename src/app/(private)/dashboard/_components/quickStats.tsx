"use client"
import React from 'react'
import { motion } from "framer-motion"
import { Card, CardContent } from '@/components/ui/card'
import { BarChartIcon, FileTextIcon, Users } from 'lucide-react'
import { GearIcon } from '@radix-ui/react-icons'
import CountUp from 'react-countup'
import { useQuery } from '@tanstack/react-query'
import { surveyApi } from '@/apis/survey'


function QuickStats() {
    const { data: quickState = [] } = useQuery({
        queryKey: ['state'],
        queryFn: surveyApi.quickState
    })


    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center flex-wrap gap-6 mb-5"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <FileTextIcon className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    <CountUp end={quickState?.[0]?.numberOfForms || 0} duration={2} suffix="+" />
                                </p>
                                <p className="text-gray-600">Total Forms</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChartIcon className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    <CountUp end={quickState[0]?.totalResponse || 0} duration={2} suffix="+" />
                                </p>
                                <p className="text-gray-600">Total Responses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    <CountUp end={quickState[0]?.numberOfActiveUsers || 0} duration={2} suffix="+" />
                                </p>
                                <p className="text-gray-600">Number Of Active Employee</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default QuickStats