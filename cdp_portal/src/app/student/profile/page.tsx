import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function BasicDetails() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#002147]">Profile Details</h1>
        <Badge variant="outline" className="bg-green-50">
          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
          Profile Verified
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value="John Doe" disabled />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input value="Computer Science & Engineering" disabled />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value="Male" disabled />
            </div>
            <div className="space-y-2">
              <Label>Roll Number</Label>
              <Input value="2021CSB1234" disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value="john.doe@iitrpr.ac.in" disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value="+91 9876543210" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>GitHub Profile</Label>
              <Input placeholder="https://github.com/username" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn Profile</Label>
              <Input placeholder="https://linkedin.com/in/username" />
            </div>
          </div>

          <Button className="bg-[#002147] hover:bg-[#003167]">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
