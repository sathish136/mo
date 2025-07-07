import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, FileText, BarChart3, Users2, Clock, Download } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHolidaySchema, type Holiday, type InsertHoliday } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function HolidayManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [quickAddDate, setQuickAddDate] = useState("");
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddType, setQuickAddType] = useState("annual");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: holidays, isLoading } = useQuery({
    queryKey: ["/api/holidays", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/holidays?year=${selectedYear}`);
      if (!response.ok) {
        // Return empty array if holidays endpoint doesn't exist yet
        if (response.status === 404) return [];
        throw new Error("Failed to fetch holidays");
      }
      return response.json();
    },
  });



  const createHolidayMutation = useMutation({
    mutationFn: async (holiday: InsertHoliday) => {
      const response = await apiRequest("POST", "/api/holidays", holiday);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Success",
        description: "Holiday created successfully",
      });
      setIsDialogOpen(false);
      form.reset({
        name: "",
        date: new Date(),
        type: "annual",
        description: "",
        isRecurring: false,
        applicableGroups: ["group_a", "group_b"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create holiday",
        variant: "destructive",
      });
    },
  });



  const form = useForm<InsertHoliday>({
    resolver: zodResolver(insertHolidaySchema),
    defaultValues: {
      name: "",
      date: new Date(),
      type: "annual",
      description: "",
      isRecurring: false,
      applicableGroups: ["group_a", "group_b"],
    },
  });

  const onSubmit = (data: InsertHoliday) => {
    createHolidayMutation.mutate(data);
  };

  const handleQuickAdd = () => {
    if (!quickAddDate || !quickAddName) {
      toast({
        title: "Error",
        description: "Please fill in both date and name",
        variant: "destructive",
      });
      return;
    }

    const holidayData: InsertHoliday = {
      name: quickAddName,
      date: new Date(quickAddDate),
      type: quickAddType as "annual" | "special" | "weekend",
      description: quickAddName,
      isRecurring: false,
      applicableGroups: ["group_a", "group_b"],
    };

    createHolidayMutation.mutate(holidayData);
    
    // Reset form
    setQuickAddDate("");
    setQuickAddName("");
    setQuickAddType("annual");
  };



  // Calculate holiday statistics
  const holidayStats = {
    annual: holidays?.filter((h: Holiday) => h.type === "annual").length || 0,
    special: holidays?.filter((h: Holiday) => h.type === "special").length || 0,
    weekend: holidays?.filter((h: Holiday) => h.type === "weekend").length || 0,
    total: holidays?.length || 0,
  };

  const filteredHolidays = holidays?.filter((holiday: Holiday) => {
    if (filterType === "all") return true;
    return holiday.type === filterType;
  }) || [];

  // Export holiday report
  const exportReport = () => {
    const csvContent = [
      ["Holiday Type", "Number of Days"],
      ["Annual Holidays", holidayStats.annual],
      ["Special Holidays", holidayStats.special],
      ["Weekend Days", holidayStats.weekend],
      ["Total Holidays", holidayStats.total]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holiday-report-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holiday Management</h1>
          <p className="text-gray-600 mt-1">Manage government holidays and special dates</p>
        </div>
      </div>

      {/* Tabs for Holiday and Leave Type Management */}
      <div className="space-y-6">
          {/* Holiday Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Holiday Management</h2>
              <p className="text-sm text-gray-600">Manage government holidays and special dates</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i - 2;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[hsl(var(--gov-navy))] hover:bg-[hsl(var(--gov-navy-light))]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Holiday</DialogTitle>
                  </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Holiday Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter holiday name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Holiday Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select holiday type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="annual">Annual Holiday</SelectItem>
                                <SelectItem value="special">Special Holiday</SelectItem>
                                <SelectItem value="weekend">Weekend</SelectItem>
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
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring Holiday</FormLabel>
                            <p className="text-sm text-gray-500">
                              This holiday occurs annually
                            </p>
                          </div>
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
                            placeholder="Enter holiday description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicableGroups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicable Groups</FormLabel>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes("group_a")}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current.filter(g => g !== "group_a"), "group_a"]);
                                } else {
                                  field.onChange(current.filter(g => g !== "group_a"));
                                }
                              }}
                            />
                            <span>Group A</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value?.includes("group_b")}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current.filter(g => g !== "group_b"), "group_b"]);
                                } else {
                                  field.onChange(current.filter(g => g !== "group_b"));
                                }
                              }}
                            />
                            <span>Group B</span>
                          </div>
                        </div>
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
                      disabled={createHolidayMutation.isPending}
                    >
                      {createHolidayMutation.isPending ? "Adding..." : "Add Holiday"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>

          {/* Holiday Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Annual Holidays</p>
                <p className="text-3xl font-bold text-blue-900">{holidayStats.annual}</p>
                <p className="text-xs text-blue-600 mt-1">days added</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Special Holidays</p>
                <p className="text-3xl font-bold text-purple-900">{holidayStats.special}</p>
                <p className="text-xs text-purple-600 mt-1">days added</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Weekends</p>
                <p className="text-3xl font-bold text-green-900">{holidayStats.weekend}</p>
                <p className="text-xs text-green-600 mt-1">Saturday & Sunday</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Total Holidays</p>
                <p className="text-3xl font-bold text-orange-900">{holidayStats.total}</p>
                <p className="text-xs text-orange-600 mt-1">days total</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      </div>

      {/* Holiday List with Dates */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Holiday List ({selectedYear})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setFilterType("all")}>
              All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFilterType("annual")}>
              Annual
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFilterType("special")}>
              Special
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Add new holiday date" 
                type="date" 
                value={quickAddDate}
                onChange={(e) => setQuickAddDate(e.target.value)}
              />
              <Input 
                placeholder="Add holiday name" 
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={quickAddType} onValueChange={setQuickAddType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Holiday</SelectItem>
                  <SelectItem value="special">Special Holiday</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleQuickAdd}
                disabled={createHolidayMutation.isPending}
              >
                {createHolidayMutation.isPending ? "Adding..." : "Add Row"}
              </Button>
              <Button variant="outline" size="sm">
                Upload
              </Button>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          </div>
          
          <div className="mt-6 border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-900 w-8">No.</th>
                  <th className="text-left p-3 font-medium text-gray-900">Date</th>
                  <th className="text-left p-3 font-medium text-gray-900">Description</th>
                  <th className="text-left p-3 font-medium text-gray-900 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHolidays.length > 0 ? filteredHolidays.map((holiday: Holiday, index: number) => (
                  <tr key={holiday.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-mono">{index + 1}</td>
                    <td className="p-3 text-sm font-medium">
                      {new Date(holiday.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3 text-sm">{holiday.name}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p>No Data</p>
                      <p className="text-sm text-gray-400 mt-1">Add holidays using the form above or upload a file</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </div>
    </div>
  );
}