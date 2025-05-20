import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, X } from "lucide-react";
import AnnotatedPhotoUpload from "@/components/AnnotatedPhotoUpload";
import Navbar from "@/components/Navbar";

interface WorkOrderItem {
  name: string;
  units: number;
  rate: number;
  cost: number;
  [key: string]: string | number; // Add index signature to allow dynamic property access
}

interface WorkOrderExpense {
  head: string;
  hours: number;
  rate: number;
  amount: number;
  [key: string]: string | number; // Add index signature to allow dynamic property access
}

const CreateWorkOrder = () => {
  const navigate = useNavigate();
  
  const [clientName, setClientName] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [salesExecutive, setSalesExecutive] = useState("Mark");
  const [executionDate, setExecutionDate] = useState("");
  const [executionTime, setExecutionTime] = useState("10:00");
  const [items, setItems] = useState<WorkOrderItem[]>([
    { name: "Remove Tree From Garden", units: 1, rate: 1000, cost: 1000 },
    { name: "Cut Down Trees on Street", units: 1, rate: 4000, cost: 4000 }
  ]);
  const [expenses, setExpenses] = useState<WorkOrderExpense[]>([
    { head: "Crew", hours: 10, rate: 40, amount: 400 },
    { head: "Crane", hours: 10, rate: 40, amount: 400 },
    { head: "Site Manager", hours: 10, rate: 40, amount: 400 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [comments, setComments] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.cost, 0);
  const total = subtotal - discount;
  const expensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddItem = () => {
    setItems([...items, { name: "", units: 1, rate: 0, cost: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof WorkOrderItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    
    // Recalculate cost if units or rate changes
    if (field === 'units' || field === 'rate') {
      updatedItems[index].cost = updatedItems[index].units * updatedItems[index].rate;
    }
    
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, { head: "", hours: 0, rate: 0, amount: 0 }]);
  };

  const handleExpenseChange = (index: number, field: keyof WorkOrderExpense, value: string | number) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    
    // Recalculate amount if hours or rate changes
    if (field === 'hours' || field === 'rate') {
      updatedExpenses[index].amount = updatedExpenses[index].hours * updatedExpenses[index].rate;
    }
    
    setExpenses(updatedExpenses);
  };

  const handleRemoveExpense = (index: number) => {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  };

  const handleCancel = () => {
    navigate('/work-order');
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    navigate('/work-order');
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/work-order')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> 
            Create New Work Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Client Name</label>
              <Input
                type="text"
                placeholder="Search for client..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Order No.</label>
              <Input
                type="text"
                placeholder="Order No."
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Sales Executive</label>
              <Input
                type="text"
                value={salesExecutive}
                onChange={(e) => setSalesExecutive(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tentative Execution Date</label>
              <Input
                type="date"
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tentative Execution Time</label>
              <Input
                type="time"
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Deliverables</h3>
              <Button 
                onClick={handleAddItem}
                variant="outline"
                className="flex items-center text-gray-600 border-gray-300"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-white">ITEM(S)</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">UNIT(S)</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">RATE</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">COST</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-20">ACTION</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <Input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="border-0 bg-transparent p-0 focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input 
                          type="number" 
                          value={item.units} 
                          onChange={(e) => handleItemChange(index, 'units', Number(e.target.value))}
                          className="border-0 bg-transparent p-0 focus:ring-0 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-1">$</span>
                          <Input 
                            type="number" 
                            value={item.rate} 
                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-center w-16"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-1">$</span>
                          <Input 
                            type="number" 
                            value={item.cost} 
                            readOnly
                            className="border-0 bg-transparent p-0 focus:ring-0 text-center w-16"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Sub Total</td>
                    <td className="px-4 py-3 text-center font-medium">${subtotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Discount</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-1">$</span>
                        <Input 
                          type="number" 
                          value={discount} 
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="border-0 bg-transparent p-0 focus:ring-0 text-center w-16"
                        />
                      </div>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Total</td>
                    <td className="px-4 py-3 text-center font-medium">${total.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-1 text-gray-700">Comments</label>
            <Textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          {/* Budget Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Budget (Internal)</h3>
              <Button 
                onClick={handleAddExpense}
                variant="outline"
                className="flex items-center text-gray-600 border-gray-300"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Expense
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-white">EXPENSE HEAD</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">HOURS</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">RATE</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-24">AMOUNT</th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-white w-20">ACTION</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <Input 
                          type="text" 
                          value={expense.head} 
                          onChange={(e) => handleExpenseChange(index, 'head', e.target.value)}
                          className="border-0 bg-transparent p-0 focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input 
                          type="number" 
                          value={expense.hours} 
                          onChange={(e) => handleExpenseChange(index, 'hours', Number(e.target.value))}
                          className="border-0 bg-transparent p-0 focus:ring-0 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-1">$</span>
                          <Input 
                            type="number" 
                            value={expense.rate} 
                            onChange={(e) => handleExpenseChange(index, 'rate', Number(e.target.value))}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-center w-16"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-1">$</span>
                          <Input 
                            type="number" 
                            value={expense.amount} 
                            readOnly
                            className="border-0 bg-transparent p-0 focus:ring-0 text-center w-16"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleRemoveExpense(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Total</td>
                    <td className="px-4 py-3 text-center font-medium">${expensesTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Update Photo Upload Section to use the AnnotatedPhotoUpload component */}
          <div className="mb-8">
            <AnnotatedPhotoUpload />
          </div>

          {/* Upload W9 Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload W9</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center border">
                <span className="text-gray-400">PDF</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center text-gray-600 border-gray-300"
            >
              <Plus className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Save & Create Work Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkOrder;
