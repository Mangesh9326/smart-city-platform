const BaseAgent = require('./BaseAgent');

class CitizenAgent extends BaseAgent {
    constructor() {
        super('CitizenAgent', {
            callCenterAgents: 50,
            emergencyShelters: 10,
            broadcastBandwidth: 100 // Percentage of notification network capacity
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        // Citizen agent responds to ANY critical event, or direct citizen complaints
        if (event.severity === 'Critical' || event.type === 'CITIZEN_COMPLAINT' || event.type === 'WEATHER_ALERT') {
            
            let sheltersNeeded = 0;
            let broadcastRequired = 10; // 10% network usage for standard alerts
            
            if (event.severity === 'Critical' && (event.type === 'FIRE' || event.type === 'FLOOD')) {
                sheltersNeeded = 2;
                broadcastRequired = 50; // Mass emergency broadcast
            }

            const resourcesAvailable = 
                this.allocateResource('emergencyShelters', sheltersNeeded) && 
                this.allocateResource('broadcastBandwidth', broadcastRequired);

            if (resourcesAvailable) {
                // Cross-Domain Coordination
                if (sheltersNeeded > 0) {
                    this.sendMessage('PoliceAgent', `Opening ${sheltersNeeded} emergency shelters near ${event.location}. Requesting officers for crowd control and security.`);
                    this.sendMessage('HospitalAgent', `Shelters active near ${event.location}. Please allocate triage teams if possible.`);
                }

                let reasoning = `Issued targeted mobile alerts to citizens near ${event.location} to avoid the area.`;
                if (sheltersNeeded > 0) {
                    reasoning = `CRITICAL: Issued mass evacuation order. Opened ${sheltersNeeded} emergency shelters for displaced residents from ${event.location}.`;
                }

                decision = this._createDecision(
                    event.severity,
                    0.98, // Broadcasting alerts has high confidence of execution
                    { emergencyShelters: sheltersNeeded, broadcastBandwidth: broadcastRequired },
                    reasoning,
                    ['Public panic', 'Network congestion due to mass alerts', 'Overcrowding at shelters'],
                    sheltersNeeded > 0 ? ['PoliceAgent', 'HospitalAgent'] : ['TrafficAgent']
                );
            } else {
                decision = this._createDecision(
                    'High',
                    0.60,
                    {},
                    `Insufficient emergency shelters available. Requesting state-level disaster assistance for citizen relocation.`,
                    ['Severe public risk', 'Unsheltered civilians in hazard zones'],
                    ['CommandCenterAgent']
                );
            }
        }

        return decision;
    }
}

module.exports = CitizenAgent;