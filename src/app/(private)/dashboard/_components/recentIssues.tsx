


import React from 'react'
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"

const recentComplaints = [
  {
    id: "GRV-2024-001",
    title: "Workplace Safety Concern",
    department: "Production",
    status: "In Progress",
    priority: "High",
    date: "2024-01-15",
  },
  {
    id: "GRV-2024-002",
    title: "Equipment Maintenance Issue",
    department: "Maintenance",
    status: "Resolved",
    priority: "Medium",
    date: "2024-01-14",
  },
  {
    id: "GRV-2024-003",
    title: "Payroll Discrepancy",
    department: "HR",
    status: "Under Review",
    priority: "High",
    date: "2024-01-13",
  },
]
export default function RecentIssues() {
  return (
    <div>
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Latest grievances submitted to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentComplaints.map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{complaint.id}</span>
                        <Badge variant={complaint.priority === "High" ? "destructive" : "secondary"}>
                          {complaint.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{complaint.title}</p>
                      <p className="text-xs text-gray-500">
                        {complaint.department} • {complaint.date}
                      </p>
                    </div>
                    <Badge
                      variant={
                        complaint.status === "Resolved"
                          ? "default"
                          : complaint.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  )
}
