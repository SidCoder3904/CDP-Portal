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
    accommodation: boolean;
    eligibility: {
      branches: string[];
      cgpa: string;
      gender: string;
      uniformCgpa: boolean;
      cgpaCriteria?: Record<string, Record<string, string>>;
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
              <h3 className="text-sm font-medium mb-2">Minimum CGPA</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {job.eligibility.cgpa}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Gender Eligibility</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {job.eligibility.gender}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Additional Details</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Accommodation: {job.accommodation ? "Provided" : "Not Provided"}
                  </Badge>
                </div>
                {!job.eligibility.uniformCgpa && job.eligibility.cgpaCriteria && (
                  <div>
                    <p className="text-sm font-medium mt-2">Branch-specific CGPA Criteria:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
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
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
