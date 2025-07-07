import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Building, ChartLine, Users, Clock, Calendar, Watch, ChartBar, Settings, User, Bell, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Employee Master", href: "/employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Leave Management", href: "/leave", icon: Calendar },
  { name: "Leave & Holiday", href: "/holidays", icon: Calendar },
  { name: "Overtime", href: "/overtime", icon: Watch },
  { name: "Reports", href: "/reports", icon: ChartBar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "WTT INTERNATIONAL",
    tagline: "Water Loving Technology"
  });
  const { toast } = useToast();

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        
        toast({
          title: "Success",
          description: "Logged out successfully",
        });

        // Redirect to login page
        setLocation("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Load company settings for sidebar
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch("/api/company-settings");
        if (response.ok) {
          const data = await response.json();
          setCompanyInfo({
            companyName: data.companyName || "WTT INTERNATIONAL",
            tagline: data.tagline || "Water Loving Technology"
          });
        }
      } catch (error) {
        console.error("Failed to fetch company settings for sidebar:", error);
      }
    };

    fetchCompanySettings();
    
    // Listen for company settings updates
    const handleCompanyUpdate = () => {
      fetchCompanySettings();
    };
    
    // Custom event listener for real-time updates
    window.addEventListener('companySettingsUpdated', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('companySettingsUpdated', handleCompanyUpdate);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 shadow-xl flex flex-col border-r border-slate-800">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">{companyInfo.companyName}</h1>
              <p className="text-slate-300 text-xs">{companyInfo.tagline}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start space-x-3 h-12 transition-all duration-200 ${
                    isActive 
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md" 
                      : "text-slate-300 hover:text-white hover:bg-slate-800 hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 bg-amber-500 shadow-md">
                <AvatarFallback className="bg-amber-500 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-slate-300 text-xs">HR Manager</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">HR Attendance Management System</h1>
                <p className="text-sm text-slate-600">Welcome back, Admin User</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <UserCircle className="w-6 h-6" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
