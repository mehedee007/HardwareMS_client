"use client"


import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Building2, Calendar, Mail, MapPin, Phone, Users, Briefcase, User, Building, MessageCircle, LogOut, FormInputIcon } from "lucide-react"
import Link from "next/link"
import useStore from "@/store"


export default function ProfilePage() {
  const employeeData = useStore((state) => state.loginUser);
  const useLogout = useStore((state) => state.clearLoginUser);

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
  //       <Card className="max-w-md">
  //         <CardContent className="p-6 text-center space-y-4">
  //           <div className="text-red-500 text-4xl">⚠️</div>
  //           <h2 className="text-xl font-semibold text-gray-900">Error Loading Profile</h2>
  //           <p className="text-gray-600">{error}</p>
  //           <Button onClick={() => window.location.reload()}>Try Again</Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-gray-400 text-4xl">👤</div>
            <h2 className="text-xl font-semibold text-gray-900">No Profile Data</h2>
            <p className="text-gray-600">Employee profile data not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const calculateTenure = (joiningDate: string) => {
    const joining = new Date(joiningDate)
    const today = new Date()
    const years = today.getFullYear() - joining.getFullYear()
    const months = today.getMonth() - joining.getMonth()

    let totalMonths = years * 12 + months
    if (today.getDate() < joining.getDate()) {
      totalMonths--
    }

    const tenureYears = Math.floor(totalMonths / 12)
    const tenureMonths = totalMonths % 12

    return `${tenureYears} years, ${tenureMonths} months`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <CardContent className="relative -mt-16 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={`data:image/jpeg;base64,${employeeData?.userImage}`} alt={employeeData.userName} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {employeeData?.userName!
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold text-gray-900"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {employeeData.userName}
                  </motion.h1>
                  <motion.div
                    className="flex flex-wrap justify-center md:justify-start gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Badge variant="secondary" className="text-sm">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {employeeData.designationName}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <Building2 className="w-3 h-3 mr-1" />
                      {employeeData.departmentName}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Employee #{employeeData.empNo}
                    </Badge>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center md:justify-start gap-2 text-gray-600"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{employeeData.officialEmailAddress}</span>
                  </motion.div>
                </div>

                <motion.div
                  className="flex gap-2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button onClick={() => useLogout} className="cursor-pointer" variant="destructive" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                  <Link href="/dashboard/">
                    <Button size="sm">
                      <FormInputIcon className="w-4 h-4 mr-2" />
                      Create Form
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{calculateAge(employeeData.birthDate!)}</div>
              <div className="text-sm text-gray-600">Years Old</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {calculateTenure(employeeData.joiningDate!).split(",")[0]}
              </div>
              <div className="text-sm text-gray-600">Years of Service</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{employeeData.numberOfDepartmentEmployees}</div>
              <div className="text-sm text-gray-600">Dept. Colleagues</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{employeeData.numberOfSectionEmployees}</div>
              <div className="text-sm text-gray-600">Section Team</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Employee details and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="text-sm text-gray-900">{employeeData.userName}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Employee ID</label>
                    <div className="text-sm text-gray-900">{employeeData.empNo}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Birth Date</label>
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {formatDate(employeeData.birthDate!)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Joining Date</label>
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {formatDate(employeeData.joiningDate!)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tenure</label>
                    <div className="text-sm text-gray-900">{calculateTenure(employeeData.joiningDate!)}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge variant={employeeData.active === "True" ? "default" : "secondary"}>
                      {employeeData.active === "True" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Organization Structure */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization
                </CardTitle>
                <CardDescription>Department and reporting structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <div className="text-sm text-gray-900 mt-1">{employeeData.departmentName}</div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-700">Section</label>
                    <div className="text-sm text-gray-900 mt-1">{employeeData.sectionName}</div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-700">Level</label>
                    <div className="text-sm text-gray-900 mt-1">{employeeData.levelName}</div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-700">Department Head</label>
                    <div className="text-sm text-gray-900 mt-1">{employeeData.departmentOfHead}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Section Head</label>
                    <div className="text-sm text-gray-900 mt-1">{employeeData.sectionOfHead}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Team Size</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{employeeData.numberOfSectionEmployees}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Company Information */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>Associated companies and locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {employeeData?.companyInfo && employeeData?.companyInfo.map((company, index) => (
                  <motion.div
                    key={company.companyID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{company.companyCode}</Badge>
                      <h3 className="font-semibold text-sm">{company.companyName}</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{company.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{company.phoneNumber}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{company.emailAddress}</span>
                      </div>

                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">BIN: {company.binNo}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
