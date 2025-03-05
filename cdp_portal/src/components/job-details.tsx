import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobDetailsProps {
  job: {
    id: string;
    company: string;
    role: string;
    package: string;
    location: string;
    deadline: string;
    status: string;
    description: string;
    requirements: string[];
    eligibleBranches: string[];
    eligiblePrograms: string[];
    minCGPA: number;
  };
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{job.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">
                    {job.company} - Job Description.pdf
                  </p>
                  <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                </div>
              </div>
              <button className="text-primary text-sm font-medium">
                Download
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Eligible Branches</h3>
              <div className="flex flex-wrap gap-2">
                {job.eligibleBranches.map((branch) => (
                  <Badge key={branch} variant="outline">
                    {branch}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Eligible Programs</h3>
              <div className="flex flex-wrap gap-2">
                {job.eligiblePrograms.map((program) => (
                  <Badge key={program} variant="outline">
                    {program}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Minimum CGPA</h3>
              <Badge>{job.minCGPA}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{job.company}</p>
                <p className="text-xs text-muted-foreground">Technology</p>
              </div>
            </div>

            <div className="text-sm">
              <p>
                {job.company} is a multinational technology company that
                specializes in Internet-related services and products.
              </p>
            </div>

            <a href="#" className="text-primary text-sm font-medium">
              Visit company website
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
