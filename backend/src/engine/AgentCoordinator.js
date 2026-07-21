const eventBus = require('./EventBus');
const { broadcastDecisionPlan } = require('./socketManager');

// Import Domain Agents
const TrafficAgent = require('../agents/TrafficAgent');
const HospitalAgent = require('../agents/HospitalAgent');
const PoliceAgent = require('../agents/PoliceAgent');
const FireAgent = require('../agents/FireAgent');
const UtilityAgent = require('../agents/UtilityAgent');
const EnvironmentalAgent = require('../agents/EnvironmentalAgent');
const CitizenAgent = require('../agents/CitizenAgent');
const CommandCenterAgent = require('../agents/CommandCenterAgent');

class AgentCoordinator {
    constructor() {
        // Initialize all independent agents with their isolated resource pools
        this.agents = [
            new TrafficAgent(),
            new HospitalAgent(),
            new PoliceAgent(),
            new FireAgent(),
            new UtilityAgent(),
            new EnvironmentalAgent(),
            new CitizenAgent()
        ];
        
        this.commandCenter = new CommandCenterAgent();
        this.messageLog = [];

        // Track inter-agent communication for the Command Center payload
        eventBus.on('INTER_AGENT_MESSAGE', (msg) => {
            this.messageLog.push(msg);
            console.log(`[EVENT BUS] ${msg.from} -> ${msg.to}: ${msg.message}`);
        });
    }

    async processCityEvent(eventPayload) {
        console.log(`[COORDINATOR] Ingesting Event: ${eventPayload.type} at ${eventPayload.location} (Severity: ${eventPayload.severity})`);
        
        // Reset the message log for this specific evaluation cycle
        this.messageLog = [];

        // 1. Parallel Evaluation: All agents evaluate the event independently simultaneously
        const agentPromises = this.agents.map(agent => agent.evaluate(eventPayload));
        const results = await Promise.all(agentPromises);

        // 2. Filter out agents that determined the event was outside their domain (returned null)
        const activeDecisions = results.filter(decision => decision !== null);

        if (activeDecisions.length === 0) {
            console.log(`[COORDINATOR] Event ${eventPayload.id} required no agent action.`);
            return null;
        }

        // 3. Decision Fusion: Command Center merges the independent decisions and inter-agent messages
        const finalCoordinatedPlan = this.commandCenter.fuseDecisions(
            eventPayload, 
            activeDecisions, 
            this.messageLog
        );

        // 4. Broadcast Output: Push the structured JSON to the React Frontend via Socket.IO
        broadcastDecisionPlan(finalCoordinatedPlan);
        console.log(`[COORDINATOR] Unified Plan Broadcasted. Priority: ${finalCoordinatedPlan.priority}`);

        return finalCoordinatedPlan;
    }
}

module.exports = new AgentCoordinator();