const BaseAgent = require('./BaseAgent');

class HospitalAgent extends BaseAgent {
    constructor() {
        super('HospitalAgent', {
            ambulances: 25,
            medicalTeams: 40,
            icuBeds: 12 // Memory tracks ICU capacity
        });
    }

    async evaluate(event) {
        let decision = null;

        if (event.type === 'ACCIDENT' || event.type === 'MEDICAL_EMERGENCY') {
            const ambulancesNeeded = event.metadata.injuries || 1;
            
            if (this.allocateResource('ambulances', ambulancesNeeded)) {
                this.allocateResource('icuBeds', ambulancesNeeded); // Simulate reserving beds
                
                // Check memory for ICU overload
                if (this.resources.icuBeds <= 2) {
                    this.sendMessage('TrafficAgent', `Critical patient incoming from ${event.location}. Need green corridor.`);
                    
                    decision = this._createDecision(
                        'Critical',
                        0.88,
                        { ambulances: ambulancesNeeded, icuBeds: ambulancesNeeded },
                        `Hospital ICU occupancy exceeding safe limits (Beds left: ${this.resources.icuBeds}). Dispatching ambulances and preparing alternative routing for secondary patients.`,
                        ['Ambulance delay due to traffic', 'ICU capacity breached'],
                        ['TrafficAgent']
                    );
                } else {
                    decision = this._createDecision(
                        event.severity,
                        0.95,
                        { ambulances: ambulancesNeeded },
                        `Dispatched ${ambulancesNeeded} ambulance(s) to ${event.location}. Medical teams on standby.`,
                        ['None'],
                        []
                    );
                }
            }
        }

        return decision;
    }
}

module.exports = HospitalAgent;