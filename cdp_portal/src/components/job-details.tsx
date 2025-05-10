import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobDetailsProps {
  job: {
    company: string;
    role: string;
    package: string;
    location: string;
    deadline: string;
    status: string;
    jobDescription: string;
    hiringFlow: { step: string; description: string }[];
    eligibility: {
      branches: string[];
      programs: string[];
      cgpaCriteria: Record<string, Record<string, string>>;
    };
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
            <p className="text-sm">{job.jobDescription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Process</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {job.hiringFlow.map((step, index) => (
                <li key={index}><strong>{step.step}:</strong> {step.description}</li>
              ))}
            </ul>
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
                {job.eligibility.branches.map((branch) => (
                  <Badge key={branch} variant="outline">
                    {branch.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>


            <div>
              <h3 className="text-sm font-medium mb-2">Minimum CGPA Criteria</h3>
              <div className="space-y-2">
                {Object.entries(job.eligibility.cgpaCriteria).map(([branch, programs]) => (
                  <div key={branch}>
                    <p className="font-medium">{branch.toUpperCase()}</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(programs).map(([program, cgpa]) => (
                        <Badge key={program} variant="outline">
                          {program.toUpperCase()}: {cgpa}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
