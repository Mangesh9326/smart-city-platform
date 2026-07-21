class CommandCenterAgent {
    constructor() {
        this.name = 'CommandCenterAgent';
        this.memory = { cityWideIncidents: [] };
    }

    fuseDecisions(originalEvent, agentDecisions, interAgentMessages) {
        this.memory.cityWideIncidents.push(originalEvent.id);

        // 1. Calculate Collaboration Score
        const participatingAgents = agentDecisions.length;
        const coordinationComplexity = interAgentMessages.length > 0 ? 'High' : 'Low';
        const collaborationScore = Math.min((participatingAgents * 10) + (interAgentMessages.length * 15), 100);

        // 2. Resolve Global Priority
        const hasCritical = agentDecisions.some(d => d.priority === 'Critical');
        const finalPriority = hasCritical ? 'Critical' : originalEvent.severity;

        // 3. Aggregate Resources & Actions
        const totalAllocatedResources = {};
        const followUpActions = [];
        
        agentDecisions.forEach(d => {
            Object.assign(totalAllocatedResources, d.requiredResources);
            followUpActions.push(`Monitor execution of ${d.agent} response.`);
        });

        if (finalPriority === 'Critical') {
            followUpActions.push('Activate Level 2 Emergency Response Protocol.');
        }

        // 4. Generate the Final Structured Payload
        return {
            eventId: originalEvent.id,
            timestamp: originalEvent.timestamp,
            location: originalEvent.location,
            globalStatus: 'Coordinated Response Active',
            priority: finalPriority,
            collaborationMetrics: {
                participatingAgents,
                coordinationComplexity,
                collaborationScore: `${collaborationScore}/100`,
                estimatedSystemResolution: '45 mins'
            },
            activatedAgents: agentDecisions.map(d => d.agent),
            departmentDecisions: agentDecisions,
            interAgentCommunications: interAgentMessages,
            commandCenterDirective: `Unified response authorized. Priority ${finalPriority} established across ${participatingAgents} departments.`,
            aggregatedResources: totalAllocatedResources,
            suggestedFollowUpActions: followUpActions
        };
    }
}

module.exports = CommandCenterAgent;