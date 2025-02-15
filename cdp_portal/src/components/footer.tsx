import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-template text-gray-100 py-12">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Finds Section */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4 border-b border-gray-400 pb-2">
              QUICK FINDS
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Placement Statistics",
                "Recruiter Guide",
                "6-Month Internship Program",
                "Joint Master Thesis",
                "Student Demographics",
                "Past Recruiters",
                "Brochure Download",
                "AIPC Guidelines",
              ].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links Section */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4 border-b border-gray-400 pb-2">
              USEFUL LINKS
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Why Recruit at IIT Ropar?",
                "Training & Placement Activities",
                "Resources for PG Students",
                "Library Resources",
                "Video Resources",
                "Career Development Initiatives",
                "Messages from CDPC Team",
              ].map((item) => (
                <li key={item}>
                  <Link href="/" className="hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Links Section */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4 border-b border-gray-400 pb-2">
              OTHER LINKS
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: "Recruiter Portal", href: "/" },
                { name: "Student Login", href: "/" },
                { name: "Faculty Team", href: "/" },
                { name: "Student Team", href: "/" },
                { name: "Contact Us", href: "/" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Section */}
          <div>
            <h3 className="font-semibold text-lg text-white mb-4 border-b border-gray-400 pb-2">
              CONTACT DETAILS
            </h3>
            <p className="text-sm mb-6">
              Career Development and Placement Cell,
              <br />
              Indian Institute of Technology Ropar,
              <br />
              Rupnagar, Punjab - 140001, India
            </p>

            {/* Social Media Icons */}
            <p className="text-sm font-semibold mb-4">Follow us:</p>
            <div className="flex items-center space-x-4">
              {[
                { icon: Facebook, url: "#" },
                { icon: Twitter, url: "#" },
                { icon: Instagram, url: "#" },
              ].map(({ icon: Icon, url }, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${Icon.name}`}
                  className="text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>

            {/* How to Reach Link */}
            <p className="mt-6">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-400 underline"
              >
                How to Reach CDPC, IIT Ropar
              </a>
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-6 flex justify-between items-center text-sm">
          <p>&copy; {currentYear}, IIT Ropar CDPC</p>
          <p>Designed by CDPC Technical Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
