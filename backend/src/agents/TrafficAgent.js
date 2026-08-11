const BaseAgent = require("./BaseAgent");

class TrafficAgent extends BaseAgent {
  constructor() {
    super("TrafficAgent", "traffic", {
      trafficOfficers: 50,
      towTrucks: 15,
      roadBarriers: 100,
    });
  }

  async evaluate(event) {
    // Track the incident in the agent's isolated memory
    this.memory.activeIncidents.push(event.id);

    // ---------------------------------------------------------
    // SCENARIO 1: Severe Weather (Proactive Traffic Management)
    // ---------------------------------------------------------
    if (event.type === "WEATHER_ALERT") {
      return this._createDecision(
        "Speed Reduced",
        "Medium",
        "Reduce speed limits by 20km/h",
        0.95,
        {},
        `Slippery roads detected due to ${event.metadata?.weather || "severe weather"}. Proactively slowing traffic to prevent collisions.`,
        ["Increased commute times"],
        [],
      );
    }

    // ---------------------------------------------------------
    // SCENARIO 2: Traffic Collision / Accidents
    // ---------------------------------------------------------
    if (event.type === "ACCIDENT_DETECTED") {
      const isMajor =
        event.metadata?.vehicles && event.metadata.vehicles.includes("Bus");
      const officersNeeded = isMajor ? 6 : 2;
      const towTrucksNeeded = isMajor ? 2 : 1;

      if (
        this.allocateResource("trafficOfficers", officersNeeded) &&
        this.allocateResource("towTrucks", towTrucksNeeded)
      ) {
        this.sendMessage(
          "HospitalAgent",
          `Major collision at ${event.location}. Clearing green corridor for EMS.`,
        );

        return this._createDecision(
          "Road Blocked",
          event.severity,
          "Close affected road and initiate diversion",
          0.92,
          {
            officersDeployed: officersNeeded,
            towTrucks: towTrucksNeeded,
            expectedCongestion: isMajor ? "88%" : "42%",
          },
          `Collision involving heavy vehicles. Lanes blocked at ${event.location}. Rerouting active.`,
          ["Secondary collisions", "Gridlock on alternative routes"],
          ["PoliceAgent", "HospitalAgent"],
        );
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 3: Fire or Gas Leakage (Hazard Zone Diversions)
    // ---------------------------------------------------------
    if (event.type === "FIRE" || event.type === "GAS_LEAKAGE") {
      const officersNeeded = event.severity === "Critical" ? 6 : 3;

      if (this.allocateResource("trafficOfficers", officersNeeded)) {
        this.sendMessage(
          "PoliceAgent",
          `Traffic diverted around ${event.location}. Handing over inner perimeter control.`,
        );

        return this._createDecision(
          "Roads Closed",
          event.severity,
          "Close nearby intersections and create diversion",
          0.94,
          {
            officersDeployed: officersNeeded,
            diversion: "Active",
            expectedCongestion: "65%",
          },
          `Hazard reported at ${event.location}. Closing surrounding roads to ensure emergency vehicle access and civilian safety.`,
          ["Gridlock on adjacent commercial streets"],
          ["PoliceAgent", "FireAgent", "UtilityAgent"],
        );
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 4: Flooding (Deploying Physical Barriers)
    // ---------------------------------------------------------
    if (event.type === "FLOOD") {
      const barriersNeeded = event.severity === "Critical" ? 20 : 10;
      const officersNeeded = event.severity === "Critical" ? 4 : 2;

      if (
        this.allocateResource("roadBarriers", barriersNeeded) &&
        this.allocateResource("trafficOfficers", officersNeeded)
      ) {
        this.sendMessage(
          "EnvironmentalAgent",
          `Roads barricaded at ${event.location} due to high water levels.`,
        );

        return this._createDecision(
          "Route Submerged",
          event.severity,
          "Deploy water barriers and close flooded routes",
          0.96,
          {
            barriersDeployed: barriersNeeded,
            officersDeployed: officersNeeded,
            diversion: "Active",
          },
          `Waterlogging detected at ${event.location}. Deployed physical road barriers to prevent vehicles from entering flooded zones.`,
          ["Stranded vehicles if water rises rapidly"],
          ["EnvironmentalAgent", "CitizenAgent"],
        );
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 5: Power Failure / Broken Signals
    // ---------------------------------------------------------
    if (event.type === "UTILITY_FAULT" || event.type === "POWER_FAILURE") {
      const officersNeeded = event.severity === "Critical" ? 4 : 2;

      if (this.allocateResource("trafficOfficers", officersNeeded)) {
        this.sendMessage(
          "UtilityAgent",
          `Officers dispatched to manage intersection manually at ${event.location} while repairs are underway.`,
        );

        return this._createDecision(
          "Manual Control",
          event.severity,
          "Deploy officers for manual intersection control",
          0.90,
          {
            officersDeployed: officersNeeded,
            signalStatus: "Offline",
          },
          `Traffic signals offline at ${event.location} due to power/utility failure. Officers actively directing traffic to prevent gridlock.`,
          ["High risk of minor collisions at intersections"],
          ["UtilityAgent"],
        );
      }
    }
    // ---------------------------------------------------------
        // SCENARIO: Crime or Security Pursuit (Green Corridors)
        // ---------------------------------------------------------
        if (event.type === 'CRIME_REPORTED' || event.type === 'SECURITY_BREACH') {
            if (event.severity === 'Critical') {
                const officersNeeded = 4;
                const barriersNeeded = 10;

                if (
                    this.allocateResource('trafficOfficers', officersNeeded) && 
                    this.allocateResource('roadBarriers', barriersNeeded)
                ) {
                    this.sendMessage('PoliceAgent', `Green corridor activated on Main St. Side intersections blocked to prevent escape.`);
                    
                    return this._createDecision(
                        'Pursuit Support', event.severity, 'Override Signals & Establish Roadblocks', 0.96,
                        { officersDeployed: officersNeeded, signalOverrides: 'Active', closedIntersections: 4 },
                        `Active police pursuit detected. Overriding traffic signal timing to create a green corridor for law enforcement and blocking likely escape routes.`,
                        ['Civilian traffic gridlock', 'Suspect vehicle ramming barricades'], 
                        ['PoliceAgent']
                    );
                }
            }
        }

    // Return null if the event type does not require Traffic Agent involvement
    return null;
  }
}

module.exports = TrafficAgent;