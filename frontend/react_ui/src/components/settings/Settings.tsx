import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Slider,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { updateSettings } from '../../store/slices/settingsSlice';
import { Settings as SettingsType } from '../../types';

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

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error } = useSelector(
    (state: RootState) => state.settings
  );
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [tabValue, setTabValue] = useState(0);
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (field: keyof SettingsType, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateSettings(localSettings)).unwrap();
      setSaveStatus({
        show: true,
        type: 'success',
        message: 'Settings saved successfully',
      });
    } catch (err) {
      setSaveStatus({
        show: true,
        type: 'error',
        message: 'Failed to save settings',
      });
    }

    setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <Box>
      {saveStatus.show && (
        <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
          {saveStatus.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="General" />
              <Tab label="Scanning" />
              <Tab label="Notifications" />
              <Tab label="Advanced" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data Retention (days)"
                  type="number"
                  value={localSettings.retentionDays}
                  onChange={(e) =>
                    handleChange('retentionDays', parseInt(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.autoWakeOnLan}
                      onChange={(e) =>
                        handleChange('autoWakeOnLan', e.target.checked)
                      }
                    />
                  }
                  label="Enable Wake-on-LAN"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Scanning Settings
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scan Interval (minutes)"
                  type="number"
                  value={localSettings.scanInterval}
                  onChange={(e) =>
                    handleChange('scanInterval', parseInt(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>CPU Usage Limit</Typography>
                <Slider
                  value={localSettings.alertThresholds.cpu}
                  onChange={(e, value) =>
                    handleChange('alertThresholds', {
                      ...localSettings.alertThresholds,
                      cpu: value,
                    })
                  }
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.emailNotifications}
                      onChange={(e) =>
                        handleChange('emailNotifications', e.target.checked)
                      }
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Alert Thresholds</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Memory Usage (%)"
                      type="number"
                      value={localSettings.alertThresholds.memory}
                      onChange={(e) =>
                        handleChange('alertThresholds', {
                          ...localSettings.alertThresholds,
                          memory: parseInt(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Network Usage (%)"
                      type="number"
                      value={localSettings.alertThresholds.network}
                      onChange={(e) =>
                        handleChange('alertThresholds', {
                          ...localSettings.alertThresholds,
                          network: parseInt(e.target.value),
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  These settings can affect system performance. Change with caution.
                </Alert>
              </Grid>
              {/* Add advanced settings here */}
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;