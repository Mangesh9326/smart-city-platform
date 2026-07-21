const BaseAgent = require('./BaseAgent');

class PoliceAgent extends BaseAgent {
    constructor() {
        super('PoliceAgent', {
            policeOfficers: 120,
            patrolVehicles: 45,
            tacticalUnits: 5,
            roadBarriers: 200
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        if (event.type === 'ACCIDENT' || event.type === 'CRIME' || event.type === 'FIRE') {
            
            // Determine resource requirements based on severity and type
            let officersNeeded = 2;
            let vehiclesNeeded = 1;

            if (event.severity === 'Critical') {
                officersNeeded = 6;
                vehiclesNeeded = 3;
            } else if (event.type === 'FIRE') {
                officersNeeded = 4; // Crowd control and evacuation perimeter
                vehiclesNeeded = 2;
            }

            const resourcesAvailable = 
                this.allocateResource('policeOfficers', officersNeeded) && 
                this.allocateResource('patrolVehicles', vehiclesNeeded);

            if (resourcesAvailable) {
                
                // Cross-Domain Coordination based on context
                if (event.type === 'FIRE') {
                    this.sendMessage('FireAgent', `Evacuation perimeter established at ${event.location}. Awaiting your command.`);
                } else if (event.type === 'ACCIDENT' && event.severity === 'Critical') {
                    this.sendMessage('TrafficAgent', `Police securing accident zone at ${event.location}. Requesting immediate intersection closure.`);
                }

                decision = this._createDecision(
                    event.severity,
                    0.94, // High confidence in standard operating procedures
                    { policeOfficers: officersNeeded, patrolVehicles: vehiclesNeeded },
                    `Dispatched ${vehiclesNeeded} patrol units and ${officersNeeded} officers to secure the area and manage civilian safety at ${event.location}.`,
                    ['Potential crowd panic', 'Unauthorized civilian entry into hazardous zone'],
                    event.type === 'FIRE' ? ['FireAgent', 'TrafficAgent'] : ['TrafficAgent', 'HospitalAgent']
                );
            } else {
                // Resource exhaustion scenario
                decision = this._createDecision(
                    'High',
                    0.75,
                    {},
                    `Insufficient patrol vehicles available in the sector. Diverting units from lower-priority tasks.`,
                    ['Delayed response time', 'Unsecured incident perimeter'],
                    ['CommandCenterAgent']
                );
            }
        }

        return decision;
    }
}

module.exports = PoliceAgent;