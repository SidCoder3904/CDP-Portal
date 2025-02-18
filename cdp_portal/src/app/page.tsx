"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const rankingData = [
  { title: "NIRF Ranking", value: "22nd", image: "/nirf.jpg" },
  { title: "QS World University Rankings", value: "351-400", image: "/qs-world-ranking.jpg" },
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

export default function CareerDevelopmentLanding() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700 drop-shadow-md border-b-4 border-blue-400 pb-2">
              Career Development and Placement Cell IIT Ropar
            </h1>
          </div>
          <div className="relative h-64 md:h-80">
            <Image
              src="/cdpc_building.jpeg"
              alt="IIT Ropar Campus"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Placement Text Section */}
        <section className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Campus placements at IIT Ropar serve as a bridge between students and industry, ensuring that graduates are well-equipped to step into professional roles. The Career Development and Placement Cell (CDPC) is dedicated to preparing students through workshops, mock interviews, and skill development sessions. Each year, top recruiters from various domains, including technology, consulting, finance, and research, visit the campus to hire talent. Companies like Google, Microsoft, Goldman Sachs, and Tata Group have consistently shown interest in our graduates. IIT Ropar's rigorous curriculum and research-driven approach make our students highly sought after. The placement cell also facilitates internships, providing students with real-world exposure before they even graduate. With an increasing number of recruiters and a high placement success rate, CDPC ensures that students step into their careers with confidence and a competitive edge.
          </p>
        </section>

        {/* Rankings Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">IIT Ropar Rankings</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {rankingData.map((rank, index) => (
              <Card key={index} className="w-64 bg-white shadow-lg">
                <CardHeader className="pb-2">
                  <Image src={rank.image} alt={rank.title} width={200} height={200} className="mx-auto" />
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-lg">{rank.title}</CardTitle>
                  <p className="text-2xl font-bold">{rank.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Image Slider Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Campus Life</h2>
          <CarouselDemo images={images} />
        </section>

        {/* Past Recruiters and Alumni Section */}
        <section className="mb-12">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Our Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-48">
                  <Image src="/company.png" alt="Recruiters" layout="fill" objectFit="cover" className="rounded-lg shadow-md" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Past Recruiters</h3>
                  <ul className="list-disc list-inside">
                    <li>Tech Giant Inc.</li>
                    <li>Global Finance Corp.</li>
                    <li>Innovation Systems Ltd.</li>
                    <li>Future Robotics</li>
                    <li>Green Energy Solutions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Notable Alumni</h3>
                  <ul className="list-disc list-inside">
                    <li>Dr. Innovator - CEO, TechStart</li>
                    <li>Eng. Leader - CTO, Global AI</li>
                    <li>Prof. Researcher - Stanford University</li>
                    <li>Entrepreneur Success - Founder, EcoTech</li>
                    <li>Policy Maker - Senior Advisor, UN</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

// Carousel Component
export function CarouselDemo({ images }: { images: string[] }) {
  return (
    <Carousel className="w-[80%] mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-2 h-[600px]">
                  <Image 
                    src={image} 
                    alt={`Campus Image ${index + 1}`} 
                    width={200} 
                    height={90} 
                    className="object-cover w-full h-full rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
