"use client"; // Ensure this is a client component

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AboutPage() {
  const missionRef = useRef<HTMLDivElement>(null!);
  const visionRef = useRef<HTMLDivElement>(null!);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" }); // Optional chaining avoids null errors
  };

  return (
    <div className="flex flex-col items-center px-6 py-10">
      {/* Hero Image */}
      <img
        src="/bg.jpeg"
        alt="Campus Placements"
        className="w-full max-h-[400px] object-cover rounded-2xl shadow-lg"
      />

      {/* Content */}
      <div className="mt-8 max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-gray-800">About Campus Placements</h1>
        <p className="mt-4 text-gray-600">
          Campus placements are crucial in bridging the gap between academia and industry, providing students with job opportunities before they graduate.
          Our mission is to ensure that every student gets the best placement support possible.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-4">
        <Button onClick={() => scrollToSection(missionRef)}>Our Mission</Button>
        <Button onClick={() => scrollToSection(visionRef)}>Our Vision</Button>
      </div>

      {/* Our Mission Section */}
      <motion.div
        ref={missionRef}
        className="mt-12 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-semibold text-gray-800">Our Mission</h2>
            <p className="mt-3 text-gray-600">
              Our mission is to equip students with the necessary skills and guidance to secure rewarding careers. We partner with top companies and conduct regular training sessions to ensure student success.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Our Vision Section */}
      <motion.div
        ref={visionRef}
        className="mt-12 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-semibold text-gray-800">Our Vision</h2>
            <p className="mt-3 text-gray-600">
              Our vision is to create an ecosystem where students and recruiters can seamlessly connect, fostering innovation and excellence in career development.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
