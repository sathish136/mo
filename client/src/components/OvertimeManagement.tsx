import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, Filter, Check, TrendingUp, Award, Activity, RefreshCw, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OvertimeManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("pending");
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

  const { data: overtimeRequests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ["/api/overtime-requests"],
    queryFn: async () => {
      const response = await fetch("/api/overtime-requests");
      if (!response.ok) throw new Error("Failed to fetch overtime requests");
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

  // Calculate statistics
  const pendingRequests = overtimeRequests.filter((req: any) => req.status === 'pending').length;
  const approvedRequests = overtimeRequests.filter((req: any) => req.status === 'approved').length;
  const rejectedRequests = overtimeRequests.filter((req: any) => req.status === 'rejected').length;
  const totalRequests = overtimeRequests.length;

  const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Overtime Management
          </h1>
          <p className="text-slate-600 font-medium">Streamline overtime approvals with intelligent workflow automation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold">{eligibleEmployees.length}</p>
                <p className="text-blue-200 text-xs mt-1">Require action today</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total OT Hours</p>
                <p className="text-3xl font-bold">{totalOTHours.toFixed(1)}h</p>
                <p className="text-amber-200 text-xs mt-1">This period</p>
              </div>
              <div className="bg-amber-400 bg-opacity-30 p-3 rounded-full">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approval Rate</p>
                <p className="text-3xl font-bold">{approvalRate.toFixed(0)}%</p>
                <div className="mt-2">
                  <Progress value={approvalRate} className="h-2 bg-green-400" />
                </div>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0 shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Selected</p>
                <p className="text-3xl font-bold">{selectedEmployees.size}</p>
                <p className="text-purple-200 text-xs mt-1">{selectedOTHours.toFixed(1)}h selected</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <Check className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Action Bar */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">Date Filter:</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 border-slate-200"
                />
              </div>
              
              {selectedEmployees.size > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedEmployees.size} Selected
                  </Badge>
                  <span className="text-sm text-slate-600">•</span>
                  <span className="text-sm font-medium text-slate-700">{selectedOTHours.toFixed(1)}h total</span>
                </div>
              )}
            </div>
            
            {selectedEmployees.size > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                  onClick={handleBulkApprove}
                  disabled={bulkApproveMutation.isPending || bulkRejectMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve {selectedEmployees.size}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md"
                  onClick={handleBulkReject}
                  disabled={bulkApproveMutation.isPending || bulkRejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject {selectedEmployees.size}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Workflow Tabs */}
      <Card className="bg-white shadow-lg border-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-white">
              <AlertCircle className="w-4 h-4" />
              Pending Approvals ({eligibleEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2 data-[state=active]:bg-white">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedRequests})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2 data-[state=active]:bg-white">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedRequests})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Overtime Approvals Required - {new Date(selectedDate).toLocaleDateString()}
                  </h3>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {eligibleEmployees.length} Pending
                </Badge>
              </div>
              
              {isEligibleLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600 font-medium">Loading eligible employees...</p>
                </div>
              ) : eligibleEmployees.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-800 mb-2">All caught up!</h4>
                  <p className="text-slate-600">No overtime approvals needed for {new Date(selectedDate).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500 mt-1">Try selecting a different date or check attendance records.</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-amber-100">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEmployees.size === eligibleEmployees.length && eligibleEmployees.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-16 text-amber-800 font-semibold">S.No</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Employee ID</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Name</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Group</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Actual Hours</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Required Hours</TableHead>
                        <TableHead className="text-amber-800 font-semibold">OT Hours</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleEmployees.map((employee: any, index: number) => (
                        <TableRow key={`${employee.employeeId}-${employee.date}`} className="hover:bg-amber-50 border-amber-100">
                          <TableCell>
                            <Checkbox
                              checked={selectedEmployees.has(employee.id)}
                              onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">{index + 1}</TableCell>
                          <TableCell className="font-mono text-slate-700">{employee.employeeId}</TableCell>
                          <TableCell className="font-medium text-slate-800">{employee.fullName}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={employee.employeeGroup === 'group_a' ? 'default' : 'secondary'}
                              className={employee.employeeGroup === 'group_a' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                            >
                              {employee.employeeGroup === 'group_a' ? 'Group A' : 'Group B'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">{employee.actualHours}h</TableCell>
                          <TableCell className="text-slate-600">{employee.requiredHours}h</TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                              +{employee.otHours}h
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                                onClick={() => singleApproveMutation.mutate(employee)}
                                disabled={singleApproveMutation.isPending || singleRejectMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-sm"
                                onClick={() => singleRejectMutation.mutate(employee)}
                                disabled={singleApproveMutation.isPending || singleRejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="text-center py-12 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-green-800 mb-2">Approved Overtime Requests</h4>
              <p className="text-green-700">{approvedRequests} requests have been approved</p>
              <Button variant="outline" className="mt-4 border-green-200 text-green-700 hover:bg-green-100">
                <FileText className="w-4 h-4 mr-2" />
                View Approved Requests
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="text-center py-12 bg-red-50 rounded-lg">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-red-800 mb-2">Rejected Overtime Requests</h4>
              <p className="text-red-700">{rejectedRequests} requests have been rejected</p>
              <Button variant="outline" className="mt-4 border-red-200 text-red-700 hover:bg-red-100">
                <FileText className="w-4 h-4 mr-2" />
                View Rejected Requests
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}