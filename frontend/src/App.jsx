import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DepartmentLayout from "./layouts/DepartmentLayout";
import socketService from "./services/socketService";
import { departmentSidebars } from "./navigation/navigationConfig";

// Import Pages
import DemonstrationInput from "./pages/DemonstrationInput";
import UnifiedDashboard from "./pages/Dashboard/UnifiedDashboard";
import DigitalTwinMap from "./components/DigitalTwin/MapWidget";
import SimulateDemonstation from "./pages/SimulateDemonstation";
//Traffic Pages
import TrafficOverview from "./pages/Departments/Traffic/Overview";
import LiveTraffic from "./pages/Departments/Traffic/LiveTraffic";
import RouteIntelligence from "./pages/Departments/Traffic/RouteIntelligence";
import TrafficSignals from "./pages/Departments/Traffic/TrafficSignals";
import TrafficCameras from "./pages/Departments/Traffic/TrafficCameras";
import EmergencyPriority from "./pages/Departments/Traffic/EmergencyPriority";
import CongestionHeatmap from "./pages/Departments/Traffic/CongestionHeatmap";
import AIPredictions from "./pages/Departments/Traffic/AIPredictions";
//Hospital Pages
import HospitalOverview from "./pages/Departments/Hospital/Overview";
import Hospitals from "./pages/Departments/Hospital/Hospitals";
import BedAvailability from "./pages/Departments/Hospital/BedAvailability";
import HospitalCapacity from "./pages/Departments/Hospital/HospitalCapacity";
import EmergencyDepartment from "./pages/Departments/Hospital/EmergencyDepartment";
import PatientFlow from "./pages/Departments/Hospital/PatientFlow";
import ResourceManagement from "./pages/Departments/Hospital/ResourceManagement";
import EmergencyAmbulance from "./pages/Departments/Hospital/EmergencyAmbulance";

// Placeholder Pages for scaffolding
const PlaceholderPage = ({ title }) => (
  <div className="flex h-full items-center justify-center text-city-700 text-xl font-bold">
    [{title} Module Offline]
  </div>
);

export default function App() {
  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);
  
  return (
    <Router>
      <Routes>
          <Route path="simulate-scenarios" element={<SimulateDemonstation />} />
        <Route path="/" element={<MainLayout />}>
          {/* Global Pages */}
          <Route index element={<UnifiedDashboard />} />
          <Route path="launchpad" element={<DemonstrationInput />} />
          <Route path="digital-twin" element={<DigitalTwinMap />} />

          {/* Department: Traffic */}
          <Route
            path="traffic"
            element={
              <DepartmentLayout
                title="Traffic"
                sidebarConfig={departmentSidebars.traffic}
              />
            }
          >
            <Route index element={<TrafficOverview />} />
            <Route path="cameras" element={<TrafficCameras />} />
            <Route path="live" element={<LiveTraffic />} />
            <Route path="route-intelligence" element={<RouteIntelligence/>} />
            <Route path="signals" element={<TrafficSignals />} />
            <Route path="emergency-priority" element={<EmergencyPriority />} />
            <Route path="predictions" element={<AIPredictions />} />
            <Route path="congestion" element={<CongestionHeatmap />} />
            <Route path="road-closures" element={<PlaceholderPage title="Road Closures" />} />

            <Route path="*" element={<Navigate to="/traffic" replace />} />
          </Route>

          {/* Department: Hospital */}
          <Route
            path="hospital"
            element={
              <DepartmentLayout
                title="Hospital Operations"
                sidebarConfig={departmentSidebars.hospital}
              />
            }
          >
            <Route index element={<HospitalOverview />} />
            <Route path="hospitals" element={<Hospitals />} />
            <Route path="emergency-ambulance" element={<EmergencyAmbulance />} />
            <Route path="bed-availability" element={<BedAvailability />} />
            <Route path="emergency-department" element={<EmergencyDepartment />} />
            <Route path="patient-flow" element={<PatientFlow/>} />
            <Route path="capacity" element={<HospitalCapacity />} />
            <Route path="resource-management" element={<ResourceManagement/>} />
            <Route path="agent" element={<PlaceholderPage title="Hospital Agent" />} />

            <Route path="*" element={<Navigate to="/hospital" replace />} />
          </Route>

          {/* You will repeat this pattern for Police, Fire, Utility, Citizen, etc. */}
        </Route>
      </Routes>
    </Router>
  );
}