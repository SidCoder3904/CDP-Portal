import Navbar from "@/components/navbar";
import MainFooter from "@/components/main_footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar
        menuItems={[
          { label: "Home", href: "/" },
          { label: "Our Team", href: "/team" },
          { label: "For Recruiters", href: "/for_recruiters" },
          { label: "Notices", href: "/notices" },
          { label: "Student Login", href: "/student_login" },
          { label: "Admin Login", href: "/admin_login" },
        ]}
      />
      <main>{children}</main>
      <MainFooter />
    </>
  );
} 