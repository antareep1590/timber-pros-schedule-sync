
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleCheckboxChange = (name: keyof Job, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? "Edit Job" : "Create New Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Work Order Selection */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Work Order No.(s)</label>
            <div className="flex gap-2">
              <select
                name="workOrderId"
                value={formData.workOrderId}
                onChange={handleWorkOrderChange}
                className="border rounded p-2 w-32"
              >
                {mockWorkOrders.map(order => (
                  <option key={order} value={order}>{order}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="mb-6 border rounded-md p-4">
            <h3 className="font-medium mb-2">Work Order Details (#{formData.workOrderId})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Client Name</label>
                <select
                  value={formData.clientName}
                  onChange={handleClientChange}
                  className="border rounded p-2 w-full"
                >
                  {mockClients.map(client => (
                    <option key={client.name} value={client.name}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Site Address</label>
                <Input 
                  name="siteAddress" 
                  value={formData.siteAddress}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Site Manager</label>
                <select
                  name="siteManager"
                  value={formData.siteManager}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                >
                  {mockSiteManagers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Crew Members</label>
                <div className="flex flex-col gap-2">
                  {mockCrewMembers.map(crew => (
                    <div key={crew} className="flex items-center">
                      <Checkbox
                        id={`crew-${crew}`}
                        checked={formData.crewMembers.includes(crew)}
                        onCheckedChange={() => handleCrewMemberToggle(crew)}
                      />
                      <label htmlFor={`crew-${crew}`} className="ml-2 text-sm">
                        {crew}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="mb-6 border rounded-md p-4">
            <h3 className="font-medium mb-2">Job Details (#{formData.workOrderId})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Job Name"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Date</label>
                <Input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Description</label>
                <Textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Job description..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Start Time</label>
                <Input 
                  type="time" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">End Time</label>
                <Input 
                  type="time" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Checkbox
                    id="completed"
                    checked={formData.completed}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('completed', checked === true)
                    }
                  />
                  <label htmlFor="completed" className="ml-2 text-sm">
                    Completed
                  </label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="rescheduled"
                    checked={formData.rescheduled}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('rescheduled', checked === true)
                    }
                  />
                  <label htmlFor="rescheduled" className="ml-2 text-sm">
                    Rescheduled
                  </label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="cancelled"
                    checked={formData.cancelled}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('cancelled', checked === true)
                    }
                  />
                  <label htmlFor="cancelled" className="ml-2 text-sm">
                    Cancelled
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea 
              name="notes" 
              value={formData.notes || ""} 
              onChange={handleChange}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
