import React, { CSSProperties } from 'react';

interface NetworkEdgeProps {
    source: { x: number; y: number };
    target: { x: number; y: number };
}

const NetworkEdge: React.FC<NetworkEdgeProps> = ({ source, target }) => {
    const edgeStyle: CSSProperties = {
        position: 'absolute',
        left: Math.min(source.x, target.x),
        top: Math.min(source.y, target.y),
        width: Math.abs(source.x - target.x),
        height: Math.abs(source.y - target.y),
        backgroundColor: 'black', // Change color as needed
        transform: `rotate(${Math.atan2(target.y - source.y, target.x - source.x)}rad)`,
        transformOrigin: '0 0',
    };

    return <div style={edgeStyle} />;
};

export default NetworkEdge;
