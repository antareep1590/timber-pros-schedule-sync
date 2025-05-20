import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

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

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  job: Job | null;
  selectedDate: Date | null;
  readOnly?: boolean; // Add the readOnly prop as optional
}

// Mock data for dropdowns
const mockWorkOrders = ["12", "15", "18", "21", "25"];
const mockClients = [
  { name: "Client A", address: "123 Street Auburn,US,21311" },
  { name: "Client B", address: "456 Street Auburn,US,21311" },
  { name: "Client C", address: "789 Street Auburn,US,21311" }
];
const mockSiteManagers = ["Person A", "Person B", "Person C"];
const mockCrewMembers = ["Crew A", "Crew B", "Crew C", "Crew D", "Crew E"];

const JobModal = ({ isOpen, onClose, onSave, job, selectedDate, readOnly = false }: JobModalProps) => {
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

  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);
  const [showWorkOrderDropdown, setShowWorkOrderDropdown] = useState(false);

  // Initialize form with job data or default values
  useEffect(() => {
    if (job) {
      setFormData(job);
      setSelectedWorkOrders(Array.isArray(job.workOrderId) ? job.workOrderId : [job.workOrderId]);
    } else {
      setFormData({
        id: "",
        workOrderId: "",
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
      setSelectedWorkOrders([]);
    }
  }, [job, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (readOnly) return; // Don't update state if in readOnly mode
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWorkOrderSelect = (workOrderId: string) => {
    if (readOnly) return; // Don't update state if in readOnly mode
    if (!selectedWorkOrders.includes(workOrderId)) {
      const updatedWorkOrders = [...selectedWorkOrders, workOrderId];
      setSelectedWorkOrders(updatedWorkOrders);
      setFormData({ ...formData, workOrderId: updatedWorkOrders });
    }
    setShowWorkOrderDropdown(false);
  };

  const handleRemoveWorkOrder = (workOrderId: string) => {
    if (readOnly) return; // Don't update state if in readOnly mode
    const updatedWorkOrders = selectedWorkOrders.filter(wo => wo !== workOrderId);
    setSelectedWorkOrders(updatedWorkOrders);
    setFormData({ ...formData, workOrderId: updatedWorkOrders });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readOnly) return; // Don't update state if in readOnly mode
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
    if (readOnly) return; // Don't update state if in readOnly mode
    let updatedCrewMembers: string[];
    
    if (formData.crewMembers.includes(crewMember)) {
      updatedCrewMembers = formData.crewMembers.filter(cm => cm !== crewMember);
    } else {
      updatedCrewMembers = [...formData.crewMembers, crewMember];
    }
    
    setFormData({ ...formData, crewMembers: updatedCrewMembers });
  };

  const handleStatusChange = (status: string) => {
    if (readOnly) return; // Don't update state if in readOnly mode
    setFormData({
      ...formData,
      completed: status === 'completed',
      rescheduled: status === 'rescheduled',
      cancelled: status === 'cancelled',
      status: status
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSave(formData);
    }
  };

  const getStatusValue = (): string => {
    if (formData.completed) return 'completed';
    if (formData.rescheduled) return 'rescheduled';
    if (formData.cancelled) return 'cancelled';
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-gray-800">
            {job ? (readOnly ? "View Job" : "Edit Job") : "Create New Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Order Selection */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">Work Order No.(s)</label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div 
                  className={`border rounded-md p-2 min-h-10 flex flex-wrap gap-2 ${!readOnly ? 'cursor-pointer' : ''}`}
                  onClick={() => !readOnly && setShowWorkOrderDropdown(!showWorkOrderDropdown)}
                >
                  {selectedWorkOrders.length > 0 ? (
                    selectedWorkOrders.map(wo => (
                      <Badge key={wo} className="bg-primary text-white flex items-center gap-1">
                        {wo}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWorkOrder(wo);
                          }}
                          className="hover:text-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">Select Work Orders...</span>
                  )}
                </div>
                
                {showWorkOrderDropdown && !readOnly && (
                  <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg w-full max-h-40 overflow-y-auto">
                    {mockWorkOrders
                      .filter(wo => !selectedWorkOrders.includes(wo))
                      .map(wo => (
                        <div 
                          key={wo} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleWorkOrderSelect(wo)}
                        >
                          {wo}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedWorkOrders.map((workOrder, index) => (
            <div key={workOrder} className="space-y-6">
              {/* Work Order Details */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-4 text-gray-800">Work Order Details (#{workOrder})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-600">Client Name</label>
                    <select
                      value={formData.clientName}
                      onChange={handleClientChange}
                      disabled={readOnly}
                      className={`w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                      disabled={readOnly}
                      className={`w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                            id={`crew-${index}-${crew}`}
                            checked={formData.crewMembers.includes(crew)}
                            onCheckedChange={() => handleCrewMemberToggle(crew)}
                            disabled={readOnly}
                            className={`mr-2 ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                          />
                          <label htmlFor={`crew-${index}-${crew}`} className="text-sm text-gray-700">
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
                <h3 className="font-medium mb-4 text-gray-800">Job Details (#{workOrder})</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-600">Name</label>
                    <Input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      placeholder="Job Name"
                      disabled={readOnly}
                      className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-600">Date</label>
                    <Input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange}
                      disabled={readOnly}
                      className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                      disabled={readOnly}
                      className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-600">Start Time</label>
                    <Input 
                      type="time" 
                      name="startTime" 
                      value={formData.startTime} 
                      onChange={handleChange}
                      disabled={readOnly}
                      className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1 text-gray-600">End Time</label>
                    <Input 
                      type="time" 
                      name="endTime" 
                      value={formData.endTime} 
                      onChange={handleChange}
                      disabled={readOnly}
                      className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Status Radio Buttons (only for Edit mode) */}
                  {job && !readOnly && (
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2 text-gray-600">Status</label>
                      <RadioGroup 
                        value={getStatusValue()} 
                        onValueChange={handleStatusChange}
                        className="flex flex-wrap gap-4"
                        disabled={readOnly}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="completed" id="completed" />
                          <Label htmlFor="completed">Completed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rescheduled" id="rescheduled" />
                          <Label htmlFor="rescheduled">Rescheduled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cancelled" id="cancelled" />
                          <Label htmlFor="cancelled">Cancelled</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Status display for read-only mode */}
                  {job && readOnly && (
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2 text-gray-600">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.completed && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                        {formData.rescheduled && (
                          <Badge className="bg-yellow-100 text-yellow-800">Rescheduled</Badge>
                        )}
                        {formData.cancelled && (
                          <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                        )}
                        {!formData.completed && !formData.rescheduled && !formData.cancelled && (
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
            <Textarea 
              name="notes" 
              value={formData.notes || ""} 
              onChange={handleChange}
              placeholder="Additional notes..."
              rows={3}
              disabled={readOnly}
              className={`w-full ${readOnly ? 'opacity-75 cursor-not-allowed' : ''}`}
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
              <X className="mr-1 h-4 w-4" /> {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly && (
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-1 h-4 w-4" /> Save
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;
