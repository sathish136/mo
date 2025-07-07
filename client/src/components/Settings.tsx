import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Wifi, MapPin, Plus, Edit, Trash2, RefreshCw, Activity, AlertCircle, Users, ChevronRight, Building2, Building, User, Shield } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBiometricDeviceSchema, type BiometricDevice, type InsertBiometricDevice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DeviceUser {
  uid: string;
  userId: string;
  name: string;
  role: number;
  password?: string;
  cardno?: number;
}

interface ImportUser {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  status: string;
}

export default function Settings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);
  const [companySettings, setCompanySettings] = useState({
    companyName: "WTT INTERNATIONAL",
    tagline: "Water Loving Technology",
    address: "Ministry of Finance, Colombo, Sri Lanka",
    phone: "+94 11 234 5678",
    email: "hr@wtt.gov.lk",
    website: "https://wtt.gov.lk",
    taxId: "123456789V",
    establishedYear: "2020"
  });
  const [autoSyncSettings, setAutoSyncSettings] = useState({
    enabled: false,
    interval: 30, // minutes
    lastSync: null as Date | null,
    syncOnStartup: true,
    notifications: true
  });

  // Load auto sync settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('autoSyncSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.lastSync) {
        parsed.lastSync = new Date(parsed.lastSync);
      }
      setAutoSyncSettings(parsed);
    }
  }, []);
  const [isViewUsersDialogOpen, setIsViewUsersDialogOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<BiometricDevice | null>(null);
  const [deviceUsers, setDeviceUsers] = useState<DeviceUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<DeviceUser[]>([]);
  const [importRole, setImportRole] = useState<'admin' | 'user'>('user');
  const [importGroup, setImportGroup] = useState<'group_a' | 'group_b'>('group_a');
  const [deviceInfo, setDeviceInfo] = useState<any | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: biometricDevices, isLoading } = useQuery({
    queryKey: ["/api/biometric-devices"],
    queryFn: async () => {
      const response = await fetch("/api/biometric-devices");
      if (!response.ok) throw new Error("Failed to fetch biometric devices");
      return response.json();
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (device: InsertBiometricDevice): Promise<BiometricDevice> => {
      const response = await fetch("/api/biometric-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create device" }));
        throw new Error(errorData.message || "Failed to create device");
      }
      return response.json();
    },
    onSuccess: (newDevice) => {
      queryClient.setQueryData(['/api/biometric-devices'], (oldData: BiometricDevice[] | undefined) => {
        return oldData ? [...oldData, newDevice] : [newDevice];
      });
      toast({
        title: "Success",
        description: "Biometric device added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add biometric device",
        variant: "destructive",
      });
    },
  });

  const connectDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await fetch(`/api/zk-devices/${deviceId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to connect to device");
      return response.json();
    },
    onSuccess: (data, deviceId) => {
      toast({
        title: "Connected",
        description: `Successfully connected to device ${deviceId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-devices"] });
    },
    onError: (error: any, deviceId) => {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to device ${deviceId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const disconnectDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await fetch(`/api/zk-devices/${deviceId}/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to disconnect device");
      return response.json();
    },
    onSuccess: (data, deviceId) => {
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from device ${deviceId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-devices"] });
    },
    onError: (error: any, deviceId) => {
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from device ${deviceId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getDeviceInfoMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await fetch(`/api/zk-devices/${deviceId}/info`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get device info");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setDeviceInfo(data.info);
      setIsInfoDialogOpen(true);
      toast({
        title: "Device Info Retrieved",
        description: "Successfully fetched device information.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Get Device Info",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async (device: Partial<BiometricDevice> & { id: number }) => {
      const { id, ...deviceData } = device;
      const response = await fetch(`/api/biometric-devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update device");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-devices"] });
      toast({
        title: "Success",
        description: "Biometric device updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingDevice(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device",
        variant: "destructive",
      });
    },
  });

  const getUsersMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await fetch(`/api/zk-devices/${deviceId}/users`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setDeviceUsers(data);
      setIsViewUsersDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error Fetching Users",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importUsersMutation = useMutation({
        mutationFn: async (data: { users: ImportUser[], role: 'admin' | 'user', employeeGroup: 'group_a' | 'group_b' }) => {
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import users");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Import Successful",
        description: data.message,
      });
      setIsViewUsersDialogOpen(false);
      setDeviceUsers([]);
      setSelectedUsers([]);
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const syncDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await fetch(`/api/zk-devices/${deviceId}/sync`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to sync device' }));
        throw new Error(errorData.message || 'Failed to sync device');
      }
      return response.json();
    },
    onSuccess: (data, deviceId) => {
      toast({
        title: "Sync Complete",
        description: `Synced attendance data from device ${deviceId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
    onError: (error: any, deviceId) => {
      toast({
        title: "Sync Failed",
        description: `Failed to sync data from device ${deviceId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create backup' }));
        throw new Error(errorData.message || 'Failed to create backup');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Backup Created',
        description: 'System backup has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to create system backup',
        variant: 'destructive',
      });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async ({ backupName }: { backupName: string }) => {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to restore backup' }));
        throw new Error(errorData.message || 'Failed to restore backup');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Backup Restored',
        description: 'System has been successfully restored from backup.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/backup'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Restore Failed',
        description: error.message || 'Failed to restore system from backup',
        variant: 'destructive',
      });
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to clear logs' }));
        throw new Error(errorData.message || 'Failed to clear logs');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Logs Cleared',
        description: 'System logs have been successfully cleared.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Clear Logs Failed',
        description: error.message || 'Failed to clear system logs',
        variant: 'destructive',
      });
    },
  });

  const getBackupsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/list');
      if (!response.ok) throw new Error('Failed to fetch backups');
      return response.json();
    },
    onSuccess: (data) => {
      setBackups(data.backups || []);
      setIsBackupDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Fetching Backups',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadBackupMutation = useMutation({
    mutationFn: async (backupName: string) => {
      const response = await fetch(`/api/backup/download/${backupName}`);
      if (!response.ok) throw new Error('Failed to download backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backupName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Download Started',
        description: 'Backup file download has started.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download backup file',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<InsertBiometricDevice>({
    resolver: zodResolver(insertBiometricDeviceSchema),
    defaultValues: {
      deviceId: "",
      location: "",
      ip: "",
      port: 4370,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertBiometricDevice) => {
    createDeviceMutation.mutate(data);
  };

  const editForm = useForm<InsertBiometricDevice>({
    resolver: zodResolver(insertBiometricDeviceSchema),
  });

  useEffect(() => {
    if (editingDevice) {
      editForm.reset(editingDevice);
    }
  }, [editingDevice, editForm]);

  const onEditSubmit = (data: InsertBiometricDevice) => {
    if (editingDevice) {
      updateDeviceMutation.mutate({ ...data, id: editingDevice.id });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600">Configure system settings and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/hr-settings">
                  <Button variant="outline" className="w-full justify-between h-auto p-4 border-gray-200 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">HR Settings</div>
                        <div className="text-sm text-gray-500">Configure attendance policies and working hours</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Button>
                </Link>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-600">User Management</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={companySettings.tagline}
                    onChange={(e) => setCompanySettings({...companySettings, tagline: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={companySettings.establishedYear}
                    onChange={(e) => setCompanySettings({...companySettings, establishedYear: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / Registration Number</Label>
                <Input
                  id="taxId"
                  value={companySettings.taxId}
                  onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Company Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          {/* Auto Sync Settings */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Attendance Auto Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Enable Auto Sync</Label>
                  <p className="text-sm text-gray-500">Automatically sync attendance data from biometric devices</p>
                </div>
                <Switch
                  checked={autoSyncSettings.enabled}
                  onCheckedChange={(checked) => {
                    const newSettings = {...autoSyncSettings, enabled: checked};
                    setAutoSyncSettings(newSettings);
                    // Auto-save when toggling enable/disable
                    localStorage.setItem('autoSyncSettings', JSON.stringify(newSettings));
                  }}
                />
              </div>
              
              {autoSyncSettings.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                    <Select 
                      value={autoSyncSettings.interval.toString()} 
                      onValueChange={(value) => {
                        const newSettings = {...autoSyncSettings, interval: parseInt(value)};
                        setAutoSyncSettings(newSettings);
                        localStorage.setItem('autoSyncSettings', JSON.stringify(newSettings));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sync on startup</Label>
                      <Switch
                        checked={autoSyncSettings.syncOnStartup}
                        onCheckedChange={(checked) => {
                          const newSettings = {...autoSyncSettings, syncOnStartup: checked};
                          setAutoSyncSettings(newSettings);
                          localStorage.setItem('autoSyncSettings', JSON.stringify(newSettings));
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sync notifications</Label>
                      <Switch
                        checked={autoSyncSettings.notifications}
                        onCheckedChange={(checked) => {
                          const newSettings = {...autoSyncSettings, notifications: checked};
                          setAutoSyncSettings(newSettings);
                          localStorage.setItem('autoSyncSettings', JSON.stringify(newSettings));
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium">Last Sync</p>
                        <p className="text-xs text-gray-500">
                          {autoSyncSettings.lastSync 
                            ? autoSyncSettings.lastSync.toLocaleString() 
                            : 'Never synced'
                          }
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Trigger manual sync for all devices
                          biometricDevices?.forEach(device => {
                            syncDeviceMutation.mutate(device.deviceId);
                          });
                          const newSettings = {...autoSyncSettings, lastSync: new Date()};
                          setAutoSyncSettings(newSettings);
                          localStorage.setItem('autoSyncSettings', JSON.stringify(newSettings));
                        }}
                        disabled={syncDeviceMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {syncDeviceMutation.isPending ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end">
                    <Button 
                      onClick={() => {
                        // Save auto sync settings to localStorage
                        localStorage.setItem('autoSyncSettings', JSON.stringify(autoSyncSettings));
                        toast({
                          title: "Settings Saved",
                          description: "Auto sync settings have been saved successfully.",
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Auto Sync Settings
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Biometric Devices */}
      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Biometric Devices
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Biometric Device</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ZK-DEV-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Entrance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input type="number" defaultValue="4370" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Device Active</FormLabel>
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
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        disabled={createDeviceMutation.isPending}
                      >
                        {createDeviceMutation.isPending ? "Adding..." : "Add Device"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {biometricDevices && biometricDevices.length > 0 ? (
            <div className="space-y-4">
              {biometricDevices.map((device: BiometricDevice) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${device.isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <Activity className={`w-5 h-5 ${device.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{device.deviceId}</p>
                      <p className="text-xs text-slate-600 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {device.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={device.isActive ? "default" : "secondary"} 
                           className={device.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}>
                      {device.isActive ? "Online" : "Offline"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => connectDeviceMutation.mutate(device.deviceId)}
                        disabled={connectDeviceMutation.isPending}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        title="Connect to ZK Device"
                      >
                        <Wifi className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectDeviceMutation.mutate(device.deviceId)}
                        disabled={disconnectDeviceMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        title="Disconnect from ZK Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => getDeviceInfoMutation.mutate(device.deviceId)}
                        disabled={getDeviceInfoMutation.isPending}
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        title="Get Device Info"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => syncDeviceMutation.mutate(device.deviceId)}
                        disabled={syncDeviceMutation.isPending}
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        title="Sync Attendance Data"
                      >
                        {syncDeviceMutation.isPending ? 
                          <RefreshCw className="w-4 h-4 animate-spin" /> : 
                          <RefreshCw className="w-4 h-4" />
                        }
                      </Button>
                      <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800" title="Edit Device" onClick={() => {
                        setEditingDevice(device);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setViewingDevice(device);
                          getUsersMutation.mutate(device.deviceId);
                        }}
                        disabled={getUsersMutation.isPending && getUsersMutation.variables === device.deviceId}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        title="View Employees on Device"
                      >
                        {getUsersMutation.isPending && getUsersMutation.variables === device.deviceId ? 
                          <RefreshCw className="w-4 h-4 animate-spin" /> : 
                          <Users className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No biometric devices configured</p>
              <p className="text-sm text-gray-400">Add a device to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

 
      {/* Backup & Maintenance */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Database Backup & Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-700 mb-2">Last Database Backup</p>
              <p className="text-sm text-gray-900 font-medium">
                06/07/2025 at 14:30:11
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">Database Size</p>
              <p className="text-sm text-gray-900 font-medium">45.2 MB</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => createBackupMutation.mutate()}
              disabled={createBackupMutation.isPending}
            >
              {createBackupMutation.isPending ? 'Creating...' : 'Create Database Backup'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => getBackupsMutation.mutate()}
              disabled={getBackupsMutation.isPending}
            >
              {getBackupsMutation.isPending ? 'Loading...' : 'View Backups'}
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
            >
              {clearLogsMutation.isPending ? 'Clearing...' : 'Clear System Logs'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup List Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Database Backups</DialogTitle>
            <DialogDescription>Select a backup to restore or download</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {backups.length > 0 ? (
              backups.map((backup: any) => (
                <div key={backup.name} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{backup.name}</p>
                    <p className="text-xs text-slate-600">Created: {new Date(backup.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-slate-600">Size: {backup.size}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        restoreBackupMutation.mutate({ backupName: backup.name });
                        setIsBackupDialogOpen(false);
                      }}
                      disabled={restoreBackupMutation.isPending}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        downloadBackupMutation.mutate(backup.name);
                      }}
                      disabled={downloadBackupMutation.isPending}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No backups found.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsBackupDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deviceInfo && (
        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Device Information</DialogTitle>
              <DialogDescription>
                Details for device: {deviceInfo.deviceName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {Object.entries(deviceInfo).map(([key, value]) => (
                <div className="grid grid-cols-2 items-center gap-4" key={key}>
                  <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsInfoDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Device Dialog */}
      {editingDevice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Biometric Device</DialogTitle>
              <DialogDescription>
                Update the details for {editingDevice.deviceId}.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device ID</FormLabel>
                      <FormControl>
                        <Input placeholder="ZK-DEV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Entrance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="ip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Device Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    disabled={updateDeviceMutation.isPending}
                  >
                    {updateDeviceMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Users Dialog */}
      <Dialog open={isViewUsersDialogOpen} onOpenChange={setIsViewUsersDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View & Import Users from {viewingDevice?.deviceId}</DialogTitle>
            <DialogDescription>
              Select users to import into the system. Existing users will be skipped.
            </DialogDescription>
          </DialogHeader>
          {getUsersMutation.isPending ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedUsers.length === deviceUsers.length && deviceUsers.length > 0}
                          onCheckedChange={(checked) => {
                            setSelectedUsers(checked ? deviceUsers : []);
                          }}
                        />
                      </TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(deviceUsers) && deviceUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.some(su => su.userId === user.userId)}
                            onCheckedChange={(checked) => {
                              setSelectedUsers(prev => 
                                checked ? [...prev, user] : prev.filter(su => su.userId !== user.userId)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.role === 14 ? 'Admin' : 'User'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-end pt-4">
                <div className="flex items-end space-x-4">
                  <div className="flex flex-col space-y-2">
                    <Label>Assign Role</Label>
                    <Select value={importRole} onValueChange={(value: 'admin' | 'user') => setImportRole(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Assign Group</Label>
                    <Select value={importGroup} onValueChange={(value: 'group_a' | 'group_b') => setImportGroup(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group_a">Group A</SelectItem>
                        <SelectItem value="group_b">Group B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setIsViewUsersDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      const validUsers = selectedUsers.filter(u => u.userId && u.userId.trim() !== '' && u.name && u.name.trim() !== '');

                      if (validUsers.length < selectedUsers.length) {
                        const skippedCount = selectedUsers.length - validUsers.length;
                        toast({
                          title: "Skipped Invalid Users",
                          description: `${skippedCount} user(s) were skipped due to a missing User ID or Name.`,
                          variant: "default",
                        });
                      }

                      if (validUsers.length === 0) {
                        toast({
                          title: "Import Canceled",
                          description: "No valid users to import.",
                          variant: "destructive",
                        });
                        return;
                      }

                      const usersToImport = validUsers.map(u => ({ 
                        employeeId: u.userId, 
                        fullName: u.name,
                        email: `${u.userId}@example.com`,
                        phone: '0000000000',
                        position: 'Default Position',
                        joinDate: new Date().toISOString(),
                        status: 'active',
                      }));
                      importUsersMutation.mutate({ users: usersToImport, role: importRole, employeeGroup: importGroup });
                    }}
                    disabled={selectedUsers.length === 0 || importUsersMutation.isPending}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {importUsersMutation.isPending ? 'Importing...' : `Import ${selectedUsers.length} Users`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                System Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => createBackupMutation.mutate()}
                  disabled={createBackupMutation.isPending}
                  className="h-auto p-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Create Backup</div>
                      <div className="text-sm opacity-80">Backup system data</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => getBackupsMutation.mutate()}
                  disabled={getBackupsMutation.isPending}
                  variant="outline"
                  className="h-auto p-4 border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Manage Backups</div>
                      <div className="text-sm text-gray-500">View and restore backups</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => clearLogsMutation.mutate()}
                  disabled={clearLogsMutation.isPending}
                  variant="outline"
                  className="h-auto p-4 border-red-200 hover:bg-red-50 text-red-600"
                >
                  <div className="flex items-center">
                    <Trash2 className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Clear Logs</div>
                      <div className="text-sm opacity-60">Clear system logs</div>
                    </div>
                  </div>
                </Button>
                
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <AlertCircle className="w-5 h-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-600">Database Tools</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Management Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Management</DialogTitle>
            <DialogDescription>Manage your system backups</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {backups.length === 0 ? (
              <p className="text-sm text-gray-500">No backups found.</p>
            ) : (
              backups.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{backup.name}</p>
                    <p className="text-xs text-gray-500">{backup.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackupMutation.mutate(backup.name)}
                      disabled={downloadBackupMutation.isPending}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => restoreBackupMutation.mutate({ backupName: backup.name })}
                      disabled={restoreBackupMutation.isPending}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
