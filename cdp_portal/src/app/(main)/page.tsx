"use client";

import type React from "react";

import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronRight, Award, Building, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const rankingData = [
  { title: "NIRF Ranking", value: "22nd", image: "/nirf.jpg" },
  {
    title: "QS World University Rankings",
    value: "351-400",
    image: "/qs-world-ranking.jpg",
  },
  { title: "Times Higher Education", value: "351-400", image: "/times.jpg" },
  { title: "ARIIA Ranking", value: "Band - Excellent", image: "/ariia.jpeg" },
];

const images = [
  "/campus_1.jpeg",
  "/campus_2.jpeg",
  "/campus_3.jpeg",
  "/campus_4.jpeg",
  "/campus_5.jpeg",
];

const recruiters = [
  "Google",
  "Microsoft",
  "Goldman Sachs",
  "Tata Group",
  "Amazon",
  "Apple",
  "Intel",
  "Adobe",
  "Qualcomm",
  "Samsung",
];

export default function CareerDevelopmentLanding() {
  const missionRef = useRef<HTMLDivElement>(null!);
  const visionRef = useRef<HTMLDivElement>(null!);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Google Fonts import for 'Pacifico' */}
      <link
        href="https://fonts.googleapis.com/css2?family=Imperial+Script&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cdpc_building.jpeg"
            alt="IIT Ropar Campus"
            fill
            priority
            className="object-cover blur-sm brightness-90"
          />
        </div>
        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4 md:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-7xl md:text-8xl lg:text-8xl  text-white mb-6 "
              style={{ fontFamily: "'Imperial Script'" }}
            >
              Shaping Future Leaders at IIT Ropar
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Connecting exceptional talent with industry leaders through our
              Career Development and Placement Cell
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={<Building className="h-10 w-10 text-template" />}
              value="100+"
              label="Companies Visited"
            />
            <StatCard
              icon={<Users className="h-10 w-10 text-template" />}
              value="95%"
              label="Placement Rate"
            />
            <StatCard
              icon={<Award className="h-10 w-10 text-template" />}
              value="₹28 LPA"
              label="Average Package"
            />
            <StatCard
              icon={<BookOpen className="h-10 w-10 text-template" />}
              value="500+"
              label="Internship Offers"
            />
          </div>
        </div>
      </section>

      {/* Director's Message Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Director's Image */}
              <div className="relative w-48 h-64 md:w-56 md:h-72 shrink-0">
                <Image
                  src="/director image.jpg"
                  alt="Director Rajeev Ahuja"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Message Body */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-template mb-4">
                  Director's Message
                </h2>
                <div className="h-1 w-20 bg-template mb-6"></div>
                <p className="text-slate-600 text-justify">
                  IIT Ropar stands as a beacon of academic excellence,
                  innovation, and research, shaping the future of education and
                  technology. As the Director, I take immense pride in our
                  institution's rapid growth, its commitment to excellence, and
                  its dynamic student community. Our mission is to foster an
                  environment that encourages curiosity, critical thinking, and
                  interdisciplinary learning. At IIT Ropar, we emphasize both
                  theoretical knowledge and hands-on experience, ensuring our
                  students are well-prepared to meet real-world challenges.
                </p>
                <p className="mt-4 text-slate-600 text-justify">
                  With cutting-edge research facilities, industry
                  collaborations, and a distinguished faculty, IIT Ropar
                  provides students with unparalleled opportunities for academic
                  and professional growth. We are dedicated to nurturing talent
                  and empowering young minds to push the boundaries of
                  knowledge. Our institution actively promotes innovation,
                  entrepreneurship, and leadership to shape the next generation
                  of global changemakers.
                </p>
                <p className="mt-4 text-slate-600 text-justify">
                  As we continue our journey toward excellence, I invite
                  students, faculty, and industry leaders to join us in this
                  transformative mission. IIT Ropar is not just an institute; it
                  is a movement toward a brighter, technology-driven future. Let
                  us work together to make a lasting impact on society and
                  create a legacy of innovation and success.
                </p>
                <p className="mt-4 font-semibold">
                  Prof. Rajeev Ahuja <br />
                  Director, IIT Ropar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="bg-template hover:bg-template/90"
              onClick={() => scrollToSection(missionRef)}
            >
              Our Mission
            </Button>
            <Button
              className="bg-template hover:bg-template/90"
              onClick={() => scrollToSection(visionRef)}
            >
              Our Vision
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Excellence in Placements
            </h2>
            <div className="h-1 w-20 bg-template mx-auto mb-6"></div>
          </div>
          <div className="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <p className="leading-relaxed">
              Campus placements at IIT Ropar serve as a bridge between students
              and industry, ensuring that graduates are well-equipped to step
              into professional roles. The Career Development and Placement Cell
              (CDPC) is dedicated to preparing students through workshops, mock
              interviews, and skill development sessions.
            </p>
            <p className="leading-relaxed">
              Each year, top recruiters from various domains, including
              technology, consulting, finance, and research, visit the campus to
              hire talent. Companies like Google, Microsoft, Goldman Sachs, and
              Tata Group have consistently shown interest in our graduates. IIT
              Ropar's rigorous curriculum and research-driven approach make our
              students highly sought after.
            </p>
            <p className="leading-relaxed">
              The placement cell also facilitates internships, providing
              students with real-world exposure before they even graduate. With
              an increasing number of recruiters and a high placement success
              rate, CDPC ensures that students step into their careers with
              confidence and a competitive edge.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <motion.section
        ref={missionRef}
        className="py-16 bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-template mb-4">
                  Our Mission
                </h2>
                <div className="h-1 w-20 bg-template mb-6"></div>
                <p className="text-slate-600">
                  The Career Development Department of IIT Ropar is dedicated to
                  empowering students with the skills, knowledge, and
                  opportunities needed to excel in their professional journeys.
                  Our mission is to bridge the gap between academia and industry
                  by providing robust career guidance, fostering industry
                  collaborations, and facilitating placements and internships.
                  We strive to equip students with the necessary technical,
                  managerial, and soft skills through workshops, training
                  sessions, and mentorship programs. By fostering a culture of
                  innovation, entrepreneurship, and lifelong learning, we aim to
                  help students identify and achieve their career aspirations.
                  Our department works closely with recruiters, alumni, and
                  faculty to ensure that students receive the best opportunities
                  for professional growth. Additionally, we promote
                  interdisciplinary learning and global exposure through
                  exchange programs and research collaborations. We are
                  committed to enhancing students' employability and preparing
                  them to become future leaders in their respective domains.
                </p>
                <p className="mt-4 text-slate-600">
                  The Career Development Department of IIT Ropar is committed to
                  guiding students towards successful and fulfilling careers by
                  equipping them with the necessary skills, industry exposure,
                  and mentorship. We aim to build a robust bridge between
                  academia and industry, ensuring that our students are
                  well-prepared for the professional world.
                </p>
                <p className="mt-4 text-slate-600">
                  We focus on holistic career development, offering technical
                  training, soft skills enhancement, leadership programs, and
                  entrepreneurial guidance to make our students future-ready.
                  Through personalized career counseling, mock interviews, and
                  resume-building workshops, we ensure that students are
                  confident in their job search and career choices.
                </p>
                <p className="mt-4 text-slate-600">
                  To foster industry collaborations, we work closely with top
                  recruiters, multinational companies, research institutions,
                  and startups to bring diverse career opportunities,
                  internships, and projects. We also promote global exposure
                  through exchange programs and research initiatives, ensuring
                  our students are globally competitive.
                </p>
                <p className="mt-4 text-slate-600">
                  Beyond placements, we empower students to become leaders and
                  innovators by encouraging entrepreneurship, research
                  excellence, and professional networking. Our mission is to
                  instill confidence, creativity, and adaptability, making IIT
                  Ropar graduates sought-after professionals who drive progress
                  in the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Our Vision Section */}
      <motion.section
        ref={visionRef}
        className="py-16 bg-slate-50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-template mb-4">
                  Our Vision
                </h2>
                <div className="h-1 w-20 bg-template mb-6"></div>
                <p className="text-slate-600">
                  Our vision is to establish IIT Ropar as a premier institution
                  known for producing industry-ready professionals and future
                  leaders equipped with technical expertise, problem-solving
                  abilities, and ethical values. We aspire to create a dynamic
                  ecosystem that nurtures talent and encourages students to
                  pursue diverse career paths, including entrepreneurship,
                  research, and industry roles. By fostering strong
                  relationships with global organizations, startups, and
                  academic institutions, we aim to provide students with
                  unparalleled opportunities for career advancement. Our
                  department envisions a future where every graduate of IIT
                  Ropar is equipped with the skills and confidence to make a
                  meaningful impact in their chosen fields. We strive to
                  continuously evolve with changing industry trends and
                  technological advancements to ensure our students remain
                  competitive in the global job market. Through strategic
                  initiatives, mentorship programs, and a focus on holistic
                  development, we aim to position IIT Ropar as a leader in
                  career development, ensuring that our graduates are not just
                  job seekers but innovators and changemakers shaping the
                  future.
                </p>
                <p className="mt-4 text-slate-600">
                  We envision the Career Development Department of IIT Ropar as
                  a leading center for professional excellence, ensuring that
                  every student graduates with a clear career path, strong
                  industry connections, and a deep sense of purpose.
                </p>
                <p className="mt-4 text-slate-600">
                  Our vision is to build an ecosystem where innovation,
                  creativity, and leadership thrive. We aim to produce
                  technologically proficient, socially responsible, and
                  ethically driven professionals who excel in research,
                  entrepreneurship, and industry roles. By fostering a culture
                  of lifelong learning, we prepare our students to adapt to
                  future challenges and technological advancements.
                </p>
                <p className="mt-4 text-slate-600">
                  We aspire to make IIT Ropar a global hub for talent by
                  strengthening partnerships with top universities, global
                  companies, and government organizations. Through internships,
                  international collaborations, and cross-disciplinary research,
                  we will equip our students with world-class knowledge and
                  hands-on experience.
                </p>
                <p className="mt-4 text-slate-600">
                  Our goal is to make IIT Ropar a place where students not only
                  secure jobs but also create opportunities, disrupt industries,
                  and drive meaningful change in society. We aim to nurture
                  professionals who lead with integrity, think critically, and
                  innovate boldly, ensuring that they leave a lasting impact on
                  the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Rankings Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              IIT Ropar Rankings
            </h2>
            <div className="h-1 w-20 bg-template mx-auto mb-6"></div>
            <p className="text-slate-600">
              Recognized among the top institutions globally
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {rankingData.map((rank, index) => (
              <Card
                key={index}
                className="bg-white border-none shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="pb-2 flex justify-center">
                  <div className="relative w-24 h-24">
                    <Image
                      src={rank.image || "/placeholder.svg?height=96&width=96"}
                      alt={rank.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-lg text-slate-700 mb-2">
                    {rank.title}
                  </CardTitle>
                  <p className="text-2xl font-bold text-template">
                    {rank.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Campus Life
            </h2>
            <div className="h-1 w-20 bg-template mx-auto mb-6"></div>
            <p className="text-slate-600">
              Experience the vibrant environment at IIT Ropar
            </p>
          </div>
          <CampusCarousel images={images} />
        </div>
      </section>

      {/* Recruiters Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Our Recruiters
            </h2>
            <div className="h-1 w-20 bg-template mx-auto mb-6"></div>
            <p className="text-slate-600">
              Leading companies that trust IIT Ropar talent
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {recruiters.map((company, index) => (
              <div
                key={index}
                className="bg-slate-100 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <p className="font-semibold text-slate-700">{company}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button className="bg-template hover:bg-template/90 text-white">
              View All Recruiters
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center p-6 rounded-lg bg-slate-50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-3xl font-bold text-slate-800 mb-2">{value}</h3>
      <p className="text-slate-600">{label}</p>
    </div>
  );
}

// Campus Carousel Component
function CampusCarousel({ images }: { images: string[] }) {
  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={image || "/placeholder.svg?height=720&width=1280"}
                      alt={`Campus Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4">
        <CarouselPrevious className="mr-2" />
        <CarouselNext className="ml-2" />
      </div>
    </Carousel>
  );
}
