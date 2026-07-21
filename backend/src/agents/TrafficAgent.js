const BaseAgent = require('./BaseAgent');

class TrafficAgent extends BaseAgent {
    constructor() {
        super('TrafficAgent', {
            trafficOfficers: 50,
            towTrucks: 15,
            roadBarriers: 100
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        if (event.type === 'ACCIDENT' || event.type === 'ROAD_CLOSURE') {
            const officersNeeded = event.severity === 'Critical' ? 4 : 2;
            const towTrucksNeeded = event.severity === 'Critical' ? 2 : 1;
            
            const resourcesAvailable = this.allocateResource('trafficOfficers', officersNeeded) && 
                                       this.allocateResource('towTrucks', towTrucksNeeded);

            if (resourcesAvailable) {
                // Cross-Domain Coordination: Notify Hospital if severity is critical
                if (event.severity === 'Critical') {
                    this.sendMessage('HospitalAgent', `Road blocked near ${event.location}. Recommend ambulance rerouting.`);
                }

                decision = this._createDecision(
                    event.severity,
                    0.92, // Confidence
                    { trafficOfficers: officersNeeded, towTrucks: towTrucksNeeded },
                    `Traffic congestion expected to increase by 45% because lanes are blocked at ${event.location}. Rerouting traffic and deploying officers.`,
                    ['Secondary collisions due to sudden braking', 'Gridlock on alternative routes'],
                    ['PoliceAgent', 'HospitalAgent']
                );
            } else {
                decision = this._createDecision(
                    'High',
                    0.60,
                    {},
                    `Insufficient tow trucks available. Requesting external municipal assistance.`,
                    ['Severe traffic gridlock'],
                    ['CommandCenterAgent']
                );
            }
        }

        return decision;
    }
}

module.exports = TrafficAgent;