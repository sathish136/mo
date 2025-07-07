import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOvertimeRequestSchema, type OvertimeRequest, type InsertOvertimeRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OvertimeManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: overtimeRequests, isLoading } = useQuery({
    queryKey: ["/api/overtime-requests"],
    queryFn: async () => {
      const response = await fetch("/api/overtime-requests");
      if (!response.ok) throw new Error("Failed to fetch overtime requests");
      return response.json();
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
  });

  const { data: eligibleEmployees, isLoading: isEligibleLoading } = useQuery({
    queryKey: ["/api/overtime-eligible"],
    queryFn: async () => {
      const response = await fetch("/api/overtime-eligible");
      if (!response.ok) throw new Error("Failed to fetch eligible employees");
      return response.json();
    },
  });

  const createOvertimeRequestMutation = useMutation({
    mutationFn: async (overtimeRequest: InsertOvertimeRequest) => {
      const response = await apiRequest("POST", "/api/overtime-requests", overtimeRequest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-requests"] });
      toast({
        title: "Success",
        description: "Overtime request created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create overtime request",
        variant: "destructive",
      });
    },
  });

  const updateOvertimeRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/overtime-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-requests"] });
      toast({
        title: "Success",
        description: "Overtime request updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update overtime request",
        variant: "destructive",
      });
    },
  });

  const approveEligibleEmployeeMutation = useMutation({
    mutationFn: async (employee: any) => {
      const overtimeRequest = {
        employeeId: employee.id,
        date: new Date(employee.date),
        startTime: new Date(),
        endTime: new Date(),
        hours: employee.otHours,
        reason: "Auto-approved for overtime hours worked",
        status: "approved",
      };
      const response = await apiRequest("POST", "/api/overtime-requests", overtimeRequest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-eligible"] });
      toast({
        title: "Success",
        description: "Overtime approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve overtime",
        variant: "destructive",
      });
    },
  });

  const rejectEligibleEmployeeMutation = useMutation({
    mutationFn: async (employee: any) => {
      const overtimeRequest = {
        employeeId: employee.id,
        date: new Date(employee.date),
        startTime: new Date(),
        endTime: new Date(),
        hours: employee.otHours,
        reason: "Rejected - overtime not authorized",
        status: "rejected",
      };
      const response = await apiRequest("POST", "/api/overtime-requests", overtimeRequest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-eligible"] });
      toast({
        title: "Success",
        description: "Overtime rejected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject overtime",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertOvertimeRequest>({
    resolver: zodResolver(insertOvertimeRequestSchema),
    defaultValues: {
      employeeId: 0,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      hours: "0",
      reason: "",
      status: "pending",
    },
  });

  const onSubmit = (data: InsertOvertimeRequest) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const hours = ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(2);
    
    createOvertimeRequestMutation.mutate({
      ...data,
      hours,
    });
  };

  const handleApprove = (id: number) => {
    updateOvertimeRequestMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    updateOvertimeRequestMutation.mutate({ id, status: "rejected" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const filteredRequests = overtimeRequests?.filter((request: OvertimeRequest) => {
    if (filterStatus === "all") return true;
    return request.status === filterStatus;
  }) || [];

  const overtimeStats = {
    total: overtimeRequests?.length || 0,
    pending: overtimeRequests?.filter((r: OvertimeRequest) => r.status === "pending").length || 0,
    approved: overtimeRequests?.filter((r: OvertimeRequest) => r.status === "approved").length || 0,
    rejected: overtimeRequests?.filter((r: OvertimeRequest) => r.status === "rejected").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overtime Management</h2>
          <p className="text-sm text-gray-600">Manage employee overtime requests and approvals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]">
              <Plus className="w-4 h-4 mr-2" />
              New Overtime Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Overtime Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees?.map((employee: any) => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.fullName} - {employee.employeeId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter reason for overtime..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]"
                    disabled={createOvertimeRequestMutation.isPending}
                  >
                    {createOvertimeRequestMutation.isPending ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{overtimeStats.total}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{overtimeStats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{overtimeStats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{overtimeStats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eligible Employees for Overtime Approval */}
      {eligibleEmployees && eligibleEmployees.length > 0 && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Employees Eligible for Overtime Approval ({eligibleEmployees.length})
            </CardTitle>
            <p className="text-sm text-orange-700">
              These employees have worked overtime hours but haven't applied for approval yet.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Actual Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Required Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      OT Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-200">
                  {eligibleEmployees.map((employee: any) => (
                    <tr key={`${employee.employeeId}-${employee.date}`} className="hover:bg-orange-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {employee.employeeId}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {employee.fullName}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Badge variant={employee.employeeGroup === 'group_a' ? 'default' : 'secondary'}>
                          {employee.employeeGroup === 'group_a' ? 'Group A' : 'Group B'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(employee.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                        {employee.actualHours}h
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {employee.requiredHours}h
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-orange-600">
                        {employee.otHours}h
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveEligibleEmployeeMutation.mutate(employee)}
                            disabled={approveEligibleEmployeeMutation.isPending || rejectEligibleEmployeeMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectEligibleEmployeeMutation.mutate(employee)}
                            disabled={approveEligibleEmployeeMutation.isPending || rejectEligibleEmployeeMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overtime Requests Table */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Overtime Requests</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No overtime requests found for the selected filter
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Employee ID: {request.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.startTime).toLocaleTimeString()} - {new Date(request.endTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.hours} hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-700"
                              disabled={updateOvertimeRequestMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={updateOvertimeRequestMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
