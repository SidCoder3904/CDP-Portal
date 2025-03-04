import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, CalendarDays, CheckCircle } from "lucide-react";

export default function RecruitmentProcess() {
  const steps = [
    {
      number: 1,
      title: "Company Registration",
      description:
        "Companies and organizations interested to recruit, register to the Career Services website.",
      icon: Users,
    },
    {
      number: 2,
      title: "Pre-process Tests",
      description:
        "Companies/Organizations can conduct the pre-processes (tests, assignments, etc.) and request for it along with the preferred date.",
      icon: Users,
    },
    {
      number: 3,
      title: "Application Process",
      description:
        "The JNF or TNF is frozen on the Career Services website by the company till a deadline, after which students can view and apply.",
      icon: Building2,
    },
    {
      number: 4,
      title: "Shortlisting",
      description:
        "Shortlisted students are notified based on their CVs or Test/GD performance.",
      icon: CheckCircle,
    },
    {
      number: 5,
      title: "Interview Scheduling",
      description:
        "The placement office allots dates for campus interviews, considering factors like student preference, job profile, etc.",
      icon: CalendarDays,
    },
    {
      number: 6,
      title: "Final Selection",
      description:
        "After completion of the selection process, the company announces the final list of selected students on the same day.",
      icon: CheckCircle,
    },
  ];

  const recruiters = [
    "/amazon.png", "/google.png", "/samsung.jpg",
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Our Recruitment Process</h1>
        <div className="mt-4"></div>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {steps.map((step) => (
          <Card key={step.number}>
            <CardContent className="flex gap-4 p-6">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                {step.number}
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <step.icon className="h-5 w-5" />
                  {step.title}
                </h2>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-6">Past Recruiters</h2>
        <div className="grid grid-cols-3 gap-6">
          {recruiters.map((logo, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-lg flex items-center justify-center"
            >
              <img src={logo} alt={`Recruiter ${index + 1}`} className="h-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
