"use client"
import React from 'react'
import { motion } from "framer-motion"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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
                
           
            </motion.div>
        </div>
    )
}

export default DashboardHeader