import Image from "next/image";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="fixed top-0 w-full">
      <Navbar
        menuItems={[
          "Home",
          "About Us",
          "Notices",
          "Our Team",
          "Student Login",
          "Admin Login",
          "For Recruiters",
          "Contact Us",
        ]}
      />
    </div>
  );
}
