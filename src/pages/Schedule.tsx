
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobModal from "@/components/JobModal";
import Navbar from "@/components/Navbar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";

// Job type definition
interface Job {
  id: string;
  workOrderId: string | string[];
  name: string;
  date: string;
  description: string;
  startTime: string;
  endTime: string;
  clientName: string;
  siteAddress: string;
  siteManager: string;
  crewMembers: string[];
  completed: boolean;
  rescheduled: boolean;
  cancelled: boolean;
  status?: string;
  notes?: string;
}

// Generate mock data for site managers and crew members
const generateSiteManagers = (count: number) => {
  return Array.from({ length: count }, (_, i) => `Site Manager ${i + 1}`);
};

const generateCrewMembers = (count: number) => {
  return Array.from({ length: count }, (_, i) => `Crew Member ${i + 1}`);
};

// Generate more comprehensive mock job data
const generateMockJobs = () => {
  const mockJobs: Job[] = [
    {
      id: "1",
      workOrderId: "12",
      name: "Tree Removal",
      date: "2025-05-02",
      description: "Remove large oak tree from front yard",
      startTime: "10:00",
      endTime: "17:00",
      clientName: "Client A",
      siteAddress: "123 Street Auburn,US,21311",
      siteManager: "Site Manager 1",
      crewMembers: ["Crew Member 1", "Crew Member 2"],
      completed: false,
      rescheduled: false,
      cancelled: false
    },
    {
      id: "2",
      workOrderId: "15",
      name: "Stump Grinding",
      date: "2025-05-04",
      description: "Grind stumps in backyard",
      startTime: "10:00",
      endTime: "17:00",
      clientName: "Client B",
      siteAddress: "456 Avenue Auburn,US,21311",
      siteManager: "Site Manager 2",
      crewMembers: ["Crew Member 3", "Crew Member 4"],
      completed: false,
      rescheduled: false,
      cancelled: false
    },
    {
      id: "3",
      workOrderId: "18",
      name: "Lawn Mowing",
      date: "2025-05-10",
      description: "Regular lawn maintenance",
      startTime: "09:00",
      endTime: "12:00",
      clientName: "Client C",
      siteAddress: "789 Boulevard Auburn,US,21311",
      siteManager: "Site Manager 1",
      crewMembers: ["Crew Member 1", "Crew Member 5"],
      completed: true,
      rescheduled: false,
      cancelled: false
    },
    {
      id: "4",
      workOrderId: "22",
      name: "Hedge Trimming",
      date: "2025-05-15",
      description: "Trim hedges and shape bushes",
      startTime: "13:00",
      endTime: "16:00",
      clientName: "Client D",
      siteAddress: "101 Circle Auburn,US,21311",
      siteManager: "Site Manager 3",
      crewMembers: ["Crew Member 2", "Crew Member 3"],
      completed: false,
      rescheduled: true,
      cancelled: false
    },
    {
      id: "5",
      workOrderId: "25",
      name: "Garden Planting",
      date: "2025-05-20",
      description: "Plant seasonal flowers and shrubs",
      startTime: "08:00",
      endTime: "15:00",
      clientName: "Client E",
      siteAddress: "202 Drive Auburn,US,21311",
      siteManager: "Site Manager 2",
      crewMembers: ["Crew Member 4", "Crew Member 5"],
      completed: false,
      rescheduled: false,
      cancelled: false
    }
  ];
  
  return mockJobs;
};

