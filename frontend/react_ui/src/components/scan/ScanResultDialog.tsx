import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ScanResult, Device } from '../../types';

interface ScanResultDialogProps {
  open: boolean;
  scan: ScanResult | null;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '16px 0' }}>
    {value === index && children}
  </div>
);

const DeviceTable: React.FC<{ devices: Device[], title: string }> = ({ devices, title }) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>{title}</Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hostname</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>MAC Address</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Services</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>{device.hostname}</TableCell>
              <TableCell>{device.ip_address}</TableCell>
              <TableCell>{device.mac_address}</TableCell>
              <TableCell>
                <Chip
                  label={device.device_type}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {device.services.map((service) => (
                  <Chip
                    key={service.id}
                    label={`${service.port}/${service.service_name}`}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const ScanResultDialog: React.FC<ScanResultDialogProps> = ({
  open,
  scan,
  onClose,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  if (!scan) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Scan Results - {new Date(scan.start_time).toLocaleString()}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Summary" />
            <Tab label="New Devices" />
            <Tab label="Changed Devices" />
            <Tab label="Offline Devices" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Scan Type: {scan.type}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Status: {scan.status}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Duration: {
                scan.end_time
                  ? `${Math.round((new Date(scan.end_time).getTime() - new Date(scan.start_time).getTime()) / 1000)}s`
                  : 'N/A'
              }
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total Devices Found: {scan.devices_found}
            </Typography>
            {scan.error && (
              <Typography color="error" gutterBottom>
                Error: {scan.error}
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DeviceTable
            devices={scan.details.new_devices}
            title="New Devices Discovered"
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DeviceTable
            devices={scan.details.changed_devices}
            title="Devices with Changes"
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DeviceTable
            devices={scan.details.offline_devices}
            title="Devices Gone Offline"
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanResultDialog;