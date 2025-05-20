
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import JobModal from "@/components/JobModal";
import Navbar from "@/components/Navbar";

// Job type definition
interface Job {
  id: string;
  workOrderId: string;
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
  notes?: string;
}

// Mock data for jobs
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
    siteManager: "Person A",
    crewMembers: ["Crew A", "Crew B"],
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
    siteAddress: "123 Street Auburn,US,21311",
    siteManager: "Person A",
    crewMembers: ["Crew A", "Crew B"],
    completed: false,
    rescheduled: false,
    cancelled: false
  }
];

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterSiteManagers, setFilterSiteManagers] = useState<string[]>([]);
  const [filterCrewMembers, setFilterCrewMembers] = useState<string[]>([]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Get unique site managers and crew members for filters
  const uniqueSiteManagers = Array.from(new Set(jobs.map(job => job.siteManager)));
  const uniqueCrewMembers = Array.from(new Set(jobs.flatMap(job => job.crewMembers)));

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
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

  const filteredJobs = jobs.filter(job => {
    // Filter by site manager if any are selected
    const siteManagerMatch = filterSiteManagers.length === 0 || filterSiteManagers.includes(job.siteManager);
    
    // Filter by crew member if any are selected
    const crewMemberMatch = filterCrewMembers.length === 0 || 
      job.crewMembers.some(cm => filterCrewMembers.includes(cm));
    
    return siteManagerMatch && crewMemberMatch;
  });

  const getJobsForDate = (date: Date) => {
    return filteredJobs.filter(job => isSameDay(parseISO(job.date), date));
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-medium mb-6 text-gray-800">Schedule</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-medium text-gray-800">
                  {format(currentDate, 'MMMM yyyy').toUpperCase()}
                </h2>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="border-gray-300 text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleNextMonth}
                  className="border-gray-300 text-gray-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
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
                      isSameDay(day, new Date()) ? "border-primary" : "border-gray-200"
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
                        <TooltipProvider key={job.id}>
                          <Tooltip>
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
                            <TooltipContent>
                              <p>{job.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3 text-gray-800">SITE MANAGER</h3>
              <div className="space-y-2">
                {uniqueSiteManagers.map((manager) => (
                  <div key={manager} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`site-manager-${manager}`}
                      checked={filterSiteManagers.includes(manager)}
                      onCheckedChange={() => handleToggleSiteManager(manager)}
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor={`site-manager-${manager}`} className="text-sm text-gray-700">
                      {manager}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">CREW MEMBERS</h3>
              <div className="flex flex-wrap gap-3">
                {uniqueCrewMembers.map((crew) => (
                  <div key={crew} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`crew-${crew}`}
                      checked={filterCrewMembers.includes(crew)}
                      onCheckedChange={() => handleToggleCrewMember(crew)}
                      className="text-primary focus:ring-primary"
                    />
                    <label htmlFor={`crew-${crew}`} className="text-sm text-gray-700">
                      {crew}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Modal */}
      {isModalOpen && (
        <JobModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveJob}
          job={selectedJob}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Schedule;
