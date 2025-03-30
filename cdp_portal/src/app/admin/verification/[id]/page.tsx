"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Check, X, AlertCircle } from "lucide-react"
import { useAdminApi, type StudentDetail } from "@/lib/api/admin"

export default function StudentVerificationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const adminApi = useAdminApi()

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch student IDs for navigation
  useEffect(() => {
    async function fetchStudentIds() {
      try {
        const { students } = await adminApi.getStudents({ perPage: 100 })
        const ids = students.map((s) => s._id)
        setStudentIds(ids)
        setCurrentIndex(ids.indexOf(studentId))
      } catch (err) {
        console.error("Failed to fetch student IDs:", err)
      }
    }

    fetchStudentIds()
  }, [])

  // Fetch student details
  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        setLoading(true)
        setError(null)
        const studentData = await adminApi.getStudentById(studentId)
        console.log("Received student data:", studentData)
        console.log("Verification status:", studentData.verification)
        setStudent(studentData)
      } catch (err) {
        console.error("Failed to fetch student details:", err)
        setError("Failed to load student details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchStudentDetails()
    }
  }, [studentId])

  const navigateToStudent = (direction: "next" | "prev") => {
    if (!studentIds.length) return

    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1

    // Handle wrapping around
    if (newIndex < 0) newIndex = studentIds.length - 1
    if (newIndex >= studentIds.length) newIndex = 0

    router.push(`/admin/verification/${studentIds[newIndex]}`)
  }

  const handleVerification = async (field: string, status: "verified" | "rejected") => {
    if (!student) return

    try {
      setIsUpdating(true)
      console.log(`Updating verification status for ${field} to ${status}`)
      const updatedStudent = await adminApi.updateVerificationStatus(studentId, field, status)
      console.log("Updated student data:", updatedStudent)
      console.log("Updated verification status:", updatedStudent.verification)
      setStudent(updatedStudent)
    } catch (err) {
      console.error(`Failed to update ${field} verification status:`, err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleVerifyAll = async () => {
    if (!student) return

    try {
      setIsUpdating(true)
      const updatedStudent = await adminApi.verifyAllFields(studentId)
      setStudent(updatedStudent)
    } catch (err) {
      console.error("Failed to verify all fields:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const isFullyVerified = student && Object.values(student.verification).every((v) => v === "verified")

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center text-destructive mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/admin/verification")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students List
        </Button>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Student Not Found</h1>
        <Button onClick={() => router.push("/admin/verification")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students List
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/admin/verification")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <h1 className="text-2xl font-bold">Student Verification</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigateToStudent("prev")}
            disabled={studentIds.length <= 1 || isUpdating}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous Student</span>
          </Button>
          <span className="text-sm">
            {currentIndex + 1} of {studentIds.length}
          </span>
          <Button
            variant="outline"
            onClick={() => navigateToStudent("next")}
            disabled={studentIds.length <= 1 || isUpdating}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next Student</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.passportImage} alt={student.name} />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-muted-foreground">{student.studentId}</p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">{student.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGPA:</span>
                  <span className="font-medium">
                    {typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Status:</span>
                  <Badge variant={isFullyVerified ? "default" : "destructive"}>
                    {isFullyVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <VerificationItem
                  label="Name"
                  value={student.name}
                  status={student.verification.name || "pending"}
                  onVerify={() => handleVerification("name", "verified")}
                  onReject={() => handleVerification("name", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Email"
                  value={student.email}
                  status={student.verification.email || "pending"}
                  onVerify={() => handleVerification("email", "verified")}
                  onReject={() => handleVerification("email", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Phone"
                  value={student.phone}
                  status={student.verification.phone || "pending"}
                  onVerify={() => handleVerification("phone", "verified")}
                  onReject={() => handleVerification("phone", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Date of Birth"
                  value={student.dateOfBirth}
                  status={student.verification.dateOfBirth || "pending"}
                  onVerify={() => handleVerification("date_of_birth", "verified")}
                  onReject={() => handleVerification("date_of_birth", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Gender"
                  value={student.gender}
                  status={student.verification.gender || "pending"}
                  onVerify={() => handleVerification("gender", "verified")}
                  onReject={() => handleVerification("gender", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Address"
                  value={student.address}
                  status={student.verification.address || "pending"}
                  onVerify={() => handleVerification("address", "verified")}
                  onReject={() => handleVerification("address", "rejected")}
                  isUpdating={isUpdating}
                />
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <VerificationItem
                  label="Major"
                  value={student.major}
                  status={student.verification.major || "pending"}
                  onVerify={() => handleVerification("major", "verified")}
                  onReject={() => handleVerification("major", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Student ID"
                  value={student.studentId}
                  status={student.verification.studentId || "pending"}
                  onVerify={() => handleVerification("student_id", "verified")}
                  onReject={() => handleVerification("student_id", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Enrollment Year"
                  value={student.enrollmentYear}
                  status={student.verification.enrollmentYear || "pending"}
                  onVerify={() => handleVerification("enrollment_year", "verified")}
                  onReject={() => handleVerification("enrollment_year", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Expected Graduation Year"
                  value={student.expectedGraduationYear}
                  status={student.verification.expectedGraduationYear || "pending"}
                  onVerify={() => handleVerification("expected_graduation_year", "verified")}
                  onReject={() => handleVerification("expected_graduation_year", "rejected")}
                  isUpdating={isUpdating}
                />

                <VerificationItem
                  label="Passport Image"
                  value={student.passportImage}
                  status={student.verification.passportImage || "pending"}
                  onVerify={() => handleVerification("passport_image", "verified")}
                  onReject={() => handleVerification("passport_image", "rejected")}
                  isUpdating={isUpdating}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button className="w-full" disabled={isFullyVerified || isUpdating} onClick={handleVerifyAll}>
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isFullyVerified ? (
                  "Student Fully Verified"
                ) : (
                  "Verify All Fields"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface VerificationItemProps {
  label: string
  value: string
  status: "verified" | "rejected" | "pending"
  onVerify: () => void
  onReject: () => void
  isUpdating: boolean
}

function VerificationItem({ label, value, status, onVerify, onReject, isUpdating }: VerificationItemProps) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{label}</h3>
          <p className="text-muted-foreground">{value}</p>
        </div>

        <div className="flex items-center space-x-2">
          {status === "verified" ? (
            <Badge variant="default" className="flex items-center">
              <Check className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          ) : status === "rejected" ? (
            <Badge variant="destructive" className="flex items-center">
              <X className="mr-1 h-3 w-3" />
              Rejected
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center">
              <AlertCircle className="mr-1 h-3 w-3" />
              Pending
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={onReject}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
          ) : (
            <>
              <X className="mr-1 h-3 w-3" />
              Reject
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
          onClick={onVerify}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
          ) : (
            <>
              <Check className="mr-1 h-3 w-3" />
              Verify
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

