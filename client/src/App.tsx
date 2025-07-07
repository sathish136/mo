import { Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import EmployeeManagement from "@/components/EmployeeManagement";
import AttendanceTracker from "@/components/AttendanceTracker";
import LeaveManagement from "@/components/LeaveManagement";
import OvertimeManagement from "@/components/OvertimeManagement";
import Reports from "@/components/Reports";
import Settings from "@/components/Settings";
// Renamed from GroupPolicies to HRSettings
import HRSettings from "@/components/HRSettings";
import HolidayManagement from "@/components/HolidayManagement";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen bg-gray-50">
        <Layout>
          {/* Header with app title removed as per user request */}
          <Route path="/" component={Dashboard} />
          <Route path="/employees" component={EmployeeManagement} />
          <Route path="/attendance" component={AttendanceTracker} />
          <Route path="/leave" component={LeaveManagement} />
          <Route path="/holidays" component={HolidayManagement} />
          <Route path="/overtime" component={OvertimeManagement} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/hr-settings" component={HRSettings} />
        </Layout>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
