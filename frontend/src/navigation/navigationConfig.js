export const mainSidebar = [
  {
    title: "Dashboard",
    path: "/",
    icon: "dashboard",
  },
  {
    title: "Simulation Launchpad",
    path: "/launchpad",
    icon: "launchpad",
  },
  {
    title: "Digital Twin",
    path: "/digital-twin",
    icon: "digital-twin",
  },
  {
    title: "Traffic Department",
    path: "/traffic",
    icon: "traffic",
  },
  {
    title: "Hospital Department",
    path: "/hospital",
    icon: "hospital",
  },
  {
    title: "Police Department",
    path: "/police",
    icon: "police",
  },
  {
    title: "Fire Department",
    path: "/fire",
    icon: "fire",
  },
  {
    title: "Utility Department",
    path: "/utility",
    icon: "utility",
  },
  {
    title: "Citizen Services",
    path: "/citizen",
    icon: "citizen",
  },
  {
    title: "City Reports",
    path: "/reports",
    icon: "reports",
  },
  {
    title: "AI Analytics",
    path: "/analytics",
    icon: "analytics",
  },
  {
    title: "System Settings",
    path: "/settings",
    icon: "settings",
  },
];


export const departmentSidebars = {

  //------------------------------------------------
  // TRAFFIC
  //------------------------------------------------
traffic: [
    { title: "Overview", path: "/traffic" },
    { title: "Traffic Cameras", path: "/traffic/cameras" },
    { title: "Live Traffic", path: "/traffic/live" },
    { title: "Route Intelligence", path: "/traffic/route-intelligence" },
    { title: "Traffic Signals", path: "/traffic/signals" },
    { title: "Emergency Priority", path: "/traffic/emergency-priority" },
    { title: "AI Predictions", path: "/traffic/predictions" },
    { title: "Congestion & Density", path: "/traffic/congestion" },
    { title: "Road Closures", path: "/traffic/road-closures" }
  ],
  //------------------------------------------------
  // HOSPITAL
  //------------------------------------------------
  hospital: [
    { title: "Overview", path: "/hospital" },
    { title: "Hospital Status", path: "/hospital/status" },
    { title: "ICU Beds", path: "/hospital/icu" },
    { title: "Available Beds", path: "/hospital/beds" },
    { title: "Doctors", path: "/hospital/doctors" },
    { title: "Ambulances", path: "/hospital/ambulances" },
    { title: "Emergency Cases", path: "/hospital/emergency" },
    { title: "Medicine Inventory", path: "/hospital/medicine" },
    { title: "Medical Equipment", path: "/hospital/equipment" },
    { title: "Patient Queue", path: "/hospital/queue" },
    { title: "Disease Outbreak", path: "/hospital/outbreak" },
    { title: "Hospital Analytics", path: "/hospital/analytics" }
  ],

  //------------------------------------------------
  // POLICE
  //------------------------------------------------
  police: [
    { title: "Overview", path: "/police" },
    { title: "Live Incidents", path: "/police/incidents" },
    { title: "Crime Map", path: "/police/crime-map" },
    { title: "Police Stations", path: "/police/stations" },
    { title: "Officers", path: "/police/officers" },
    { title: "Patrol Vehicles", path: "/police/vehicles" },
    { title: "Emergency Calls", path: "/police/emergency" },
    { title: "Wanted Persons", path: "/police/wanted" },
    { title: "CCTV Monitoring", path: "/police/cctv" },
    { title: "Case Management", path: "/police/cases" },
    { title: "AI Threat Detection", path: "/police/threats" },
    { title: "Police Analytics", path: "/police/analytics" }
  ],

  //------------------------------------------------
  // FIRE
  //------------------------------------------------
  fire: [
    { title: "Overview", path: "/fire" },
    { title: "Active Fire Alerts", path: "/fire/alerts" },
    { title: "Fire Stations", path: "/fire/stations" },
    { title: "Fire Trucks", path: "/fire/trucks" },
    { title: "Rescue Teams", path: "/fire/rescue" },
    { title: "Hydrant Locations", path: "/fire/hydrants" },
    { title: "Building Risk", path: "/fire/risk" },
    { title: "Disaster Response", path: "/fire/disaster" },
    { title: "Emergency Requests", path: "/fire/emergency" },
    { title: "Response Time", path: "/fire/response" },
    { title: "Fire Analytics", path: "/fire/analytics" },
    { title: "AI Fire Prediction", path: "/fire/predictions" }
  ],

  //------------------------------------------------
  // UTILITY
  //------------------------------------------------
  utility: [
    { title: "Overview", path: "/utility" },
    { title: "Electricity", path: "/utility/electricity" },
    { title: "Water Supply", path: "/utility/water" },
    { title: "Gas Network", path: "/utility/gas" },
    { title: "Waste Management", path: "/utility/waste" },
    { title: "Street Lights", path: "/utility/lights" },
    { title: "Sewage System", path: "/utility/sewage" },
    { title: "Power Grid", path: "/utility/grid" },
    { title: "Water Quality", path: "/utility/quality" },
    { title: "Maintenance", path: "/utility/maintenance" },
    { title: "Utility Analytics", path: "/utility/analytics" },
    { title: "AI Resource Optimization", path: "/utility/predictions" }
  ],

  //------------------------------------------------
  // CITIZEN
  //------------------------------------------------
  citizen: [
    { title: "Overview", path: "/citizen" },
    { title: "Complaints", path: "/citizen/complaints" },
    { title: "Emergency Requests", path: "/citizen/emergency" },
    { title: "Feedback", path: "/citizen/feedback" },
    { title: "Service Requests", path: "/citizen/services" },
    { title: "Permits", path: "/citizen/permits" },
    { title: "Public Notices", path: "/citizen/notices" },
    { title: "Citizen Analytics", path: "/citizen/analytics" }
  ],

  //------------------------------------------------
  // REPORTS
  //------------------------------------------------
  reports: [
    { title: "Overview", path: "/reports" },
    { title: "Traffic Reports", path: "/reports/traffic" },
    { title: "Hospital Reports", path: "/reports/hospital" },
    { title: "Police Reports", path: "/reports/police" },
    { title: "Fire Reports", path: "/reports/fire" },
    { title: "Utility Reports", path: "/reports/utility" },
    { title: "Citizen Reports", path: "/reports/citizen" },
    { title: "Download Reports", path: "/reports/download" }
  ],

  //------------------------------------------------
  // ANALYTICS
  //------------------------------------------------
  analytics: [
    { title: "Overview", path: "/analytics" },
    { title: "City KPIs", path: "/analytics/kpi" },
    { title: "Predictive AI", path: "/analytics/predictions" },
    { title: "Resource Allocation", path: "/analytics/resources" },
    { title: "AI Agents", path: "/analytics/agents" },
    { title: "Decision Intelligence", path: "/analytics/decision" },
    { title: "Historical Trends", path: "/analytics/history" },
    { title: "Forecasting", path: "/analytics/forecast" }
  ],

  //------------------------------------------------
  // SETTINGS
  //------------------------------------------------
  settings: [
    { title: "General", path: "/settings" },
    { title: "Users", path: "/settings/users" },
    { title: "Roles & Permissions", path: "/settings/roles" },
    { title: "Departments", path: "/settings/departments" },
    { title: "AI Models", path: "/settings/ai-models" },
    { title: "Notifications", path: "/settings/notifications" },
    { title: "Audit Logs", path: "/settings/logs" },
    { title: "System Backup", path: "/settings/backup" }
  ]

};