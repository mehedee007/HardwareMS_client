import React from 'react'
import { motion } from "framer-motion"
import { FileTextIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'


type EmptyStateProps = {
  hasSearch: boolean
  hasFilter?: boolean
}
const EmptyState = ({ hasSearch, hasFilter }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300"
  >
    <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {hasSearch || hasFilter ? "No forms match your criteria" : "No forms yet"}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {hasSearch || hasFilter
        ? "Try adjusting your search or filter to find what you're looking for."
        : "Get started by creating your first form to collect responses and insights."}
    </p>
    {!hasSearch && (
      <a href="/forms/create">
        <Button variant="ghost">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Your First Form
        </Button>
      </a>
    )}
  </motion.div>
)

export default EmptyState