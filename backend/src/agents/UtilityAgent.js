const BaseAgent = require('./BaseAgent');

class UtilityAgent extends BaseAgent {
    constructor() {
        super('UtilityAgent', {
            repairCrews: 30,
            utilityEngineers: 15,
            waterPumps: 20,
            mobileGenerators: 10
        });
    }

    async evaluate(event) {
        this.memory.activeIncidents.push(event.id);
        let decision = null;

        if (event.type === 'FIRE' || event.type === 'GAS_LEAKAGE' || event.type === 'POWER_FAILURE' || event.type === 'FLOOD') {
            
            let crewsNeeded = 0;
            let engineersNeeded = 0;
            let pumpsNeeded = 0;

            if (event.type === 'POWER_FAILURE') {
                crewsNeeded = 2;
                engineersNeeded = 1;
            } else if (event.type === 'GAS_LEAKAGE' || event.type === 'FIRE') {
                engineersNeeded = 2; // Needed to isolate and shut down grid/gas lines safely
            } else if (event.type === 'FLOOD') {
                crewsNeeded = 3;
                pumpsNeeded = 5;
            }

            const resourcesAvailable = 
                this.allocateResource('repairCrews', crewsNeeded) && 
                this.allocateResource('utilityEngineers', engineersNeeded) &&
                this.allocateResource('waterPumps', pumpsNeeded);

            if (resourcesAvailable) {
                // Cross-Domain Coordination
                if (event.type === 'FIRE' || event.type === 'GAS_LEAKAGE') {
                    this.sendMessage('FireAgent', `Gas and power isolated in a 500m radius around ${event.location}. Safe for fire suppression.`);
                } else if (event.type === 'POWER_FAILURE') {
                    this.sendMessage('TrafficAgent', `Grid failure at ${event.location}. Traffic signals may be offline. Please deploy manual traffic officers.`);
                    this.sendMessage('HospitalAgent', `Grid failure detected near hospital zone. Confirming backup generator status.`);
                }

                decision = this._createDecision(
                    event.severity,
                    0.91,
                    { repairCrews: crewsNeeded, utilityEngineers: engineersNeeded, waterPumps: pumpsNeeded },
                    event.type === 'FIRE' ? 
                        `Shutting down local gas and power grid to prevent secondary explosions at ${event.location}. Dispatched ${engineersNeeded} engineers.` :
                        `Dispatched ${crewsNeeded} repair crews to manage infrastructure failure at ${event.location}.`,
                    ['Extended power outage for local residents', 'Secondary infrastructure cascade'],
                    ['FireAgent', 'TrafficAgent', 'HospitalAgent']
                );
            } else {
                decision = this._createDecision(
                    'Critical',
                    0.85,
                    {},
                    `Insufficient utility engineers available to isolate grid at ${event.location}. Remote shutdown initiated with broader blast radius.`,
                    ['Unintended city-wide blackouts', 'Delayed service restoration'],
                    ['CommandCenterAgent']
                );
            }
        }

        return decision;
    }
}

module.exports = UtilityAgent;