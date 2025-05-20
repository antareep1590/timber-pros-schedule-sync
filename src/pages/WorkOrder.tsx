
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronDown, Edit, Trash, File } from "lucide-react";

interface WorkOrder {
  id: number;
  clientName: string;
  addedOn: string;
  numberOfItems: number;
  totalCost: string;
  executionDate: string;
  salesExecutive: string;
  siteManager: string;
  status: string;
}

const WorkOrder = () => {
  const navigate = useNavigate();
  
  // Sample data for work orders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 1,
      clientName: "Amirappa",
      addedOn: "2023-04-09",
      numberOfItems: 6,
      totalCost: "$5,000",
      executionDate: "Apr 18th, 2023",
      salesExecutive: "John",
      siteManager: "Roy",
      status: "Open"
    },
    {
      id: 2,
      clientName: "Archit",
      addedOn: "2023-04-17",
      numberOfItems: 5,
      totalCost: "$2,600",
      executionDate: "Apr 18th, 2025",
      salesExecutive: "John",
      siteManager: "Roy",
      status: "Open"
    }
  ]);

  const [filters, setFilters] = useState({
    clientName: "",
    salesExecutive: "All",
    siteManager: "All",
    status: "All",
    executionDate: ""
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleCreateWorkOrder = () => {
    navigate('/work-order/create');
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-medium text-gray-700">Work Order</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 text-gray-500"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300 text-gray-500"
            >
              <File className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Client Name</label>
              <Input 
                type="text" 
                placeholder="Search client..." 
                name="clientName"
                value={filters.clientName}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Sales Executive</label>
              <select
                name="salesExecutive"
                value={filters.salesExecutive}
                onChange={handleFilterChange}
                className="w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="All">All</option>
                <option value="John">John</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Site Manager</label>
              <select
                name="siteManager"
                value={filters.siteManager}
                onChange={handleFilterChange}
                className="w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="All">All</option>
                <option value="Roy">Roy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border rounded-md p-2 bg-white text-gray-800 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Execution Date</label>
              <Input 
                type="date" 
                name="executionDate"
                value={filters.executionDate}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <div></div>
          <Button 
            onClick={handleCreateWorkOrder} 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Create Work Order
          </Button>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary text-white">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Order No.</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Client Name</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Added On</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">No. of Items</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Total Cost</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Execution Date</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Sales Executive</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Site Manager</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.clientName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.addedOn}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.numberOfItems}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.totalCost}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{order.executionDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {order.salesExecutive}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {order.siteManager}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <File className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrder;
