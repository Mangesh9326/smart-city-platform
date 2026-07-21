const BaseAgent = require('./BaseAgent');

class EnvironmentalAgent extends BaseAgent {
    constructor() {
        super('EnvironmentalAgent', {
            monitoringDrones: 12,
            environmentalInspectors: 8,
            airPurificationUnits: 5
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        if (event.type === 'WEATHER_ALERT' || event.type === 'FLOOD' || event.type === 'CHEMICAL_SPILL') {
            
            let dronesNeeded = 0;
            let inspectorsNeeded = 0;

            if (event.type === 'WEATHER_ALERT' || event.type === 'FLOOD') {
                dronesNeeded = 3; // Aerial damage and water level assessment
            } else if (event.type === 'CHEMICAL_SPILL') {
                inspectorsNeeded = 2;
                dronesNeeded = 1;
            }

            const resourcesAvailable = 
                this.allocateResource('monitoringDrones', dronesNeeded) && 
                this.allocateResource('environmentalInspectors', inspectorsNeeded);

            if (resourcesAvailable) {
                // Cross-Domain Coordination
                if (event.type === 'WEATHER_ALERT' || event.type === 'FLOOD') {
                    this.sendMessage('UtilityAgent', `Severe weather/flood risk increasing at ${event.location}. Protect substations.`);
                    this.sendMessage('TrafficAgent', `Visibility and road traction dropping near ${event.location}. Expect heavy congestion.`);
                }

                decision = this._createDecision(
                    event.severity,
                    0.88, // Predictive environmental models have slight variance
                    { monitoringDrones: dronesNeeded, environmentalInspectors: inspectorsNeeded },
                    `Deployed ${dronesNeeded} monitoring drones to track environmental spread at ${event.location}. Alerting utility and traffic departments of changing physical conditions.`,
                    ['Sudden weather shifts', 'Unpredictable flood paths'],
                    ['UtilityAgent', 'TrafficAgent', 'CitizenAgent']
                );
            }
        }

        return decision;
    }
}

module.exports = EnvironmentalAgent;