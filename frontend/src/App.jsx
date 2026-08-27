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
import TrafficOverview from "./pages/Departments/Traffic/Overview";
import LiveTraffic from "./pages/Departments/Traffic/LiveTraffic";
import TrafficSignals from "./pages/Departments/Traffic/TrafficSignals";
import TrafficCameras from "./pages/Departments/Traffic/TrafficCameras";
import EmergencyPriority from "./pages/Departments/Traffic/EmergencyPriority";
import CongestionHeatmap from "./pages/Departments/Traffic/CongestionHeatmap";
import AIPredictions from "./pages/Departments/Traffic/AIPredictions";

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
            <Route path="route-intelligence" element={<PlaceholderPage title="Route Intelligence" />} />
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
                title="Hospital"
                sidebarConfig={departmentSidebars.hospital}
              />
            }
          >
            <Route
              index
              element={<PlaceholderPage title="Hospital Overview" />}
            />
            <Route
              path="icu"
              element={<PlaceholderPage title="ICU Bed Tracking" />}
            />
            <Route path="*" element={<Navigate to="/hospital" replace />} />
          </Route>

          {/* You will repeat this pattern for Police, Fire, Utility, Citizen, etc. */}
        </Route>
      </Routes>
    </Router>
  );
}