
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

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

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  job: Job | null;
  selectedDate: Date | null;
}

// Mock data for dropdowns
const mockWorkOrders = ["12", "15"];
const mockClients = [
  { name: "Client A", address: "123 Street Auburn,US,21311" },
  { name: "Client B", address: "123 Street Auburn,US,21311" }
];
const mockSiteManagers = ["Person A", "Person B", "Person C"];
const mockCrewMembers = ["Crew A", "Crew B", "Crew C"];

const JobModal = ({ isOpen, onClose, onSave, job, selectedDate }: JobModalProps) => {
  const [formData, setFormData] = useState<Job>({
    id: "",
    workOrderId: "",
    name: "",
    date: "",
    description: "",
    startTime: "10:00",
    endTime: "17:00",
    clientName: "",
    siteAddress: "",
    siteManager: "",
    crewMembers: [],
    completed: false,
    rescheduled: false,
    cancelled: false,
    notes: ""
  });

  // Initialize form with job data or default values
  useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        id: "",
        workOrderId: mockWorkOrders[0],
        name: "",
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "",
        description: "",
        startTime: "10:00",
        endTime: "17:00",
        clientName: mockClients[0]?.name || "",
        siteAddress: mockClients[0]?.address || "",
        siteManager: mockSiteManagers[0],
        crewMembers: [mockCrewMembers[0]],
        completed: false,
        rescheduled: false,
        cancelled: false,
        notes: ""
      });
    }
  }, [job, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workOrderId = e.target.value;
    setFormData({ 
      ...formData, 
      workOrderId
    });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientName = e.target.value;
    const client = mockClients.find(c => c.name === clientName);
    
    if (client) {
      setFormData({ 
        ...formData, 
        clientName,
        siteAddress: client.address
      });
    }
  };

  const handleCrewMemberToggle = (crewMember: string) => {
    let updatedCrewMembers: string[];
    
    if (formData.crewMembers.includes(crewMember)) {
      updatedCrewMembers = formData.crewMembers.filter(cm => cm !== crewMember);
    } else {
      updatedCrewMembers = [...formData.crewMembers, crewMember];
    }
    
    setFormData({ ...formData, crewMembers: updatedCrewMembers });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-gray-800">
            {job ? "Edit Job" : "Create New Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Order Selection */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">Work Order No.(s)</label>
            <div className="flex gap-2">
              <select
                name="workOrderId"
                value={formData.workOrderId}
                onChange={handleWorkOrderChange}
                className="border rounded-md p-2 bg-white text-gray-800 w-32 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {mockWorkOrders.map(order => (
                  <option key={order} value={order}>{order}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-4 text-gray-800">Work Order Details (#{formData.workOrderId})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Client Name</label>
                <select
                  value={formData.clientName}
                  onChange={handleClientChange}
                  className="w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {mockClients.map(client => (
                    <option key={client.name} value={client.name}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">Site Address</label>
                <Input 
                  name="siteAddress" 
                  value={formData.siteAddress}
                  onChange={handleChange}
                  readOnly
                  className="w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">Site Manager</label>
                <select
                  name="siteManager"
                  value={formData.siteManager}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {mockSiteManagers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">Crew Members</label>
                <div className="flex flex-wrap gap-4">
                  {mockCrewMembers.map(crew => (
                    <div key={crew} className="flex items-center">
                      <Checkbox
                        id={`crew-${crew}`}
                        checked={formData.crewMembers.includes(crew)}
                        onCheckedChange={() => handleCrewMemberToggle(crew)}
                        className="mr-2"
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

          {/* Job Details */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-4 text-gray-800">Job Details (#{formData.workOrderId})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Name</label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Job Name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">Date</label>
                <Input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1 text-gray-600">Description</label>
                <Textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Job description..."
                  rows={2}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">Start Time</label>
                <Input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-600">End Time</label>
                <Input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Removed the Completed, Rescheduled, Cancelled checkboxes as requested */}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
            <Textarea 
              name="notes" 
              value={formData.notes || ""} 
              onChange={handleChange}
              placeholder="Additional notes..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700"
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
