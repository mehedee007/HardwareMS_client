"use client"
import React from 'react'
import { motion } from "framer-motion"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

function DashboardHeader() {
    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Survey Dashboard</h1>
                    <p className="text-gray-600 mt-1">Create and manage your forms</p>
                </div>
                <a href="/forms/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Form
                    </Button>
                </a>
            </motion.div>
        </div>
    )
}

export default DashboardHeader