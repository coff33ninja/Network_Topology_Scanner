import React, { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  FilterList,
  ViewModule,
  ViewComfy,
  Settings,
} from '@mui/icons-material';

interface NetworkControlsProps {
  onFilterChange: (filters: any) => void;
  onLayoutChange: (layout: string) => void;
}

const NetworkControls: React.FC<NetworkControlsProps> = ({
  onFilterChange,
  onLayoutChange,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    showLabels: true,
    showMetrics: false,
  });

  const handleFilterChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const newFilters = {
      ...filters,
      [field]: event.target.value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleToggleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFilters = {
      ...filters,
      [field]: event.target.checked,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
        p: 2,
        width: 300,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Network Controls
        </Typography>
        <Tooltip title="Layout Settings">
          <IconButton size="small">
            <Settings />
          </IconButton>
        </Tooltip>
      </Box>

      <TextField
        fullWidth
        size="small"
        label="Search devices"
        value={filters.search}
        onChange={handleFilterChange('search')}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleFilterChange('status')}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            label="Type"
            onChange={handleFilterChange('type')}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="router">Routers</MenuItem>
            <MenuItem value="switch">Switches</MenuItem>
            <MenuItem value="server">Servers</MenuItem>
            <MenuItem value="workstation">Workstations</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Display Options
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={filters.showLabels}
              onChange={handleToggleChange('showLabels')}
              size="small"
            />
          }
          label="Show Labels"
        />
        <FormControlLabel
          control={
            <Switch
              checked={filters.showMetrics}
              onChange={handleToggleChange('showMetrics')}
              size="small"
            />
          }
          label="Show Metrics"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Layout
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Force Layout">
            <IconButton
              size="small"
              onClick={() => onLayoutChange('force')}
            >
              <ViewModule />
            </IconButton>
          </Tooltip>
          <Tooltip title="Grid Layout">
            <IconButton
              size="small"
              onClick={() => onLayoutChange('grid')}
            >
              <ViewComfy />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Active Filters
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.status !== 'all' && (
            <Chip
              label={`Status: ${filters.status}`}
              size="small"
              onDelete={() => handleFilterChange('status')({ target: { value: 'all' } } as any)}
            />
          )}
          {filters.type !== 'all' && (
            <Chip
              label={`Type: ${filters.type}`}
              size="small"
              onDelete={() => handleFilterChange('type')({ target: { value: 'all' } } as any)}
            />
          )}
          {filters.search && (
            <Chip
              label={`Search: ${filters.search}`}
              size="small"
              onDelete={() => handleFilterChange('search')({ target: { value: '' } } as any)}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default NetworkControls;