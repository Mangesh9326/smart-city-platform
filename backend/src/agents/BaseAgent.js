const eventBus = require('../engine/EventBus');

class BaseAgent {
    constructor(name, initialResources) {
        this.name = name;
        this.memory = {
            activeIncidents: [],
            pastIncidents: [],
            workload: 0,
            recentDecisions: []
        };
        this.resources = initialResources;
        this.messagesReceived = [];

        // Listen for direct inter-agent messages
        eventBus.on('INTER_AGENT_MESSAGE', (payload) => {
            if (payload.to === this.name || payload.to === 'ALL') {
                this.messagesReceived.push(payload);
            }
        });
    }

    // Resource Management
    allocateResource(resourceType, amount) {
        if (this.resources[resourceType] !== undefined && this.resources[resourceType] >= amount) {
            this.resources[resourceType] -= amount;
            this.memory.workload += amount;
            return true;
        }
        return false;
    }

    // Inter-Agent Communication
    sendMessage(targetAgent, message) {
        eventBus.emit('INTER_AGENT_MESSAGE', {
            from: this.name,
            to: targetAgent,
            message: message,
            timestamp: Date.now()
        });
    }

    // Base Evaluation Interface (Must be overridden by specific agents)
    async evaluate(event) {
        throw new Error(`[${this.name}] evaluate() method not implemented.`);
    }

    _createDecision(priority, confidence, resources, reasoning, risks, collaboratingAgents) {
        this.memory.recentDecisions.push({ timestamp: Date.now(), reasoning });
        return {
            agent: this.name,
            decision: true,
            priority,
            confidence,
            requiredResources: resources,
            estimatedCompletionTime: `${Math.floor(Math.random() * 30) + 15} mins`, // Simulated ETA
            reasoning,
            potentialRisks: risks,
            suggestedCollaboratingAgents: collaboratingAgents
        };
    }
}

module.exports = BaseAgent;