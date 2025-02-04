import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { networkApi } from '../../services/api';
import { NetworkNode, NetworkLink } from '../../types/network';

interface NetworkState {
  nodes: NetworkNode[];
  links: NetworkLink[];
  loading: boolean;
  error: string | null;
  selectedNode: NetworkNode | null;
  layout: 'force' | 'hierarchical' | 'circular';
}

const initialState: NetworkState = {
  nodes: [],
  links: [],
  loading: false,
  error: null,
  selectedNode: null,
  layout: 'force',
};

export const fetchNetworkTopology = createAsyncThunk(
  'network/fetchTopology',
  async () => {
    const response = await networkApi.getTopology();
    return response.data;
  }
);

export const updateNetworkLayout = createAsyncThunk(
  'network/updateLayout',
  async (layout: NetworkState['layout']) => {
    const response = await networkApi.updateLayout(layout);
    return response.data;
  }
);

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    clearSelectedNode: (state) => {
      state.selectedNode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkTopology.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetworkTopology.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload.nodes;
        state.links = action.payload.links;
      })
      .addCase(fetchNetworkTopology.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch network topology';
      })
      .addCase(updateNetworkLayout.fulfilled, (state, action) => {
        state.nodes = action.payload.nodes;
        state.links = action.payload.links;
      });
  },
});

export const { setSelectedNode, setLayout, clearSelectedNode } =
  networkSlice.actions;

export default networkSlice.reducer;