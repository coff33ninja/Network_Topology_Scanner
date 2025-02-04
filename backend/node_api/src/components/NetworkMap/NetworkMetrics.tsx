import React from 'react';

interface Node {
    id: string;
    name: string;
    status: string; // e.g., 'active', 'inactive'
}

const NetworkMetrics: React.FC<{ nodes: Node[] }> = ({ nodes }) => {
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter(node => node.status === 'active').length;
    const inactiveNodes = totalNodes - activeNodes;

    return (
        <div>
            <h2>Network Metrics</h2>
            <p>Total Nodes: {totalNodes}</p>
            <p>Active Nodes: {activeNodes}</p>
            <p>Inactive Nodes: {inactiveNodes}</p>
        </div>
    );
};

export default NetworkMetrics;
