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
            { label: "Placement Cycles", href: "/admin/placement_cycles" },
            { label: "Reports", href: "/admin/report" },
            { label: "Logout", href: "/" },
          ]}
        />

        <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
        {/* <MainFooter /> */}
      </body>
    </html>
  );
}
