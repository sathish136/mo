import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeaveTypeSchema, type LeaveType, type InsertLeaveType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LeaveTypeManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ["/api/leave-types"],
    queryFn: async () => {
      const response = await fetch("/api/leave-types");
      if (!response.ok) {
        throw new Error("Failed to fetch leave types");
      }
      return response.json();
    },
  });

  const createLeaveTypeMutation = useMutation({
    mutationFn: async (leaveType: InsertLeaveType) => {
      const response = await apiRequest("POST", "/api/leave-types", leaveType);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-types"] });
      toast({
        title: "Success",
        description: "Leave type created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create leave type",
        variant: "destructive",
      });
    },
  });

  const updateLeaveTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLeaveType> }) => {
      const response = await apiRequest("PUT", `/api/leave-types/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-types"] });
      toast({
        title: "Success",
        description: "Leave type updated successfully",
      });
      setIsDialogOpen(false);
      setEditingLeaveType(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave type",
        variant: "destructive",
      });
    },
  });

  const deleteLeaveTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/leave-types/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-types"] });
      toast({
        title: "Success",
        description: "Leave type deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete leave type",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertLeaveType>({
    resolver: zodResolver(insertLeaveTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      maxDaysPerYear: undefined,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertLeaveType) => {
    if (editingLeaveType) {
      updateLeaveTypeMutation.mutate({ id: editingLeaveType.id, data });
    } else {
      createLeaveTypeMutation.mutate(data);
    }
  };

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    form.reset({
      name: leaveType.name,
      description: leaveType.description || "",
      maxDaysPerYear: leaveType.maxDaysPerYear || undefined,
      isActive: leaveType.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this leave type?")) {
      deleteLeaveTypeMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLeaveType(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeLeaveTypes = leaveTypes?.filter((lt: LeaveType) => lt.isActive) || [];
  const inactiveLeaveTypes = leaveTypes?.filter((lt: LeaveType) => !lt.isActive) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Type Management</h2>
          <p className="text-sm text-gray-600">Configure available leave types for employees</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]">
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Study Leave, Compensatory Leave" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxDaysPerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Days Per Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 21"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the leave type and its conditions..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <p className="text-sm text-gray-600">
                          Allow employees to request this leave type
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]"
                    disabled={createLeaveTypeMutation.isPending || updateLeaveTypeMutation.isPending}
                  >
                    {(createLeaveTypeMutation.isPending || updateLeaveTypeMutation.isPending) 
                      ? "Saving..." 
                      : editingLeaveType 
                        ? "Update Leave Type" 
                        : "Add Leave Type"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leave Types</p>
                <p className="text-2xl font-bold text-gray-900">{leaveTypes?.length || 0}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Types</p>
                <p className="text-2xl font-bold text-green-600">{activeLeaveTypes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Types</p>
                <p className="text-2xl font-bold text-red-600">{inactiveLeaveTypes.length}</p>
              </div>
              <Settings className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Leave Types */}
      {activeLeaveTypes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Leave Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLeaveTypes.map((leaveType: LeaveType) => (
              <Card key={leaveType.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{leaveType.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaveType.description && (
                    <p className="text-sm text-gray-600">{leaveType.description}</p>
                  )}
                  {leaveType.maxDaysPerYear && (
                    <p className="text-sm text-gray-500">
                      <strong>Max Days:</strong> {leaveType.maxDaysPerYear} per year
                    </p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(leaveType)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(leaveType.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Leave Types */}
      {inactiveLeaveTypes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Inactive Leave Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveLeaveTypes.map((leaveType: LeaveType) => (
              <Card key={leaveType.id} className="border border-gray-200 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-600">{leaveType.name}</CardTitle>
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaveType.description && (
                    <p className="text-sm text-gray-500">{leaveType.description}</p>
                  )}
                  {leaveType.maxDaysPerYear && (
                    <p className="text-sm text-gray-400">
                      <strong>Max Days:</strong> {leaveType.maxDaysPerYear} per year
                    </p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(leaveType)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(leaveType.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!leaveTypes || leaveTypes.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Types Found</h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first leave type for employees to use.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}