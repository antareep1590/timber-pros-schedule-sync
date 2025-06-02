import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  format, parseISO, isWithinInterval, 
  startOfDay, endOfDay, differenceInMinutes,
  addDays 
} from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
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
  FilterIcon,
  Briefcase 
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import type { DateRange } from "react-day-picker";

interface TimeLogEntry {
  id: string;
  date: string;
  name: string;
  role: string;
  clockInTime: string;
  clockOutTime: string | null;
  timeLogged: string | null;
  jobName: string;
  workOrderId: string;
  location: string;
}

interface JobOption {
  value: string;
  label: string;
  workOrderId: string;
  location: string;
}

const generateMockJobs = (): JobOption[] => {
  return [
    { value: "roof-repair", label: "Roof Repair", workOrderId: "WO-2025-001", location: "123 Main St" },
    { value: "window-install", label: "Window Installation", workOrderId: "WO-2025-002", location: "456 Oak Ave" },
    { value: "siding-replace", label: "Siding Replacement", workOrderId: "WO-2025-003", location: "789 Pine Rd" },
    { value: "gutter-clean", label: "Gutter Cleaning", workOrderId: "WO-2025-004", location: "321 Elm St" },
    { value: "deck-build", label: "Deck Construction", workOrderId: "WO-2025-005", location: "654 Maple Dr" },
  ];
};

