"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart } from "lucide-react"
import Link from "next/link"
import CountUp from 'react-countup'
import Magic from "./Magic"
import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { surveyApi } from "@/apis/survey"


const Hero = () => {
   const { data: quickState = [] } = useQuery({
        queryKey: ['state'],
        queryFn: surveyApi.quickState
    });

  return (
    <Magic>
      <div className="relative z-10 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm">
              <Heart className="w-4 h-4 mr-2 text-red-400" />
              Naturub Accessories BD (Pvt.) Ltd.
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Voice
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Matters</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Stand up for workplace rights, organize collective action, and create meaningful change. Together, we build
            stronger, fairer workplaces for everyone.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <Link href="/login">
                Get Start
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

          </motion.div>

          {/* Stats */}
          <Suspense fallback={<p>Loading...</p>}>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <CountUp end={quickState?.[0]?.numberOfForms || 0} duration={2} suffix="+" />
                </div>
                <div className="text-gray-400">Number OF Forms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <CountUp end={quickState[0]?.totalResponse || 0} duration={3} suffix="+" />
                </div>
                <div className="text-gray-400">Number Of Responses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  <CountUp end={quickState[0]?.numberOfActiveUsers || 0} duration={4} suffix="+" />
                </div>
                <div className="text-gray-400">Number Of Active Employees</div>
              </div>

            </motion.div>
          </Suspense>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </Magic>
  )
}

export default Hero
