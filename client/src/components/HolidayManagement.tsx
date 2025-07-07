import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, type: 'Annual Holidays', days: 21 },
    { id: 2, type: 'Special Holidays', days: 24 }
  ]);
  const [newHolidayType, setNewHolidayType] = useState('');
  const [newHolidayDays, setNewHolidayDays] = useState('');
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [editHolidayType, setEditHolidayType] = useState('');
  const [editHolidayDays, setEditHolidayDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch holidays data if needed
    // This is a placeholder for API call
  }, []);

  const addHoliday = () => {
    if (!newHolidayType || !newHolidayDays) {
      setError('Please fill in all fields');
      return;
    }
    const newHoliday = {
      id: holidays.length + 1,
      type: newHolidayType,
      days: parseInt(newHolidayDays)
    };
    setHolidays([...holidays, newHoliday]);
    setNewHolidayType('');
    setNewHolidayDays('');
    setError(null);
  };

  const updateHoliday = () => {
    if (!editHolidayType || !editHolidayDays) {
      setError('Please fill in all fields');
      return;
    }
    if (editingHoliday) {
      const updatedHolidays = holidays.map(h => 
        h.id === editingHoliday.id 
          ? { ...h, type: editHolidayType, days: parseInt(editHolidayDays) } 
          : h
      );
      setHolidays(updatedHolidays);
      setEditingHoliday(null);
      setEditHolidayType('');
      setEditHolidayDays('');
      setError(null);
    }
  };

  const removeHoliday = (id: number) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

  const saveHolidays = async () => {
    setIsLoading(true);
    try {
      // Placeholder for API call to save holidays
      setTimeout(() => {
        setIsLoading(false);
        // Notification can be added here
      }, 1000);
    } catch (err) {
      setError('Failed to save holidays');
      setIsLoading(false);
    }
  };

  const totalDays = holidays.reduce((sum, holiday) => sum + holiday.days, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Holiday Management</h2>
          <p className="text-sm text-gray-600">Manage holiday allocations and view summary</p>
        </div>
      </div>

      {/* Holiday Summary Report */}
      <Card className="border border-gray-200 shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Holiday Summary Report</CardTitle>
          <CardDescription className="text-gray-600">Overview of holiday allocations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Holiday Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Number of Days</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map(holiday => (
                  <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holiday.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holiday.days}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditingHoliday(holiday);
                            setEditHolidayType(holiday.type);
                            setEditHolidayDays(holiday.days.toString());
                          }}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeHoliday(holiday.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Holidays</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holidays.reduce((total, holiday) => total + holiday.days, 0)}</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Holiday Management Form */}
      <Card className="shadow-md border border-gray-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-3 bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="text-xl text-center text-gray-900 font-semibold">Add New Holiday Type</CardTitle>
          <CardDescription className="text-center text-gray-600">Configure new holiday types and their allocated days</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {error && <div className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-md text-center">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="holiday-type" className="text-gray-700 font-medium">Holiday Type</Label>
                <Input
                  id="holiday-type"
                  placeholder="e.g., Casual Leave"
                  value={newHolidayType}
                  onChange={(e) => setNewHolidayType(e.target.value)}
                  className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="holiday-days" className="text-gray-700 font-medium">Number of Days</Label>
                <Input
                  id="holiday-days"
                  type="number"
                  placeholder="e.g., 10"
                  value={newHolidayDays}
                  onChange={(e) => setNewHolidayDays(e.target.value)}
                  className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={addHoliday} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <Plus size={18} className="mr-2" /> Add Holiday
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Holiday Modal */}
      {editingHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Holiday</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-holiday-type" className="text-gray-700 font-medium">Holiday Type</Label>
                <Input
                  id="edit-holiday-type"
                  value={editHolidayType}
                  onChange={(e) => setEditHolidayType(e.target.value)}
                  className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-holiday-days" className="text-gray-700 font-medium">Number of Days</Label>
                <Input
                  id="edit-holiday-days"
                  type="number"
                  value={editHolidayDays}
                  onChange={(e) => setEditHolidayDays(e.target.value)}
                  className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingHoliday(null);
                    setEditHolidayType('');
                    setEditHolidayDays('');
                  }}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateHoliday}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end max-w-3xl mx-auto">
        <Button 
          onClick={saveHolidays} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md px-6 py-2"
        >
          {isLoading ? "Saving..." : "Save Holiday Settings"}
        </Button>
      </div>
    </div>
  );
};

export default HolidayManagement;
