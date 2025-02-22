import Navbar from "@/components/navbar";
import MainFooter from "@/components/main_footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Navbar */}
        <Navbar
          menuItems={[
            { label: "Notifications", href: "/student/" },
            { label: "My Profile", href: "/student/profile" },
            { label: "Job Openings", href: "/student/Job_openings" },
            { label: "Notices", href: "/notices" },
            { label: "Logout", href: "/logout" },
          ]}
        />
        <main>{children}</main>
        {/* <MainFooter /> */}
      </body>
    </html>
  );
}
