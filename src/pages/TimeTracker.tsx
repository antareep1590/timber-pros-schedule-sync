import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarIcon, 
  ClockIcon, 
  SearchIcon, 
  FilterIcon 
} from "lucide-react";

interface TimeLogEntry {
  id: string;
  date: string;
  name: string;
  role: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalHours: string | null;
}

const generateMockData = (): TimeLogEntry[] => {
  const mockData: TimeLogEntry[] = [];
  const today = new Date();
  
  // Generate data for the past 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Skip weekends for simplicity
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const names = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis"];
    const roles = ["Site Manager", "Crew Member"];
    
    // For each day, generate 1-4 entries
    const entriesCount = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < entriesCount; j++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      
      // Generate clock in time between 7am and 9am
      const clockInHour = 7 + Math.floor(Math.random() * 3);
      const clockInMinute = Math.floor(Math.random() * 60);
      const clockInTime = `${String(clockInHour).padStart(2, '0')}:${String(clockInMinute).padStart(2, '0')}`;
      
      // Generate clock out time between 4pm and 6pm
      const clockOutHour = 16 + Math.floor(Math.random() * 3);
      const clockOutMinute = Math.floor(Math.random() * 60);
      const clockOutTime = `${String(clockOutHour).padStart(2, '0')}:${String(clockOutMinute).padStart(2, '0')}`;
      
      // Calculate total hours
      const totalHours = (clockOutHour - clockInHour) + ((clockOutMinute - clockInMinute) / 60);
      const totalHoursFormatted = totalHours.toFixed(1);
      
      mockData.push({
        id: `${date.toISOString()}-${j}`,
        date: date.toISOString().split('T')[0],
        name,
        role,
        clockInTime,
        clockOutTime,
        totalHours: `${totalHoursFormatted} hrs`
      });
    }
  }
  
  return mockData;
};

