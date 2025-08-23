"use client"

import { motion } from "framer-motion"
import { Shield, Users } from "lucide-react"
import { ReactNode } from "react"


const Magic = ({ children }: { children: ReactNode }) => {


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

            <div className="relative min-h-screen overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" />
                </div>

                {/* Floating Elements */}
                <motion.div
                    className="absolute top-20 left-10 text-white/10"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <Users size={40} />
                </motion.div>

                <motion.div
                    className="absolute top-40 right-20 text-white/10"
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                >
                    <Shield size={35} />
                </motion.div>

                {/* Main Content */}
                <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Magic
