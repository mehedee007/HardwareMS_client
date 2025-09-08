import React from 'react';
import { motion } from 'framer-motion';

// Define the type for the approver data to ensure type safety
interface ApproverRemark {
    userImg?: string;
    fulL_NAME?: string;
    deptname?: string;
    secname?: string;
    remarks?: string;
}

// Mocking a Shadcn UI Card component with Tailwind CSS classes
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 bg-white border border-gray-200 rounded-2xl shadow-lg ${className}`}>
        {children}
    </div>
);

// Mocking a Shadcn UI Avatar component with Tailwind CSS classes
const Avatar = ({ src, alt }: { src?: string; alt: string }) => (
    <img
        src={src}
        alt={alt}
        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = 'https://placehold.co/100x100/A0A0A0/ffffff?text=User'; }}
    />
);

const HrApproverCard = ({ hrApproRemarks }: { hrApproRemarks: ApproverRemark[] }) => {
    // Check if there is data to display
    if (!hrApproRemarks || hrApproRemarks.length === 0) {
        return null;
    }

    const approver: ApproverRemark = hrApproRemarks[0];

    // Animation variants for a smooth fade-in
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            //@ts-ignore
            variants={cardVariants}
        >
            <Card className="flex flex-col items-start space-y-4">
                <div className="flex items-center space-x-4">
                    <Avatar
                        src={`data:image/jpeg;base64,${approver?.userImg}`}
                        alt="HR Approver"
                    />
                    <div className="flex flex-col">
                        <h5 className="text-xl font-semibold text-gray-900">{approver?.fulL_NAME}</h5>
                        <p className="text-sm text-gray-600">
                            Dept: {approver?.deptname}, Sec: {approver?.secname}
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 w-full">
                    <span className="text-gray-800 italic">"{approver?.remarks}"</span>
                </div>
            </Card>
        </motion.div>
    );
};

export default HrApproverCard;
