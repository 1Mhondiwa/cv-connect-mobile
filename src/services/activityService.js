import { EventSourcePolyfill } from 'event-source-polyfill';
import { store } from '../store/store';
import { updateDashboardActivities } from '../store/slices/freelancerSlice';

class ActivityService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
  }

  // Connect to SSE endpoint for real-time activity updates
  connect(userId, token) {
    if (this.isConnected) {
      console.log('Activity service already connected');
      return;
    }

    try {
      const url = `http://10.0.0.14:5000/api/freelancer/activity/stream`;
      
      this.eventSource = new EventSourcePolyfill(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      this.setupEventHandlers();
      this.isConnected = true;
      console.log('Activity service connected successfully');
    } catch (error) {
      console.error('Failed to connect to activity service:', error);
      this.scheduleReconnect();
    }
  }

  // Setup event handlers for SSE
  setupEventHandlers() {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('Activity SSE connection opened');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Activity update received:', data);
        this.handleActivityUpdate(data);
      } catch (error) {
        console.error('Error parsing activity SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('Activity SSE connection error:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    };

    this.eventSource.onclose = () => {
      console.log('Activity SSE connection closed');
      this.isConnected = false;
      this.scheduleReconnect();
    };
  }

  // Handle incoming activity updates
  handleActivityUpdate(data) {
    if (data.type === 'activity_updated' && data.activities) {
      // Update the Redux store with new activities
      store.dispatch(updateDashboardActivities(data.activities));
    } else if (data.type === 'new_activity' && data.activity) {
      // Add new single activity to the store
      const currentActivities = store.getState().freelancer.dashboardData?.recent_activity || [];
      const updatedActivities = [data.activity, ...currentActivities].slice(0, 10); // Keep only 10 most recent
      store.dispatch(updateDashboardActivities(updatedActivities));
    }
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.reconnect();
      }
    }, this.reconnectDelay);
  }

  // Attempt to reconnect
  reconnect() {
    console.log('Attempting to reconnect to activity service...');
    this.disconnect();
    
    // Get current user token from store
    const state = store.getState();
    const token = state.auth.token;
    const userId = state.auth.user?.user_id;

    if (token && userId) {
      this.connect(userId, token);
    }
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    console.log('Activity service disconnected');
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Manually refresh activities (fallback)
  async refreshActivities() {
    try {
      // This will trigger a manual refresh of dashboard data
      // The existing getDashboardData action will handle this
      console.log('Manual activity refresh triggered');
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  }
}

// Create singleton instance
const activityService = new ActivityService();

export default activityService;

