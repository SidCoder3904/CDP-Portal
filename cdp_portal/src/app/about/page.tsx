"use client"; // Ensure this is a client component

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AboutPage() {
  const missionRef = useRef<HTMLDivElement>(null!);
  const visionRef = useRef<HTMLDivElement>(null!);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center px-6 py-10">
      {/* Hero Image */}
      <img
        src="/bg.jpeg"
        alt="Campus Placements"
        className="w-full max-h-[400px] object-cover rounded-2xl shadow-lg"
      />

      {/* Director's Message Section */}
      <div className="mt-12 flex flex-col md:flex-row items-center md:items-start max-w-4xl">
        {/* Director's Image */}
        <img
          src="/director image.jpg"
          alt="Director Rajeev Ahuja"
          className="w-48 h-100 md:w-56 md:h-68 object-cover rounded-lg shadow-lg mr-6"
        />

        {/* Message Body */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-template">Director's Message</h1>
          <p className="mt-4 text-gray-600 text-justify">
            IIT Ropar stands as a beacon of academic excellence, innovation, and research, shaping the future of education and technology. As the Director, I take immense pride in our institution’s rapid growth, its commitment to excellence, and its dynamic student community. Our mission is to foster an environment that encourages curiosity, critical thinking, and interdisciplinary learning. At IIT Ropar, we emphasize both theoretical knowledge and hands-on experience, ensuring our students are well-prepared to meet real-world challenges.
            <br /><br />
            With cutting-edge research facilities, industry collaborations, and a distinguished faculty, IIT Ropar provides students with unparalleled opportunities for academic and professional growth. We are dedicated to nurturing talent and empowering young minds to push the boundaries of knowledge. Our institution actively promotes innovation, entrepreneurship, and leadership to shape the next generation of global changemakers.
            <br /><br />
            As we continue our journey toward excellence, I invite students, faculty, and industry leaders to join us in this transformative mission. IIT Ropar is not just an institute; it is a movement toward a brighter, technology-driven future. Let us work together to make a lasting impact on society and create a legacy of innovation and success.
          </p>
          <p className="mt-4 font-semibold">Prof. Rajeev Ahuja <br />Director, IIT Ropar</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-4">
        <Button className="bg-template" onClick={() => scrollToSection(missionRef)}>Our Mission</Button>
        <Button className="bg-template" onClick={() => scrollToSection(visionRef)}>Our Vision</Button>
      </div>

      {/* Our Mission Section */}
      <motion.div
        ref={missionRef}
        className="w-full max-w-4xl mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-semibold text-template">Our Mission</h2>
            <p className="mt-3 text-gray-600">
              The Career Development Department of IIT Ropar is dedicated to empowering students with the skills, knowledge, and opportunities needed to excel in their professional journeys. Our mission is to bridge the gap between academia and industry by providing robust career guidance, fostering industry collaborations, and facilitating placements and internships. We strive to equip students with the necessary technical, managerial, and soft skills through workshops, training sessions, and mentorship programs. By fostering a culture of innovation, entrepreneurship, and lifelong learning, we aim to help students identify and achieve their career aspirations. Our department works closely with recruiters, alumni, and faculty to ensure that students receive the best opportunities for professional growth. Additionally, we promote interdisciplinary learning and global exposure through exchange programs and research collaborations. We are committed to enhancing students' employability and preparing them to become future leaders in their respective domains.
              The Career Development Department of IIT Ropar is committed to guiding students towards successful and fulfilling careers by equipping them with the necessary skills, industry exposure, and mentorship. We aim to build a robust bridge between academia and industry, ensuring that our students are well-prepared for the professional world.

              We focus on holistic career development, offering technical training, soft skills enhancement, leadership programs, and entrepreneurial guidance to make our students future-ready. Through personalized career counseling, mock interviews, and resume-building workshops, we ensure that students are confident in their job search and career choices.

              To foster industry collaborations, we work closely with top recruiters, multinational companies, research institutions, and startups to bring diverse career opportunities, internships, and projects. We also promote global exposure through exchange programs and research initiatives, ensuring our students are globally competitive.

              Beyond placements, we empower students to become leaders and innovators by encouraging entrepreneurship, research excellence, and professional networking. Our mission is to instill confidence, creativity, and adaptability, making IIT Ropar graduates sought-after professionals who drive progress in the world.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Our Vision Section */}
      <motion.div
        ref={visionRef}
        className="w-full max-w-4xl mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl font-semibold text-template">Our Vision</h2>
            <p className="mt-3 text-gray-600">
              Our vision is to establish IIT Ropar as a premier institution known for producing industry-ready professionals and future leaders equipped with technical expertise, problem-solving abilities, and ethical values. We aspire to create a dynamic ecosystem that nurtures talent and encourages students to pursue diverse career paths, including entrepreneurship, research, and industry roles. By fostering strong relationships with global organizations, startups, and academic institutions, we aim to provide students with unparalleled opportunities for career advancement. Our department envisions a future where every graduate of IIT Ropar is equipped with the skills and confidence to make a meaningful impact in their chosen fields. We strive to continuously evolve with changing industry trends and technological advancements to ensure our students remain competitive in the global job market. Through strategic initiatives, mentorship programs, and a focus on holistic development, we aim to position IIT Ropar as a leader in career development, ensuring that our graduates are not just job seekers but innovators and changemakers shaping the future.
              We envision the Career Development Department of IIT Ropar as a leading center for professional excellence, ensuring that every student graduates with a clear career path, strong industry connections, and a deep sense of purpose.

              Our vision is to build an ecosystem where innovation, creativity, and leadership thrive. We aim to produce technologically proficient, socially responsible, and ethically driven professionals who excel in research, entrepreneurship, and industry roles. By fostering a culture of lifelong learning, we prepare our students to adapt to future challenges and technological advancements.

              We aspire to make IIT Ropar a global hub for talent by strengthening partnerships with top universities, global companies, and government organizations. Through internships, international collaborations, and cross-disciplinary research, we will equip our students with world-class knowledge and hands-on experience.

              Our goal is to make IIT Ropar a place where students not only secure jobs but also create opportunities, disrupt industries, and drive meaningful change in society. We aim to nurture professionals who lead with integrity, think critically, and innovate boldly, ensuring that they leave a lasting impact on the world.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
