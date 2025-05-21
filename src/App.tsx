
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import WorkOrder from "./pages/WorkOrder";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import TimeTracker from "./pages/TimeTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/work-order" element={<WorkOrder />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/work-order/create" element={<CreateWorkOrder />} />
          <Route path="/time-tracker" element={<TimeTracker />} />
          {/* Redirect root path to login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
