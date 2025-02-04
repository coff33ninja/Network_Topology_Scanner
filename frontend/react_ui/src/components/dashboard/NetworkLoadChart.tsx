import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { NetworkActivityPoint } from '../../types';

interface NetworkLoadChartProps {
  data: NetworkActivityPoint[];
}

const NetworkLoadChart: React.FC<NetworkLoadChartProps> = ({ data }) => {
  const theme = useTheme();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} GB`;
    }
    return `${value.toFixed(1)} MB`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">
            {formatTime(label)}
          </Typography>
          {payload.map((entry: any) => (
            <Typography
              key={entry.dataKey}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatValue(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Network Load
      </Typography>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke={theme.palette.text.secondary}
          />
          <YAxis
            tickFormatter={formatValue}
            stroke={theme.palette.text.secondary}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="inbound"
            name="Inbound Traffic"
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="outbound"
            name="Outbound Traffic"
            stroke={theme.palette.secondary.main}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NetworkLoadChart;