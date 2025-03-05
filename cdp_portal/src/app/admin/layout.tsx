import Navbar from "@/components/navbar";
import MainFooter from "@/components/main_footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
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

        <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
        {/* <MainFooter /> */}
      </body>
    </html>
  );
}