const generateMockData = (): TimeLogEntry[] => {
  const mockData: TimeLogEntry[] = [];
  const today = new Date();
  const jobs = generateMockJobs();
  
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
      const totalMinutes = ((clockOutHour - clockInHour) * 60) + (clockOutMinute - clockInMinute);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeLogged = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // Assign random job
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      
      mockData.push({
        id: `${date.toISOString()}-${j}`,
        date: date.toISOString().split('T')[0],
        name,
        role,
        clockInTime,
        clockOutTime,
        timeLogged,
        jobName: randomJob.label,
        workOrderId: randomJob.workOrderId,
        location: randomJob.location
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
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [jobCommandOpen, setJobCommandOpen] = useState(false);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  
  // New filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [jobFilter, setJobFilter] = useState<string>("all-jobs");
  const [roleFilter, setRoleFilter] = useState<string>("all-roles");
  const [searchName, setSearchName] = useState<string>("");
  
  useEffect(() => {
    // Get user role and name from localStorage
    const role = localStorage.getItem("userRole") || "";
    const name = localStorage.getItem("userName") || "User";
    setUserRole(role);
    setUserName(name);
    
    // Set up job options
    setJobs(generateMockJobs());
    
    // Generate mock data
    setTimeLogs(generateMockData());
    
    // Check if user is already clocked in today
    const today = new Date().toISOString().split('T')[0];
    const todayLog = JSON.parse(localStorage.getItem(`timeLog-${today}`) || "null");
    if (todayLog) {
      setClockedIn(true);
      setClockInTime(todayLog.clockInTime);
      
      // Also restore selected job if available
      if (todayLog.jobId) {
        const jobOption = generateMockJobs().find(job => job.value === todayLog.jobId);
        if (jobOption) {
          setSelectedJob(jobOption);
        }
      }
    }
  }, []);
  
  const handleClockIn = () => {
    if (!selectedJob) {
      toast({
        title: "Job Selection Required",
        description: "Please select a job before clocking in",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const today = now.toISOString().split('T')[0];
    
    // Store clock in time and job info in localStorage
    localStorage.setItem(`timeLog-${today}`, JSON.stringify({
      date: today,
      name: userName,
      role: userRole === "site-manager" ? "Site Manager" : "Crew Member",
      clockInTime: currentTime,
      clockOutTime: null,
      jobId: selectedJob.value,
      jobName: selectedJob.label,
      workOrderId: selectedJob.workOrderId,
      location: selectedJob.location
    }));
    
    setClockedIn(true);
    setClockInTime(currentTime);
    
    toast({
      title: "Clocked In",
      description: `You clocked in at ${currentTime} for ${selectedJob.label}`,
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
    
    if (todayLog && clockInTime && selectedJob) {
      // Calculate hours worked
      const inTimeParts = clockInTime.split(':');
      const inHours = parseInt(inTimeParts[0]);
      const inMinutes = parseInt(inTimeParts[1]);
      
      const outTimeParts = currentTime.split(':');
      const outHours = parseInt(outTimeParts[0]);
      const outMinutes = parseInt(outTimeParts[1]);
      
      const totalMinutes = ((outHours - inHours) * 60) + (outMinutes - inMinutes);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeLogged = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // Update localStorage with clock out time
      todayLog.clockOutTime = currentTime;
      todayLog.timeLogged = timeLogged;
      localStorage.setItem(`timeLog-${today}`, JSON.stringify(todayLog));
      
      // Update timeLogs with the new entry
      const newLog: TimeLogEntry = {
        id: `${today}-new`,
        date: today,
        name: userName,
        role: userRole === "site-manager" ? "Site Manager" : "Crew Member",
        clockInTime: clockInTime,
        clockOutTime: currentTime,
        timeLogged: timeLogged,
        jobName: selectedJob.label,
        workOrderId: selectedJob.workOrderId,
        location: selectedJob.location
      };
      
      setTimeLogs([newLog, ...timeLogs]);
      setClockedIn(false);
      setClockInTime(null);
      setSelectedJob(null);
      
      toast({
        title: "Clocked Out",
        description: `You worked ${timeLogged} hours today`,
      });
    }
  };
  
  // Calculate stats
  const calculateTotalHours = (logs: TimeLogEntry[]) => {
    let totalMinutes = 0;
    logs.forEach(log => {
      if (log.timeLogged) {
        const [hours, minutes] = log.timeLogged.split(':').map(Number);
        totalMinutes += (hours * 60) + minutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
    
    // Date range filter - updated to handle proper DateRange type
    if (dateRange?.from && dateRange?.to) {
      filteredResults = filteredResults.filter(log => {
        const logDate = parseISO(log.date);
        return isWithinInterval(logDate, {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!)
        });
      });
    }
    
    // Job filter
    if (jobFilter && jobFilter !== "all-jobs") {
      filteredResults = filteredResults.filter(log => 
        log.jobName.toLowerCase() === jobFilter.toLowerCase()
      );
    }
    
    // Role filter (admin only)
    if (roleFilter && roleFilter !== "all-roles" && userRole === "admin") {
      filteredResults = filteredResults.filter(log => 
        log.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    // Name search (admin only)
    if (searchName && userRole === "admin") {
      filteredResults = filteredResults.filter(log => 
        log.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filteredResults;
  };
  
  // Determine which card to show based on user role
  const renderCustomCard = () => {
    if (userRole === "site-manager") {
      // For Site Manager: Active Jobs card
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">4</p>
          </CardContent>
        </Card>
      );
    } else if (userRole === "crew") {
      // For Crew: Active Jobs card
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Jobs</CardTitle>
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
        <TableHead className="font-semibold">Job Name (Work Order #)</TableHead>
        <TableHead className="font-semibold">Location</TableHead>
        <TableHead className="font-semibold">Clock-In Time</TableHead>
        <TableHead className="font-semibold">Clock-Out Time</TableHead>
        <TableHead className="font-semibold">Time Logged (hh:mm)</TableHead>
        {userRole === "admin" && <TableHead className="font-semibold text-right">Total Time Logged</TableHead>}
      </TableRow>
    );
  };
  
  const renderTableRows = () => {
    const filteredLogs = getFilteredLogs();
    let dailyTimeLogged: Record<string, number> = {};
    
    return filteredLogs.map(log => {
      // Calculate daily totals for admin
      if (userRole === "admin" && log.timeLogged) {
        const [hours, minutes] = log.timeLogged.split(':').map(Number);
        const totalMinutes = (hours * 60) + minutes;
        
        if (!dailyTimeLogged[log.date]) {
          dailyTimeLogged[log.date] = 0;
        }
        dailyTimeLogged[log.date] += totalMinutes;
      }
      
      return (
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
            <div className="flex flex-col">
              <span>{log.jobName}</span>
              <span className="text-xs text-gray-500">{log.workOrderId}</span>
            </div>
          </TableCell>
          
          <TableCell>{log.location}</TableCell>
          
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
            {log.timeLogged || "--"}
          </TableCell>
          
          {userRole === "admin" && (
            <TableCell className="text-right">
              {dailyTimeLogged[log.date] ? (
                `${Math.floor(dailyTimeLogged[log.date] / 60)}:${String(dailyTimeLogged[log.date] % 60).padStart(2, '0')}`
              ) : "--"}
            </TableCell>
          )}
        </TableRow>
      );
    });
  };
  
  // Calculate total time logged for all visible entries
  const calculateTotalTimeForVisibleEntries = () => {
    const filteredLogs = getFilteredLogs();
    return calculateTotalHours(filteredLogs);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-medium text-gray-700 mb-6">Time Tracker</h1>
        
        {userRole !== "admin" && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Clock In/Out</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Job</label>
                <Popover open={jobCommandOpen} onOpenChange={setJobCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={jobCommandOpen}
                      disabled={clockedIn}
                      className="w-full justify-between"
                    >
                      {selectedJob ? selectedJob.label : "Select job..."}
                      <Briefcase className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search job..." />
                      <CommandEmpty>No job found.</CommandEmpty>
                      <CommandGroup>
                        {jobs.map((job) => (
                          <CommandItem
                            key={job.value}
                            value={job.value}
                            onSelect={() => {
                              setSelectedJob(job);
                              setJobCommandOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span>{job.label}</span>
                              <span className="text-xs text-gray-500">{job.workOrderId} - {job.location}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-end gap-2 md:col-span-2">
                <Button
                  onClick={handleClockIn}
                  disabled={clockedIn || !selectedJob}
                  className={`flex-1 h-10 gap-2 ${!clockedIn ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
                >
                  <ClockIcon size={18} />
                  Clock In
                </Button>
                <Button
                  onClick={handleClockOut}
                  disabled={!clockedIn}
                  className={`flex-1 h-10 gap-2 ${clockedIn ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-400"}`}
                >
                  <ClockIcon size={18} />
                  Clock Out
                </Button>
              </div>
            </div>
            
            {clockedIn && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon size={20} className="text-green-700 mr-2" />
                  <span className="text-green-700">
                    You are currently clocked in since <strong>{clockInTime}</strong>
                  </span>
                </div>
                <div className="text-sm bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">{selectedJob?.label}</span>
                  <span className="text-gray-600"> ({selectedJob?.workOrderId})</span>
                </div>
              </div>
            )}
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
                  <p className="text-2xl font-semibold">{calculateTotalHours(timeLogs)}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter - Fixed */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Job Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Job</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    {jobFilter !== "all-jobs" 
                      ? jobs.find(j => j.label.toLowerCase() === jobFilter.toLowerCase())?.label || "All Jobs"
                      : "All Jobs"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search job..." />
                    <CommandEmpty>No job found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem onSelect={() => setJobFilter("all-jobs")}>
                        All Jobs
                      </CommandItem>
                      {jobs.map((job) => (
                        <CommandItem
                          key={job.value}
                          onSelect={() => setJobFilter(job.label)}
                        >
                          <div className="flex flex-col">
                            <span>{job.label}</span>
                            <span className="text-xs text-gray-500">{job.workOrderId}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Role Filter - Admin only */}
            {userRole === "admin" ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles">All Roles</SelectItem>
                    <SelectItem value="Site Manager">Site Manager</SelectItem>
                    <SelectItem value="Crew Member">Crew Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setDateRange(undefined);
                    setJobFilter("all-jobs");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          
          {/* Second row of filters - Admin only */}
          {userRole === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              <div className="md:col-span-2 flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setDateRange(undefined);
                    setJobFilter("all-jobs");
                    setRoleFilter("all-roles");
                    setSearchName("");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
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
            {userRole !== "admin" && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">Total Time Logged:</TableCell>
                  <TableCell colSpan={3} className="font-bold">{calculateTotalTimeForVisibleEntries()}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
