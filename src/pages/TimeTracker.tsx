
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ClockIcon } from "lucide-react";

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
  
  // Filter logs based on user role
  const getFilteredLogs = () => {
    if (userRole === "admin") {
      // Admin sees all logs
      return timeLogs;
    } else {
      // Site Manager and Crew Member only see their own logs
      return timeLogs.filter(log => log.name === userName);
    }
  };
  
  // Filter displayed columns based on user role
  const renderTableHeaders = () => {
    return (
      <TableRow>
        <TableHead>Date</TableHead>
        {userRole === "admin" && <TableHead>Name</TableHead>}
        {userRole === "admin" && <TableHead>Role</TableHead>}
        <TableHead>Clock-In Time</TableHead>
        <TableHead>Clock-Out Time</TableHead>
        <TableHead>Total Hours</TableHead>
      </TableRow>
    );
  };
  
  const renderTableRows = () => {
    const filteredLogs = getFilteredLogs();
    
    return filteredLogs.map(log => (
      <TableRow key={log.id}>
        <TableCell>{format(parseISO(log.date), 'MMM dd, yyyy')}</TableCell>
        {userRole === "admin" && <TableCell>{log.name}</TableCell>}
        {userRole === "admin" && <TableCell>{log.role}</TableCell>}
        <TableCell>{log.clockInTime}</TableCell>
        <TableCell>{log.clockOutTime || "--"}</TableCell>
        <TableCell>{log.totalHours || "--"}</TableCell>
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
