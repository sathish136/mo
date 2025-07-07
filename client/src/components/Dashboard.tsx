import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, UserCheck, CalendarX, Clock, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });



  const { data: recentActivities, isLoading: activitiesLoading } = useQuery<any[]>({ 
    queryKey: ["/api/dashboard/recent-activity"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/recent-activity");
      if (!response.ok) throw new Error("Failed to fetch recent activities");
      return response.json();
    },
  });

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-1">Ministry of Finance Sri Lanka - Attendance Management</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-blue-100">Total Employees</p>
                <p className="text-3xl font-bold mt-1">{stats?.totalEmployees || 0}</p>
                <p className="text-xs text-blue-200 mt-1">Active workforce</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-green-100">Present Today</p>
                <p className="text-3xl font-bold mt-1">{stats?.presentToday || 0}</p>
                <p className="text-xs text-green-200 mt-1">
                  {stats?.totalEmployees ? 
                    `${((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)}% attendance rate` : 
                    "Currently working"
                  }
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-orange-100">On Leave</p>
                <p className="text-3xl font-bold mt-1">{stats?.onLeave || 0}</p>
                <p className="text-xs text-orange-200 mt-1">
                  {stats?.totalEmployees ? 
                    `${((stats.onLeave / stats.totalEmployees) * 100).toFixed(1)}% of workforce` : 
                    "Approved absences"
                  }
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CalendarX className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-purple-100">Overtime Hours</p>
                <p className="text-3xl font-bold mt-1">{stats?.overtimeHours || 0}h</p>
                <p className="text-xs text-purple-200 mt-1">This month</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <Card className="lg:col-span-2 border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Attendance Overview</CardTitle>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart Component</p>
                <p className="text-sm text-gray-500">Attendance trends visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "check-in" ? "bg-green-500" :
                    activity.type === "leave" ? "bg-blue-500" :
                    activity.type === "overtime" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`} />
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/attendance">
              <Button variant="ghost" className="w-full mt-4 text-sm text-[hsl(var(--gov-navy))] hover:text-[hsl(var(--gov-navy-light))] ">
                View All Activities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
