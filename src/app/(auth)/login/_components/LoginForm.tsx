"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Users, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import Lottie from "lottie-react"
import lottieAnim from "../../../../../public/assets/Human Right.json"
import Magic from "@/app/_components/Magic"
import { useMutation } from "@tanstack/react-query"
import { authApis } from "@/apis/auth"
import { toast } from "sonner"
import { constents } from "@/constents"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"
import useStore from "@/store"
import { cwd } from "process"

// Validation schema
const loginSchema = z.object({
    id: z.string().min(1, "Employee ID is required"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(1, "Password must be at least 1 characters")
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loginError, setLoginError] = useState("")
    const loginUser = useStore((state)=> state.loginUser);

    const router = useRouter();



    const { mutate } = useMutation({
        mutationFn: authApis.loginUserMutation,
        onSuccess: (data) => {
            if (data?.token) {
                toast.success(`Welcome back 😊.`);
                console.log(data);
                localStorage.setItem(constents.AUTH_KEY, data.token);
                Cookies.set(constents.AUTH_KEY, data.token, {
                    expires: 3 / 24, // 3 hours
                    secure: false,
                });

                router.push("/dashboard");
            }
        },
        onError: () => {
            toast.error("Invalid credentials. Please try again.");
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setLoginError("")

        try {
            if (data.id && data.password) {
                mutate({
                    Username: data.id,
                    Password: data.password,
                });
            } else {
                toast.error("Emp is or password missing.")
            }
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.")
            toast.error(loginError);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Magic>
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-4"
                >
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm">
                        <Shield className="w-4 h-4 mr-2 text-purple-400" />
                        Secure Access
                    </Badge>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl font-bold text-white mb-2"
                >
                    Welcome Back
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-gray-300"
                >
                    Login in to continue your advocacy journey
                </motion.p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center w-full">
                <Lottie className="w-1/3" animationData={lottieAnim} />
                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="w-full lg:w-[40%]"
                >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-white">Login In</CardTitle>
                            <CardDescription className="text-gray-300">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="id" className="text-white">
                                        Employee ID
                                    </Label>
                                    <Input
                                        id="id"
                                        type="text"
                                        placeholder="A28969"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                                        {...register("id")}
                                    />
                                    {errors.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center space-x-2 text-red-400 text-sm"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{errors.id.message}</span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 pr-10"
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center space-x-2 text-red-400 text-sm"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{errors.password.message}</span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Login Error */}
                                {loginError && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                        <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{loginError}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}



                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={!isValid || isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Login In...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Login In</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </form>


                        </CardContent>
                    </Card>
                </motion.div>
            </div>


            {/* Security Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 text-center"
            >
                <p className="text-xs text-gray-400">Your data is protected with enterprise-grade security</p>
            </motion.div>
        </Magic>
    )
}

export default LoginForm
