
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">Timber Pros</h1>
        <p className="text-xl text-gray-600 mb-8">Your timber management solution</p>
        
        <Link to="/schedule">
          <Button className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Go to Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
