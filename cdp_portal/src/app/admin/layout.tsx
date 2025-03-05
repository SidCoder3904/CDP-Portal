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
            { label: "Notifications", href: "/admin" },
            { label: " Job Postings", href: "/admin/add_job" },
            { label: "Placement Cycles", href: "/admin/placement_cycles" },
            { label: "Notices", href: "/admin/notice" },
            { label: "Reports", href: "/admin/report" },
            { label: "Logout", href: "/logout" },
          ]}
        />
        <main>{children}</main>
        {/* <MainFooter /> */}
      </body>
    </html>
  );
}