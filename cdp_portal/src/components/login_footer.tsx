import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";


const LoginFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-template text-gray-100 py-6">
      <div className="container mx-auto px-6 lg:px-16">

        {/* LoginFooter Bottom */}
        <div className="mt-1 border-t border-gray-700 pt-1 flex justify-between items-center text-sm">
          <p>&copy; {currentYear}, IIT Ropar CDPC</p>
          <p>Designed by CDPC Technical Team</p>
        </div>
      </div>
    </div>
  );
};

export default LoginFooter;
