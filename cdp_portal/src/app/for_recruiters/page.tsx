"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Mail } from "lucide-react";

interface TypewriterEffectProps {
  text: string;
  speed?: number;
}

function TypewriterEffect({ text, speed = 100 }: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length && isTyping) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length) {
      setIsTyping(false);
      const resetTimeout = setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
        setIsTyping(true);
      }, 2000);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, text, speed, isTyping]);

  return (
    <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
      {displayText}
      <span className="inline-block w-1 h-8 ml-1 bg-primary animate-blink"></span>
    </h1>
  );
}

function RecruitmentProcess() {
  const steps = [
    { title: "Registration", description: "Companies register through our online portal." },
    { title: "Pre-Placement Talks", description: "Companies conduct presentations." },
    { title: "Application Screening", description: "Companies shortlist candidates." },
    { title: "Written Tests / Coding Rounds", description: "Candidates undergo assessments." },
    { title: "Interviews", description: "Multiple interview rounds are conducted." },
    { title: "Offer Rollout", description: "Selected candidates receive offers." },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="relative pb-12">
            {index !== steps.length - 1 && <div className="absolute left-5 top-5 h-full w-0.5 bg-gray-200"></div>}
            <div className="flex items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PastRecruiters() {
  const companies = [
    { name: "Google", logo: "/google.png" },
    { name: "Amazon", logo: "/amazon.png" },
    { name: "Samsung", logo: "/samsung.jpg" },
    { name: "Google", logo: "/google.png" },
    { name: "Amazon", logo: "/amazon.png" },
    { name: "Samsung", logo: "/samsung.jpg" },
    { name: "Google", logo: "/google.png" },
    { name: "Amazon", logo: "/amazon.png" },
    { name: "Samsung", logo: "/samsung.jpg" },
    { name: "Google", logo: "/google.png" },
    { name: "Amazon", logo: "/amazon.png" },
    { name: "Samsung", logo: "/samsung.jpg" }
  ];

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {companies.map((company, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <Image src={company.logo} alt={`${company.name} logo`} width={160} height={80} className="object-contain" />
          <p className="mt-2 text-center text-gray-700 font-medium">{company.name}</p>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative flex items-center justify-center py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container px-4 mx-auto text-center">
          <div className="mb-8">
            <TypewriterEffect text="Welcome Recruiters" />
          </div>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">Join hands with IIT Ropar to recruit exceptional talent.</p>
        </div>
      </section>

      <section id="why-iit-ropar" className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">Why IIT Ropar</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Academic Excellence</h3>
              <p className="text-gray-600">
                IIT Ropar is one of the eight new IITs set up by the Ministry of Human Resource Development (MHRD),
                Government of India, to expand the reach and enhance the quality of technical education in the country.
                Established in 2008, IIT Ropar has quickly risen to prominence as a center of excellence in education
                and research.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Exceptional Talent Pool</h3>
              <p className="text-gray-600">
                Our students are selected through the highly competitive Joint Entrance Examination (JEE), ensuring that
                only the brightest minds from across the country join our programs. Our rigorous curriculum and emphasis
                on practical learning ensure that our graduates are well-prepared to tackle real-world challenges.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Research and Innovation</h3>
              <p className="text-gray-600">
                IIT Ropar is committed to fostering a culture of innovation and research. Our state-of-the-art
                laboratories and research centers provide students with the resources they need to explore new ideas and
                develop cutting-edge solutions to complex problems.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Industry Collaboration</h3>
              <p className="text-gray-600">
                We actively collaborate with industry partners to ensure that our curriculum remains relevant and our
                students are equipped with the skills that employers value. These partnerships also provide
                opportunities for joint research projects and knowledge exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact-us" className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-8 text-3xl font-bold">Contact Us</h2>
          <p className="max-w-2xl mx-auto mb-8 text-gray-600">
            Our Training and Placement Cell is dedicated to facilitating the recruitment process and ensuring a seamless
            experience for both recruiters and students.
          </p>
          <a
            href="mailto:placement@iitrpr.ac.in"
            className="inline-flex items-center px-6 py-3 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Placement Cell
          </a>
        </div>
      </section>

      <section id="recruitment-process" className="py-16 bg-white">
        <h2 className="mb-12 text-3xl font-bold text-center">Recruitment Process</h2>
        <RecruitmentProcess />
      </section>

      <section id="past-recruiters" className="py-16 bg-gray-50">
        <h2 className="mb-12 text-3xl font-bold text-center">Past Recruiters</h2>
        <PastRecruiters />
      </section>
    </div>
  );
}
