import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  useTheme,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  CenterFocusStrong,
  SaveAlt,
} from '@mui/icons-material';
import { ForceGraph2D } from 'react-force-graph';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNetworkData } from '../../store/slices/networkMapSlice';
import NetworkControls from './NetworkControls';
import NetworkDetails from './NetworkDetails';
import { NetworkNode, NetworkLink } from '../../types';

const NetworkMap: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const graphRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const {
    nodes,
    links,
    loading,
    error,
  } = useSelector((state: RootState) => state.networkMap);

  useEffect(() => {
    dispatch(fetchNetworkData());
  }, [dispatch]);

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    if (graphRef.current) {
      const newZoom = zoomLevel * 1.2;
      graphRef.current.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const newZoom = zoomLevel / 1.2;
      graphRef.current.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

  const handleCenterView = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 1000);
      setZoomLevel(1);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchNetworkData());
  };

  const handleExportImage = () => {
    if (graphRef.current) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = 'network-map.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  const nodeColor = (node: NetworkNode) => {
    switch (node.status) {
      case 'online':
        return theme.palette.success.main;
      case 'offline':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading && !nodes.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            p: 1,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Center View">
            <IconButton onClick={handleCenterView} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export as Image">
            <IconButton onClick={handleExportImage} size="small">
              <SaveAlt />
            </IconButton>
          </Tooltip>
        </Paper>

        <ForceGraph2D
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeColor={nodeColor}
          nodeLabel={(node: NetworkNode) => `${node.hostname}\n${node.ip_address}`}
          linkColor={() => theme.palette.grey[400]}
          linkWidth={2}
          nodeRelSize={8}
          onNodeClick={handleNodeClick}
          backgroundColor={theme.palette.background.default}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          cooldownTicks={100}
          onEngineStop={() => {
            // Save node positions for persistence
            const nodePositions = nodes.map((node: NetworkNode) => ({
              id: node.id,
              x: node.x,
              y: node.y,
            }));
            localStorage.setItem('nodePositions', JSON.stringify(nodePositions));
          }}
        />

        <NetworkControls
          onFilterChange={() => {}} // TODO: Implement filtering
          onLayoutChange={() => {}} // TODO: Implement layout changes
        />
      </Box>

      {selectedNode && (
        <NetworkDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </Box>
  );
};

export default NetworkMap;