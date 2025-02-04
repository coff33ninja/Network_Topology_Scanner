import React, { useState } from 'react';

interface Node {
    id: string;
    name: string;
}

const NetworkSearch: React.FC<{ nodes: Node[]; onSearch: (query: string) => void }> = ({ nodes, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
            />
            <ul>
                {nodes
                    .filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(node => (
                        <li key={node.id}>{node.name}</li>
                    ))}
            </ul>
        </div>
    );
};

export default NetworkSearch;
