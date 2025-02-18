import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, GraduationCap, Briefcase, Shield, FolderGit2, FileText, CheckCircle, XCircle } from "lucide-react"

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex bg-gray-50 pt-16">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <ScrollArea className="h-[calc(100vh-4rem)]">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile">
                        <User className="h-4 w-4" />
                        <span>Basic Details</span>
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile/education">
                        <GraduationCap className="h-4 w-4" />
                        <span>Education</span>
                        <XCircle className="ml-auto h-4 w-4 text-red-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile/experience">
                        <Briefcase className="h-4 w-4" />
                        <span>Experience</span>
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile/responsibilities">
                        <Shield className="h-4 w-4" />
                        <span>Positions of Responsibility</span>
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile/projects">
                        <FolderGit2 className="h-4 w-4" />
                        <span>Projects</span>
                        <XCircle className="ml-auto h-4 w-4 text-red-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/student/profile/documents">
                        <FileText className="h-4 w-4" />
                        <span>Resume & Certificates</span>
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  )
}

