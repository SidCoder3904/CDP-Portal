"use client"

import type React from "react"

interface TeamMember {
  id: number
  team: "administration" | "student" | "nucleus"
  position: string
  name: string
  email: string
  image: string
}

const teamMembers: TeamMember[] = [
  { id: 1, team: "administration", position: "Director", name: "Dr. Rajesh Kumar", email: "director@cdpc.edu", image: "/blank_student.jpg" },
  { id: 2, team: "administration", position: "Associate Director", name: "Dr. Priya Sharma", email: "associate@cdpc.edu", image: "/blank_student.jpg" },
  { id: 3, team: "administration", position: "Placement Officer", name: "Vikram Singh", email: "placement@cdpc.edu", image: "/blank_student.jpg" },
  { id: 4, team: "student", position: "Student Coordinator", name: "Samarth Singhal", email: "samarth@gmail.com", image: "/blank_student.jpg" },
  { id: 5, team: "student", position: "Technical Lead", name: "Ojas Jain", email: "ojas@gmail.com", image: "/blank_student.jpg" },
  { id: 6, team: "student", position: "Design Head", name: "Siddharth Verma", email: "siddharth@gmail.com", image: "/blank_student.jpg" },
  { id: 7, team: "student", position: "Content Manager", name: "Akash Jha", email: "akash@gmail.com", image: "/blank_student.jpg" },
  { id: 8, team: "nucleus", position: "Project Lead", name: "Ananya Patel", email: "ananya@nucleus.edu", image: "/blank_student.jpg" },
  { id: 9, team: "nucleus", position: "Developer", name: "Rohan Gupta", email: "rohan@nucleus.edu", image: "/blank_student.jpg" },
  { id: 10, team: "nucleus", position: "UX Designer", name: "Neha Sharma", email: "neha@nucleus.edu", image: "/blank_student.jpg" },
]

const TeamPage: React.FC = () => {
  const administrationTeam = teamMembers.filter((member) => member.team === "administration")
  const studentTeam = teamMembers.filter((member) => member.team === "student")
  const nucleusTeam = teamMembers.filter((member) => member.team === "nucleus")

  return (
    <div className="min-h-screen bg-gradient-to-b from-template-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-template-700 mb-16">
          <span className="inline-block border-b-4 border-template-2">Meet Our Team</span>
        </h1>

        {/* Administration Team Section */}
        <section className="mb-20">
          <div className="flex items-center justify-center mb-10">
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
            <h2 className="text-3xl font-bold text-template-6">Administration</h2>
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {administrationTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-template-600 h-3"></div>
                <div className="p-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-28 h-28 mx-auto rounded-full border-4 border-template-100 mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-template-600 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Team Section */}
        <section className="mb-20">
          <div className="flex items-center justify-center mb-10">
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
            <h2 className="text-3xl font-bold text-template-700 px-6">Student Team</h2>
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-template-500 h-3"></div>
                <div className="p-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 mx-auto rounded-full border-4 border-template-50 mb-4 object-cover"
                  />
                  <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  <p className="text-template-600 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nucleus Team Section */}
        <section className="mb-10">
          <div className="flex items-center justify-center mb-10">
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
            <h2 className="text-3xl font-bold text-template-700 px-6">Nucleus Team</h2>
            <div className="h-0.5 bg-template-200 flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {nucleusTeam.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="bg-template-600 h-3"></div>
                <div className="p-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 mx-auto rounded-full border-4 border-template-50 mb-4 object-cover"
                  />
                  <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  <p className="text-template-600 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TeamPage
