import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Speed,
  Memory,
  NetworkCheck,
  Storage,
  History,
  Warning,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { NetworkNode } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface NetworkDetailsProps {
  node: NetworkNode;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    sx={{ p: 2 }}
  >
    {value === index && children}
  </Box>
);

const NetworkDetails: React.FC<NetworkDetailsProps> = ({ node, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // TODO: Implement refresh logic
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Paper
      sx={{
        width: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Device Details
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <Refresh />
        </IconButton>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {isLoading && <LinearProgress />}

      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{node.hostname}</Typography>
        <Typography color="textSecondary" gutterBottom>
          {node.ip_address}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            size="small"
            label={node.status}
            color={
              node.status === 'online' ? 'success' :
              node.status === 'warning' ? 'warning' : 'error'
            }
          />
          <Chip
            size="small"
            label={node.type}
            variant="outlined"
          />
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant="fullWidth"
      >
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="History" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <List>
            <ListItem>
              <ListItemText
                primary="System Information"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      OS: {node.system_info?.os}
                    </Typography>
                    <Typography variant="body2">
                      Uptime: {node.system_info?.uptime}
                    </Typography>
                    <Typography variant="body2">
                      Last Scan: {new Date(node.last_scan).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Resource Usage"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        CPU Usage
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={node.cpu_usage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {node.cpu_usage}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Memory Usage
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={node.memory_usage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {node.memory_usage}%
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Network Statistics"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Inbound: {formatBytes(node.network_stats?.inbound || 0)}/s
                    </Typography>
                    <Typography variant="body2">
                      Outbound: {formatBytes(node.network_stats?.outbound || 0)}/s
                    </Typography>
                    <Typography variant="body2">
                      Latency: {node.network_stats?.latency || 0}ms
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resource Usage Over Time
            </Typography>
            <ResponsiveContainer>
              <LineChart data={node.performance_history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8884d8"
                  name="CPU"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#82ca9d"
                  name="Memory"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {node.event_history?.map((event, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={event.type}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {event.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(event.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Box>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Settings />}
          onClick={() => {/* TODO: Implement device settings */}}
        >
          Device Settings
        </Button>
      </Box>
    </Paper>
  );
};

export default NetworkDetails;