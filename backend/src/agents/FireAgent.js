const BaseAgent = require('./BaseAgent');

class FireAgent extends BaseAgent {
    constructor() {
        super('FireAgent', {
            fireTrucks: 20,
            rescueTeams: 15,
            hazmatUnits: 3,
            waterTankers: 10
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        // Fire agents also respond to severe accidents (extrication) and infrastructure leaks
        if (event.type === 'FIRE' || (event.type === 'ACCIDENT' && event.severity === 'Critical') || event.type === 'GAS_LEAKAGE') {
            
            let trucksNeeded = 0;
            let rescueNeeded = 0;
            let hazmatNeeded = 0;

            if (event.type === 'FIRE') {
                trucksNeeded = event.severity === 'Critical' ? 4 : 2;
                rescueNeeded = event.severity === 'Critical' ? 3 : 1;
            } else if (event.type === 'GAS_LEAKAGE') {
                hazmatNeeded = 1;
                rescueNeeded = 1;
            } else if (event.type === 'ACCIDENT') {
                rescueNeeded = 1; // Jaws of life / vehicle extraction
                trucksNeeded = 1; // Fire prevention for fuel spills
            }

            const resourcesAvailable = 
                this.allocateResource('fireTrucks', trucksNeeded) && 
                this.allocateResource('rescueTeams', rescueNeeded) &&
                this.allocateResource('hazmatUnits', hazmatNeeded);

            if (resourcesAvailable) {
                
                // Cross-Domain Coordination: Fire dictates actions to Utilities and Police
                if (event.type === 'FIRE' || event.type === 'GAS_LEAKAGE') {
                    this.sendMessage('UtilityAgent', `Critical hazard at ${event.location}. Requesting immediate shutdown of local gas and power lines.`);
                    this.sendMessage('PoliceAgent', `Hazardous zone at ${event.location}. Need 200-meter evacuation perimeter immediately.`);
                }

                decision = this._createDecision(
                    event.severity === 'Medium' ? 'High' : 'Critical', // Fire inherently escalates priority
                    0.89,
                    { fireTrucks: trucksNeeded, rescueTeams: rescueNeeded, hazmatUnits: hazmatNeeded },
                    `Fire likely to spread or cause secondary hazards. Dispatched ${trucksNeeded} trucks and ${rescueNeeded} rescue teams to ${event.location}.`,
                    ['Structural collapse', 'Explosion risk from nearby utilities'],
                    ['PoliceAgent', 'UtilityAgent', 'HospitalAgent']
                );
            } else {
                decision = this._createDecision(
                    'Critical',
                    0.99,
                    {},
                    `CRITICAL: No available fire trucks for ${event.location}. Initiating mutual aid request to neighboring municipalities.`,
                    ['Uncontrolled fire spread', 'Severe loss of life and property'],
                    ['CommandCenterAgent', 'UtilityAgent'] // Utility must isolate the area if Fire can't fight it
                );
            }
        }

        return decision;
    }
}

module.exports = FireAgent;