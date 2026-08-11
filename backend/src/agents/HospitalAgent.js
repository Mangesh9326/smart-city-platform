const BaseAgent = require("./BaseAgent");

class HospitalAgent extends BaseAgent {
  constructor() {
    // Expanded resource pool for mass casualty and shelter support
    super("HospitalAgent", "hospital", {
      ambulances: 25,
      medicalTeams: 40,
      icuBeds: 12,
    });
  }

  async evaluate(event) {
    // Track the incident in the agent's isolated memory
    this.memory.activeIncidents.push(event.id);

    // ---------------------------------------------------------
    // SCENARIO 1: Traffic Collision / Direct Medical Emergency
    // ---------------------------------------------------------
    if (event.type === "ACCIDENT_DETECTED" || event.type === "MEDICAL_EMERGENCY") {
      const ambulancesNeeded = event.severity === "Critical" ? 2 : 1;

      if (this.allocateResource("ambulances", ambulancesNeeded)) {
        this.allocateResource("icuBeds", ambulancesNeeded);

        if (this.resources.icuBeds <= 2) {
          this.sendMessage(
            "TrafficAgent",
            `ICU near capacity. Need green corridor for fast offloading.`,
          );
          return this._createDecision(
            "Overcapacity Warning",
            "Critical",
            `Dispatch ${ambulancesNeeded} Ambulances & Reroute`,
            0.88,
            {
              ambulancesDispatched: ambulancesNeeded,
              icuBedsAvailable: this.resources.icuBeds,
            },
            `ICU occupancy critical. Dispatching units but preparing secondary hospital routing.`,
            ["Ambulance delay", "ICU overflow"],
            ["TrafficAgent"],
          );
        } else {
          return this._createDecision(
            "Deploying",
            event.severity,
            `Dispatch ${ambulancesNeeded} Ambulances`,
            0.98,
            {
              ambulancesDispatched: ambulancesNeeded,
              icuBedsAvailable: this.resources.icuBeds,
            },
            `Dispatched emergency medical services to ${event.location}.`,
            [],
            [],
          );
        }
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 2: Fire, Gas Leak, or Chemical Spill (Hazmat/Burn Prep)
    // ---------------------------------------------------------
    if (event.type === "FIRE" || event.type === "GAS_LEAKAGE" || event.type === "CHEMICAL_SPILL") {
      const ambulancesNeeded = event.severity === "Critical" ? 3 : 1;
      const teamsNeeded = event.severity === "Critical" ? 2 : 1;

      if (
        this.allocateResource("ambulances", ambulancesNeeded) &&
        this.allocateResource("medicalTeams", teamsNeeded)
      ) {
        this.allocateResource("icuBeds", ambulancesNeeded);
        this.sendMessage(
          "FireAgent",
          `Ambulances en route to ${event.location}. Standing by for burn/hazmat triage.`,
        );

        return this._createDecision(
          "Trauma Prep",
          event.severity,
          `Dispatch ${ambulancesNeeded} Ambulances`,
          0.97,
          {
            ambulancesDispatched: ambulancesNeeded,
            icuBedsAvailable: this.resources.icuBeds,
            traumaTeam: "Standby",
          },
          `Hazardous incident. Dispatched EMS and notified emergency department to prep specialized trauma/burn teams.`,
          ["Smoke inhalation casualties exceeding estimates", "Toxin exposure"],
          ["FireAgent", "TrafficAgent"],
        );
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 3: Power Failure / City Blackout (Life Support Check)
    // ---------------------------------------------------------
    if (event.type === "POWER_FAILURE") {
      this.sendMessage(
        "UtilityAgent",
        `Hospital grid offline. Backup generators active. Requesting priority grid restoration.`,
      );

      return this._createDecision(
        "Backup Power",
        event.severity,
        "Activate Backup Generators",
        0.99,
        {
          generatorStatus: "Active",
          icuBedsAvailable: this.resources.icuBeds,
          powerReserve: "48 Hours",
        },
        `City power failure detected. Automatically switched hospital to backup generator power to protect ICU life-support systems.`,
        ["Generator failure", "Extended blackout exceeding fuel reserves"],
        ["UtilityAgent"],
      );
    }

    // ---------------------------------------------------------
    // SCENARIO 4: Crime or Security Breach (Staged Deployment)
    // ---------------------------------------------------------
    if (event.type === "CRIME_REPORTED" || event.type === "SECURITY_BREACH") {
      const ambulancesNeeded = event.severity === "Critical" ? 2 : 1;

      if (this.allocateResource("ambulances", ambulancesNeeded)) {
        this.sendMessage(
          "PoliceAgent",
          `Ambulances staging 500m from ${event.location}. Awaiting your 'all clear' to enter the hot zone.`,
        );

        return this._createDecision(
          "Staging",
          event.severity,
          `Stage ${ambulancesNeeded} Ambulances at Perimeter`,
          0.95,
          {
            ambulancesDispatched: ambulancesNeeded,
            stagingStatus: "Awaiting Police Clearance",
          },
          `Active security threat. Ambulances dispatched but holding at a safe perimeter until Police secure the scene.`,
          ["Delayed medical intervention for victims inside the hot zone"],
          ["PoliceAgent"],
        );
      }
    }

    // ---------------------------------------------------------
    // SCENARIO 5: Severe Weather or Flooding (Shelter Medical Support)
    // ---------------------------------------------------------
    if (event.type === "FLOOD" || event.type === "WEATHER_ALERT") {
      if (event.severity === "Critical" || event.type === "FLOOD") {
        const teamsNeeded = 3;

        if (this.allocateResource("medicalTeams", teamsNeeded)) {
          this.sendMessage(
            "CitizenAgent",
            `Medical teams deployed to emergency shelters to support evacuated citizens.`,
          );

          return this._createDecision(
            "Shelter Support",
            event.severity,
            `Deploy Medical Teams to Shelters`,
            0.92,
            {
              medicalTeamsDeployed: teamsNeeded,
              shelterTriage: "Active",
            },
            `Severe weather emergency. Deployed medical teams to citizen evacuation shelters for triage and preventative care.`,
            ["Waterborne disease outbreaks", "Hypothermia cases"],
            ["CitizenAgent", "EnvironmentalAgent"],
          );
        }
      }
    }

    // Return null if the event type does not require Hospital Agent involvement
    return null;
  }
}

module.exports = HospitalAgent;