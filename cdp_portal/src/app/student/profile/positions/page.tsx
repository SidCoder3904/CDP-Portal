"use client";

import { useState, useEffect } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useStudentApi, Position } from "@/lib/api/students";
import { Icons } from "@/components/icons";

export default function PositionsPage() {
  const [positionsData, setPositionsData] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchPositionsData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studentApi.getMyPositions();
        setPositionsData(data);
      } catch (error) {
        console.error("Failed to fetch positions data:", error);
        setError("Failed to load positions data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPositionsData();
  }, []);

  const handleAdd = async (newData: any) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Convert flat data to the nested structure
      const transformedData = {
        position_details: {
          title: {
            current_value: newData.title ?? "",
            last_verified_value: null,
          },
          organization: {
            current_value: newData.organization ?? "",
            last_verified_value: null,
          },
          duration: {
            current_value: newData.duration ?? "",
            last_verified_value: null,
          },
          description: {
            current_value: newData.description ?? "",
            last_verified_value: null,
          },
          responsibilities: {
            current_value: newData.responsibilities ?? "",
            last_verified_value: null,
          },
          achievements: {
            current_value: newData.achievements ?? "",
            last_verified_value: null,
          },
        },
      };

      const addedPosition = await studentApi.addPosition(transformedData);
      setPositionsData([...positionsData, addedPosition]);
    } catch (error) {
      console.error("Failed to add position:", error);
      setError("Failed to add position. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: any) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Convert flat data to the nested structure
      const transformedData = {
        position_details: {
          title: {
            current_value: newData.title ?? "",
            last_verified_value: null,
          },
          organization: {
            current_value: newData.organization ?? "",
            last_verified_value: null,
          },
          duration: {
            current_value: newData.duration ?? "",
            last_verified_value: null,
          },
          description: {
            current_value: newData.description ?? "",
            last_verified_value: null,
          },
          responsibilities: {
            current_value: newData.responsibilities ?? "",
            last_verified_value: null,
          },
          achievements: {
            current_value: newData.achievements ?? "",
            last_verified_value: null,
          },
        },
      };

      const updatedPosition = await studentApi.updatePosition(
        id,
        transformedData
      );
      setPositionsData(
        positionsData.map((pos) => (pos.id === id ? updatedPosition : pos))
      );
    } catch (error) {
      console.error("Failed to update position:", error);
      setError("Failed to update position. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await studentApi.deletePosition(id);
      setPositionsData(positionsData.filter((pos) => pos.id !== id));
    } catch (error) {
      console.error("Failed to delete position:", error);
      setError("Failed to delete position. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading positions data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">
        Positions of Responsibility
      </h1>
      {positionsData.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">
            No positions found. Add your first position of responsibility.
          </p>
        </div>
      ) : (
        positionsData.map((position) => (
          <Card key={position.id} className="mb-6">
            <CardHeader>
              <CardTitle>
                {position.position_details.title.current_value}
              </CardTitle>
              {position.is_verified && (
                <div className="text-sm text-green-600">
                  Verified on:{" "}
                  {new Date(position.last_verified || "").toLocaleDateString()}
                </div>
              )}
              {position.remark && (
                <div className="text-sm text-gray-600">
                  Remark: {position.remark}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Organization"
                  value={position.position_details.organization.current_value}
                  status={position.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Duration"
                  value={position.position_details.duration.current_value}
                  status={position.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Description"
                  value={position.position_details.description.current_value}
                  status={position.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Responsibilities"
                  value={
                    position.position_details.responsibilities.current_value
                  }
                  status={position.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Achievements"
                  value={position.position_details.achievements.current_value}
                  status={position.is_verified ? "verified" : "pending"}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Position"
                  fields={[
                    {
                      name: "title",
                      label: "Title",
                      type: "text",
                    },
                    {
                      name: "organization",
                      label: "Organization",
                      type: "text",
                    },
                    {
                      name: "duration",
                      label: "Duration",
                      type: "text",
                    },
                    {
                      name: "description",
                      label: "Description",
                      type: "text",
                    },
                    {
                      name: "responsibilities",
                      label: "Responsibilities",
                      type: "text",
                    },
                    {
                      name: "achievements",
                      label: "Achievements",
                      type: "text",
                    },
                  ]}
                  onSave={(data) => handleUpdate(position.id, data)}
                  triggerButton={
                    <Button variant="outline" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Edit"
                      )}
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(position.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <EditDialog
        title="Add Position"
        fields={[
          {
            name: "title",
            label: "Title",
            type: "text",
          },
          {
            name: "organization",
            label: "Organization",
            type: "text",
          },
          {
            name: "duration",
            label: "Duration",
            type: "text",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
          },
          {
            name: "responsibilities",
            label: "Responsibilities",
            type: "text",
          },
          {
            name: "achievements",
            label: "Achievements",
            type: "text",
          },
        ]}
        onSave={handleAdd}
        triggerButton={
          <Button className="bg-template" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              "Add Position"
            )}
          </Button>
        }
      />
    </div>
  );
}