// Calendar view type
type CalendarView = "monthly" | "weekly" | "daily";

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [jobs, setJobs] = useState<Job[]>(generateMockJobs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterSiteManagers, setFilterSiteManagers] = useState<string[]>([]);
  const [filterCrewMembers, setFilterCrewMembers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [calendarView, setCalendarView] = useState<CalendarView>("weekly");

  // Add state for collapsible panel with toggling based on role
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "";
    const name = localStorage.getItem("userName") || "";
    setUserRole(role);
    setUserName(name);
  }, []);

  // Get date range based on current view
  const getDateRange = () => {
    if (calendarView === "monthly") {
      const firstDayOfMonth = startOfMonth(currentDate);
      const lastDayOfMonth = endOfMonth(currentDate);
      return eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    } else if (calendarView === "weekly") {
      const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
      const lastDayOfWeek = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
    } else {
      // Daily view just returns a single day
      return [currentDate];
    }
  };

  const handlePrevious = () => {
    if (calendarView === "monthly") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (calendarView === "weekly") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (calendarView === "monthly") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (calendarView === "weekly") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleDateClick = (date: Date) => {
    if (userRole === "crew") {
      // Crew members can't create new jobs
      return;
    }
    
    setSelectedDate(date);
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setSelectedDate(parseISO(job.date));
    setIsModalOpen(true);
  };

  const handleSaveJob = (job: Job) => {
    if (userRole === "crew") {
      // Crew members can't edit jobs
      return;
    }
    
    if (selectedJob) {
      // Edit existing job
      setJobs(jobs.map(j => j.id === job.id ? job : j));
    } else {
      // Add new job
      const newJob = {
        ...job,
        id: Math.random().toString(36).substr(2, 9)
      };
      setJobs([...jobs, newJob]);
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleToggleSiteManager = (siteManager: string) => {
    if (filterSiteManagers.includes(siteManager)) {
      setFilterSiteManagers(filterSiteManagers.filter(sm => sm !== siteManager));
    } else {
      setFilterSiteManagers([...filterSiteManagers, siteManager]);
    }
  };

  const handleToggleCrewMember = (crewMember: string) => {
    if (filterCrewMembers.includes(crewMember)) {
      setFilterCrewMembers(filterCrewMembers.filter(cm => cm !== crewMember));
    } else {
      setFilterCrewMembers([...filterCrewMembers, crewMember]);
    }
  };

  // Filter jobs based on user role
  const getFilteredJobs = () => {
    let filteredResults = jobs;
    
    // First filter by site manager and crew member if selected and user is admin
    if (userRole === "admin" && (filterSiteManagers.length > 0 || filterCrewMembers.length > 0)) {
      filteredResults = filteredResults.filter(job => {
        // Filter by site manager if any are selected
        const siteManagerMatch = filterSiteManagers.length === 0 || 
          (typeof job.siteManager === 'string' && filterSiteManagers.includes(job.siteManager));
        
        // Filter by crew member if any are selected
        const crewMemberMatch = filterCrewMembers.length === 0 || 
          job.crewMembers.some(cm => filterCrewMembers.includes(cm));
        
        return siteManagerMatch && crewMemberMatch;
      });
    }
    
    // Then filter based on user role
    if (userRole === "crew") {
      // Crew members only see jobs assigned to them
      return filteredResults.filter(job => job.crewMembers.includes(userName));
    } else if (userRole === "site-manager") {
      // Site managers see jobs they are assigned to
      return filteredResults.filter(job => job.siteManager === userName);
    }
    
    // Admins see all jobs (with optional filters applied above)
    return filteredResults;
  };

  const getJobsForDate = (date: Date) => {
    return getFilteredJobs().filter(job => isSameDay(parseISO(job.date), date));
  };

  // Calculate the title for the current view
  const getViewTitle = () => {
    if (calendarView === "monthly") {
      return format(currentDate, 'MMMM yyyy').toUpperCase();
    } else if (calendarView === "weekly") {
      const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
      const startMonth = format(startDate, 'MMM');
      const endMonth = format(endDate, 'MMM');
      const startDay = format(startDate, 'd');
      const endDay = format(endDate, 'd');
      const year = format(currentDate, 'yyyy');
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`.toUpperCase();
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`.toUpperCase();
      }
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy').toUpperCase();
    }
  };

  // Generate 10 site managers and 10 crew members
  const siteManagers = generateSiteManagers(10);
  const crewMembers = generateCrewMembers(10);

  // Render monthly calendar
  const renderMonthlyCalendar = () => {
    const daysInMonth = getDateRange();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="text-center font-medium py-2 border-b text-gray-600 text-sm">
            {day}
          </div>
        ))}

        {/* Days */}
        {daysInMonth.map((day, index) => {
          const dayJobs = getJobsForDate(day);
          
          return (
            <div 
              key={index}
              className={cn(
                "min-h-[100px] border p-1",
                isSameMonth(day, currentDate) ? "bg-white" : "bg-gray-50",
                isSameDay(day, new Date()) ? "border-primary" : "border-gray-200",
                userRole !== "crew" ? "cursor-pointer" : ""
              )}
              onClick={() => handleDateClick(day)}
            >
              <div className="text-right mb-1">
                <span 
                  className={cn(
                    "inline-block w-6 h-6 rounded-full text-sm flex items-center justify-center",
                    isSameDay(day, new Date()) ? "bg-primary text-white" : "text-gray-700"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[70px]">
                {dayJobs.map((job) => (
                  <Tooltip key={job.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          job.completed ? "bg-green-100 text-green-800" : 
                          job.cancelled ? "bg-red-100 text-red-800" : 
                          job.rescheduled ? "bg-yellow-100 text-yellow-800" :
                          "bg-blue-100 text-blue-800"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                      >
                        {job.name} - {job.startTime}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white p-2 shadow-md border rounded-md z-50">
                      <p className="font-medium">{job.name}</p>
                      <p className="text-xs text-gray-600">{job.clientName}</p>
                      <p className="text-xs text-gray-600">{job.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render weekly calendar
  const renderWeeklyCalendar = () => {
    const daysInWeek = getDateRange();
    
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-7 border-b">
          {['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'].map((day, index) => (
            <div 
              key={day} 
              className={cn(
                "text-center font-medium py-3 px-2",
                isSameDay(daysInWeek[index], new Date()) ? "bg-primary/10" : ""
              )}
            >
              <div className="text-gray-600 text-sm">{day}</div>
              <div 
                className={cn(
                  "mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                  isSameDay(daysInWeek[index], new Date()) ? "bg-primary text-white" : "text-gray-700"
                )}
              >
                {format(daysInWeek[index], 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[500px] border-b">
          {daysInWeek.map((day, index) => {
            const dayJobs = getJobsForDate(day);
            
            return (
              <div 
                key={index}
                className={cn(
                  "border-r last:border-r-0 p-1",
                  isSameDay(day, new Date()) ? "bg-primary/5" : "",
                  userRole !== "crew" ? "cursor-pointer" : ""
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className="space-y-1 overflow-y-auto">
                  {dayJobs.map((job) => (
                    <Tooltip key={job.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "text-xs p-2 rounded mb-1 cursor-pointer",
                            job.completed ? "bg-green-100 text-green-800" : 
                            job.cancelled ? "bg-red-100 text-red-800" : 
                            job.rescheduled ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job);
                          }}
                        >
                          <div className="font-medium">{job.name}</div>
                          <div>{job.startTime} - {job.endTime}</div>
                          <div className="text-xs mt-1 opacity-80">{job.clientName}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white p-2 shadow-md border rounded-md z-50">
                        <p className="font-medium">{job.name}</p>
                        <p className="text-xs text-gray-600">{job.clientName}</p>
                        <p className="text-xs text-gray-600">{job.description}</p>
                        <p className="text-xs text-gray-600 mt-1">{job.siteAddress}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render daily calendar
  const renderDailyCalendar = () => {
    const dayJobs = getJobsForDate(currentDate);
    const hourBlocks = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm
    
    return (
      <div className="flex flex-col">
        <div className="border-b py-2 text-center font-medium">
          <span 
            className={cn(
              "inline-block w-8 h-8 rounded-full text-sm flex items-center justify-center mx-auto mb-1",
              isSameDay(currentDate, new Date()) ? "bg-primary text-white" : "bg-gray-100"
            )}
          >
            {format(currentDate, 'd')}
          </span>
          <div>{format(currentDate, 'EEEE')}</div>
        </div>
        
        <div className="flex flex-col border-b min-h-[600px]">
          {hourBlocks.map((hour) => {
            // Filter jobs that occur during this hour
            const hourJobs = dayJobs.filter(job => {
              const startHour = parseInt(job.startTime.split(':')[0]);
              const endHour = parseInt(job.endTime.split(':')[0]);
              return startHour <= hour && endHour > hour;
            });
            
            return (
              <div 
                key={hour}
                className={cn(
                  "flex border-t py-2 min-h-[60px]",
                  userRole !== "crew" ? "cursor-pointer" : ""
                )}
                onClick={() => {
                  if (userRole !== "crew") {
                    const newDate = new Date(currentDate);
                    newDate.setHours(hour, 0, 0);
                    handleDateClick(newDate);
                  }
                }}
              >
                <div className="w-16 text-right pr-2 font-medium text-gray-500">
                  {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
                </div>
                <div className="flex-1 pl-4 border-l">
                  {hourJobs.map((job) => (
                    <Tooltip key={job.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "text-sm p-2 rounded mb-1 cursor-pointer",
                            job.completed ? "bg-green-100 text-green-800" : 
                            job.cancelled ? "bg-red-100 text-red-800" : 
                            job.rescheduled ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job);
                          }}
                        >
                          <div className="font-medium">{job.name}</div>
                          <div>{job.startTime} - {job.endTime}</div>
                          <div className="text-xs mt-1 opacity-80">{job.clientName}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white p-2 shadow-md border rounded-md z-50 w-64">
                        <p className="font-medium">{job.name}</p>
                        <p className="text-xs text-gray-600">{job.clientName}</p>
                        <p className="text-xs text-gray-600">{job.description}</p>
                        <p className="text-xs text-gray-600 mt-1">{job.siteAddress}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render appropriate calendar view based on current selection
  const renderCalendar = () => {
    switch (calendarView) {
      case "monthly":
        return renderMonthlyCalendar();
      case "weekly":
        return renderWeeklyCalendar();
      case "daily":
        return renderDailyCalendar();
      default:
        return renderWeeklyCalendar();
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-medium mb-6 text-gray-800">Schedule</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar Section */}
            <div className={`${userRole === "crew" || userRole === "site-manager" && !isFilterPanelOpen ? "lg:col-span-4" : "lg:col-span-3"} bg-white rounded-lg shadow-sm p-4`}>
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-medium text-gray-800">
                    {getViewTitle()}
                  </h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Tabs defaultValue="weekly" value={calendarView} onValueChange={(value) => setCalendarView(value as CalendarView)}>
                    <TabsList>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handlePrevious}
                      className="border-gray-300 text-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleNext}
                      className="border-gray-300 text-gray-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid based on selected view */}
              {renderCalendar()}
            </div>

            {/* Filters Section - Now collapsible for all roles including site manager */}
            {userRole !== "crew" && (
              <Collapsible 
                open={isFilterPanelOpen} 
                onOpenChange={setIsFilterPanelOpen}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-medium text-gray-700">Active Jobs</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${isFilterPanelOpen ? 'rotate-90' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="p-4">
                  {/* Site Managers Section - Admin only */}
                  {userRole === "admin" && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">SITE MANAGER</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {siteManagers.map((manager) => (
                          <div key={manager} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                            <Checkbox 
                              id={`site-manager-${manager}`}
                              checked={filterSiteManagers.includes(manager)}
                              onCheckedChange={() => handleToggleSiteManager(manager)}
                              className="text-primary focus:ring-primary"
                            />
                            <label htmlFor={`site-manager-${manager}`} className="text-sm text-gray-700 flex items-center justify-between w-full">
                              <span>{manager}</span>
                              {filterSiteManagers.includes(manager) && (
                                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Selected</Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crew Members Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800">CREW MEMBERS</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {crewMembers.map((crew) => (
                        <div key={crew} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                          <Checkbox 
                            id={`crew-${crew}`}
                            checked={filterCrewMembers.includes(crew)}
                            onCheckedChange={() => handleToggleCrewMember(crew)}
                            className="text-primary focus:ring-primary"
                          />
                          <label htmlFor={`crew-${crew}`} className="text-sm text-gray-700 flex items-center justify-between w-full">
                            <span>{crew}</span>
                            {filterCrewMembers.includes(crew) && (
                              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">Selected</Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* For crew members, display Active Jobs section */}
            {userRole === "crew" && (
              <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-4">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-gray-700">Active Jobs</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {getFilteredJobs().map((job) => (
                      <div 
                        key={job.id}
                        className={cn(
                          "p-3 rounded-md border cursor-pointer hover:bg-gray-50",
                          job.completed ? "border-green-200" : 
                          job.cancelled ? "border-red-200" : 
                          job.rescheduled ? "border-yellow-200" :
                          "border-blue-200"
                        )}
                        onClick={() => handleJobClick(job)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">{job.name}</h4>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(job.date), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{job.clientName}</p>
                        <p className="text-xs text-gray-500">{job.startTime} - {job.endTime}</p>
                      </div>
                    ))}

                    {getFilteredJobs().length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No active jobs assigned to you
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Job Modal - disabled editing for crew members */}
        {isModalOpen && (
          <JobModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveJob}
            job={selectedJob}
            selectedDate={selectedDate}
            readOnly={userRole === "crew"}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default Schedule;
