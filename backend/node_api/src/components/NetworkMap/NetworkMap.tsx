import React, { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { NetworkNode, NetworkLink } from '../../types/network';

interface NetworkMapProps {
  width?: number;
  height?: number;
}

const NetworkMap: React.FC<NetworkMapProps> = ({
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links, loading } = useSelector(
    (state: RootState) => state.network
  );

  useEffect(() => {
    if (!svgRef.current || loading || !nodes.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g');

    // Add circles to nodes
    node.append('circle')
      .attr('r', 10)
      .attr('fill', (d: any) => getNodeColor(d.type));

    // Add labels to nodes
    node.append('text')
      .text((d: any) => d.hostname)
      .attr('x', 12)
      .attr('y', 3)
      .style('font-size', '12px')
      .style('fill', '#fff');

    // Add tooltips
    node.append('title')
      .text((d: any) => `${d.hostname}\n${d.ip}`);

    // Add drag behavior
    node.call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height, loading]);

  const getNodeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      router: '#e74c3c',
      switch: '#3498db',
      server: '#2ecc71',
      workstation: '#f1c40f',
      default: '#95a5a6',
    };
    return colors[type] || colors.default;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <Typography>Loading network map...</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <svg ref={svgRef} />
      </CardContent>
    </Card>
  );
};

export default NetworkMap;