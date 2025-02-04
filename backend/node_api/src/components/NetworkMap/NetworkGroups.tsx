import React from 'react';

interface Node {
    id: string;
    name: string;
    group: string; // Grouping property
}

const NetworkGroups: React.FC<{ nodes: Node[] }> = ({ nodes }) => {
    // Group nodes by their group property
    const groupedNodes = nodes.reduce((groups: { [key: string]: Node[] }, node) => {
        if (!groups[node.group]) {
            groups[node.group] = [];
        }
        groups[node.group].push(node);
        return groups;
    }, {});

    return (
        <div>
            <h2>Device Groups</h2>
            {Object.keys(groupedNodes).map(group => (
                <div key={group}>
                    <h3>{group}</h3>
                    <ul>
                        {groupedNodes[group].map(node => (
                            <li key={node.id}>{node.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default NetworkGroups;