const TimeTracker = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
  
  // New filter states
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  
  useEffect(() => {
    // Get user role and name from localStorage
    const role = localStorage.getItem("userRole") || "";
    const name = localStorage.getItem("userName") || "User";
    setUserRole(role);
    setUserName(name);
    
    // Generate mock data
    setTimeLogs(generateMockData());
    
    // Check if user is already clocked in today
    const today = new Date().toISOString().split('T')[0];
    const todayLog = JSON.parse(localStorage.getItem(`timeLog-${today}`) || "null");
    if (todayLog) {
      setClockedIn(true);
      setClockInTime(todayLog.clockInTime);
    }
  }, []);
  
  const handleClockIn = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const today = now.toISOString().split('T')[0];
    
    // Store clock in time in localStorage
    localStorage.setItem(`timeLog-${today}`, JSON.stringify({
      date: today,
      name: userName,
      role: userRole === "site-manager" ? "Site Manager" : "Crew Member",
      clockInTime: currentTime,
      clockOutTime: null
    }));
    
    setClockedIn(true);
    setClockInTime(currentTime);
    
    toast({
      title: "Clocked In",
      description: `You clocked in at ${currentTime}`,
    });
  };
  
  const handleClockOut = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const today = now.toISOString().split('T')[0];
    const todayLog = JSON.parse(localStorage.getItem(`timeLog-${today}`) || "{}");
    
    if (todayLog && clockInTime) {
      // Calculate hours worked
      const inTimeParts = clockInTime.split(':');
      const inHours = parseInt(inTimeParts[0]);
      const inMinutes = parseInt(inTimeParts[1]);
      
      const outTimeParts = currentTime.split(':');
      const outHours = parseInt(outTimeParts[0]);
      const outMinutes = parseInt(outTimeParts[1]);
      
      const totalHours = (outHours - inHours) + ((outMinutes - inMinutes) / 60);
      const totalHoursFormatted = totalHours.toFixed(1);
      
      // Update localStorage with clock out time
      todayLog.clockOutTime = currentTime;
      todayLog.totalHours = `${totalHoursFormatted} hrs`;
      localStorage.setItem(`timeLog-${today}`, JSON.stringify(todayLog));
      
      // Update timeLogs with the new entry
      const newLog: TimeLogEntry = {
        id: `${today}-new`,
        date: today,
        name: userName,
        role: userRole === "site-manager" ? "Site Manager" : "Crew Member",
        clockInTime: clockInTime,
        clockOutTime: currentTime,
        totalHours: `${totalHoursFormatted} hrs`
      };
      
      setTimeLogs([newLog, ...timeLogs]);
      setClockedIn(false);
      setClockInTime(null);
      
      toast({
        title: "Clocked Out",
        description: `You worked ${totalHoursFormatted} hours today`,
      });
    }
  };
  
  // Calculate stats
  const calculateTotalHours = () => {
    let total = 0;
    timeLogs.forEach(log => {
      if (log.totalHours) {
        const hours = parseFloat(log.totalHours.split(' ')[0]);
        if (!isNaN(hours)) {
          total += hours;
        }
      }
    });
    return total.toFixed(1);
  };
  
  const calculateAvgClockIn = () => {
    let totalMinutes = 0;
    let count = 0;
    
    timeLogs.forEach(log => {
      if (log.clockInTime) {
        const parts = log.clockInTime.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        totalMinutes += (hours * 60) + minutes;
        count++;
      }
    });
    
    if (count === 0) return "00:00";
    
    const avgMinutes = Math.round(totalMinutes / count);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    
    return `${String(avgHours).padStart(2, '0')}:${String(avgMins).padStart(2, '0')}`;
  };
  
  // Enhanced filter function
  const getFilteredLogs = () => {
    let filteredResults = timeLogs;
    
    // Base role filtering
    if (userRole !== "admin") {
      // Site Manager and Crew Member only see their own logs
      filteredResults = filteredResults.filter(log => log.name === userName);
    }
    
    // Additional filters
    if (date) {
      const selectedDate = format(date, 'yyyy-MM-dd');
      filteredResults = filteredResults.filter(log => log.date === selectedDate);
    }
    
    if (roleFilter) {
      filteredResults = filteredResults.filter(log => 
        log.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    if (searchName) {
      filteredResults = filteredResults.filter(log => 
        log.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filteredResults;
  };
  
  // Determine which card to show based on user role
  const renderCustomCard = () => {
    if (userRole === "site-manager") {
      // For Site Manager: Active Work Orders card
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Jobs Assigned This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">4</p>
          </CardContent>
        </Card>
      );
    } else if (userRole === "crew") {
      // For Crew: Jobs Today card
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Jobs Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">1</p>
          </CardContent>
        </Card>
      );
    } else {
      // For Admin (default): Use the original card
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Assigned Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">M</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">T</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">W</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">T</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">F</Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">S</Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">S</Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
  };
  
  // Filter displayed columns based on user role
  const renderTableHeaders = () => {
    return (
      <TableRow>
        <TableHead className="w-[120px] font-semibold">Date</TableHead>
        {userRole === "admin" && <TableHead className="font-semibold">Name</TableHead>}
        {userRole === "admin" && <TableHead className="font-semibold">Role</TableHead>}
        <TableHead className="font-semibold">Clock-In Time</TableHead>
        <TableHead className="font-semibold">Clock-Out Time</TableHead>
        <TableHead className="font-semibold">Total Hours</TableHead>
      </TableRow>
    );
  };
  
  const renderTableRows = () => {
    const filteredLogs = getFilteredLogs();
    
    return filteredLogs.map(log => (
      <TableRow key={log.id} className="hover:bg-gray-50">
        <TableCell className="font-medium">
          {format(parseISO(log.date), 'MMM dd, yyyy')}
        </TableCell>
        
        {userRole === "admin" && <TableCell>{log.name}</TableCell>}
        
        {userRole === "admin" && (
          <TableCell>
            <Badge variant="outline" className={`
              ${log.role === "Site Manager" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
            `}>
              {log.role}
            </Badge>
          </TableCell>
        )}
        
        <TableCell>
          <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-medium">
            {log.clockInTime}
          </span>
        </TableCell>
        
        <TableCell>
          {log.clockOutTime ? (
            <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-800 font-medium">
              {log.clockOutTime}
            </span>
          ) : "--"}
        </TableCell>
        
        <TableCell className="font-semibold">
          {log.totalHours || "--"}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-medium text-gray-700 mb-6">Time Tracker</h1>
        
        {userRole !== "admin" && (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={handleClockIn}
              disabled={clockedIn}
              className={`w-40 h-12 text-lg gap-2 ${!clockedIn ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
            >
              <ClockIcon size={20} />
              Clock In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!clockedIn}
              className={`w-40 h-12 text-lg gap-2 ${clockedIn ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-400"}`}
            >
              <ClockIcon size={20} />
              Clock Out
            </Button>
          </div>
        )}
        
        {userRole !== "admin" && clockedIn && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center justify-center text-green-700">
            <ClockIcon size={20} className="mr-2" />
            <span>You are currently clocked in since <strong>{clockInTime}</strong></span>
          </div>
        )}
        
        {/* My Stats Section */}
        {userRole !== "admin" && (
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-700 mb-4">My Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderCustomCard()}
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Hours This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{calculateTotalHours()} hrs</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Average Clock-In Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{calculateAvgClockIn()}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Role Filter - Admin only */}
            {userRole === "admin" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="Site Manager">Site Manager</SelectItem>
                    <SelectItem value="Crew Member">Crew Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Name Search - Admin only */}
            {userRole === "admin" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search by Name</label>
                <div className="relative">
                  <Input
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pr-8"
                  />
                  <SearchIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
            
            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setDate(undefined);
                  setRoleFilter("");
                  setSearchName("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Attendance Log Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              {renderTableHeaders()}
            </TableHeader>
            <TableBody>
              {renderTableRows()}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
