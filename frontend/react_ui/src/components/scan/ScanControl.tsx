import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { startScan, cancelScan } from '../../store/slices/scanSlice';
import { ScanOptions } from '../../types';

const ScanControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentScan, loading } = useSelector((state: RootState) => state.scan);
  const [scanOptions, setScanOptions] = useState<ScanOptions>({
    type: 'quick',
    service_detection: true,
  });

  const handleStartScan = async () => {
    await dispatch(startScan(scanOptions));
  };

  const handleCancelScan = async () => {
    if (currentScan) {
      await dispatch(cancelScan(currentScan.id));
    }
  };

  const handleOptionChange = (field: keyof ScanOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setScanOptions({
      ...scanOptions,
      [field]: field === 'service_detection' ? event.target.checked : event.target.value,
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Network Scan
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Scan Type"
              value={scanOptions.type}
              onChange={handleOptionChange('type')}
              disabled={!!currentScan}
            >
              <MenuItem value="quick">Quick Scan</MenuItem>
              <MenuItem value="full">Full Scan</MenuItem>
              <MenuItem value="custom">Custom Scan</MenuItem>
            </TextField>
          </Grid>

          {scanOptions.type === 'custom' && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Target Network"
                  placeholder="e.g., 192.168.1.0/24"
                  value={scanOptions.target_network || ''}
                  onChange={handleOptionChange('target_network')}
                  disabled={!!currentScan}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Port Range"
                  placeholder="e.g., 1-1024"
                  value={scanOptions.port_range || ''}
                  onChange={handleOptionChange('port_range')}
                  disabled={!!currentScan}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={scanOptions.service_detection}
                  onChange={handleOptionChange('service_detection')}
                  disabled={!!currentScan}
                />
              }
              label="Enable Service Detection"
            />
          </Grid>
        </Grid>

        {currentScan ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {currentScan.status === 'running'
                  ? `Scanning... (${currentScan.progress}%)`
                  : `Scan ${currentScan.status}`}
              </Typography>
              <Typography variant="body2">
                Devices found: {currentScan.devices_found}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={currentScan.progress}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleCancelScan}
              disabled={currentScan.status !== 'running'}
            >
              Cancel Scan
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<StartIcon />}
            onClick={handleStartScan}
            disabled={loading}
          >
            Start Scan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanControl;