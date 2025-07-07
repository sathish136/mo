import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, Filter, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OvertimeManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eligibleEmployees = [], isLoading: isEligibleLoading } = useQuery({
    queryKey: ["/api/overtime-eligible", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/overtime-eligible?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch eligible employees");
      return response.json();
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (employees: any[]) => {
      const promises = employees.map(employee => {
        const overtimeRequest = {
          employeeId: employee.id,
          date: new Date(employee.date),
          startTime: new Date(),
          endTime: new Date(),
          hours: employee.otHours,
          reason: "Bulk approved for overtime hours worked",
          status: "approved",
        };
        return apiRequest("POST", "/api/overtime-requests", overtimeRequest).then(res => res.json());
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-eligible"] });
      setSelectedEmployees(new Set());
      toast({
        title: "Success",
        description: `${selectedEmployees.size} overtime requests approved successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve overtime requests",
        variant: "destructive",
      });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: async (employees: any[]) => {
      const promises = employees.map(employee => {
        const overtimeRequest = {
          employeeId: employee.id,
          date: new Date(employee.date),
          startTime: new Date(),
          endTime: new Date(),
          hours: employee.otHours,
          reason: "Bulk rejected - overtime not authorized",
          status: "rejected",
        };
        return apiRequest("POST", "/api/overtime-requests", overtimeRequest).then(res => res.json());
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime-eligible"] });
      setSelectedEmployees(new Set());
      toast({
        title: "Success",
        description: `${selectedEmployees.size} overtime requests rejected successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject overtime requests",
        variant: "destructive",
      });
    },
  });

  const singleApproveMutation = useMutation({
    mutationFn: async (employee: any) => {
      const overtimeRequest = {
        employeeId: employee.id,
        date: new Date(employee.date),
        startTime: new Date(),
        endTime: new Date(),
        hours: employee.otHours,
        reason: "Approved for overtime hours worked",
        status: "approved",
      };
      const response = await apiRequest("POST", "/api/overtime-requests", overtimeRequest);
      return response.json();
    },
    onSuccess: () => {
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

  const singleRejectMutation = useMutation({
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(eligibleEmployees.map((emp: any) => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkApprove = () => {
    const selectedEmpData = eligibleEmployees.filter((emp: any) => selectedEmployees.has(emp.id));
    bulkApproveMutation.mutate(selectedEmpData);
  };

  const handleBulkReject = () => {
    const selectedEmpData = eligibleEmployees.filter((emp: any) => selectedEmployees.has(emp.id));
    bulkRejectMutation.mutate(selectedEmpData);
  };

  const totalOTHours = eligibleEmployees.reduce((sum: number, emp: any) => sum + parseFloat(emp.otHours), 0);
  const selectedOTHours = eligibleEmployees
    .filter((emp: any) => selectedEmployees.has(emp.id))
    .reduce((sum: number, emp: any) => sum + parseFloat(emp.otHours), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overtime Management</h1>
          <p className="text-gray-600">Manage employee overtime approvals and track working hours</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Eligible Employees</p>
                <p className="text-2xl font-bold text-blue-900">{eligibleEmployees.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Total OT Hours</p>
                <p className="text-2xl font-bold text-orange-900">{totalOTHours.toFixed(1)}h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Selected</p>
                <p className="text-2xl font-bold text-purple-900">{selectedEmployees.size}</p>
              </div>
              <Check className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Selected OT Hours</p>
                <p className="text-2xl font-bold text-green-900">{selectedOTHours.toFixed(1)}h</p>
              </div>
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter and Actions */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            
            {selectedEmployees.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedEmployees.size} selected</span>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleBulkApprove}
                  disabled={bulkApproveMutation.isPending || bulkRejectMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={bulkApproveMutation.isPending || bulkRejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Eligible Employees Table */}
      <Card className="border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Employees Eligible for Overtime Approval - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
          <p className="text-sm text-orange-700">
            Employees who worked overtime but haven't applied for approval yet.
          </p>
        </CardHeader>
        <CardContent>
          {isEligibleLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading eligible employees...</p>
            </div>
          ) : eligibleEmployees.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No eligible employees found for {new Date(selectedDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Try selecting a different date or check if attendance records exist.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      <Checkbox
                        checked={selectedEmployees.size === eligibleEmployees.length && eligibleEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Actual Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Required Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      OT Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-200">
                  {eligibleEmployees.map((employee: any, index: number) => (
                    <tr key={`${employee.employeeId}-${employee.date}`} className="hover:bg-orange-50">
                      <td className="px-4 py-3 text-sm">
                        <Checkbox
                          checked={selectedEmployees.has(employee.id)}
                          onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {employee.employeeId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {employee.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={employee.employeeGroup === 'group_a' ? 'default' : 'secondary'}>
                          {employee.employeeGroup === 'group_a' ? 'Group A' : 'Group B'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {employee.actualHours}h
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {employee.requiredHours}h
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-600">
                        {employee.otHours}h
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => singleApproveMutation.mutate(employee)}
                            disabled={singleApproveMutation.isPending || singleRejectMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => singleRejectMutation.mutate(employee)}
                            disabled={singleApproveMutation.isPending || singleRejectMutation.isPending}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}