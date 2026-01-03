/**
 * Real-time Availability Service
 * WebSocket-based availability updates
 */

/**
 * Real-time Availability Manager
 * Handles WebSocket connections for live availability updates
 */
export class AvailabilityManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.hotelAvailability = new Map();
  }

  /**
   * Connect to WebSocket
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.apiUrl.replace('http', 'ws');
        this.ws = new WebSocket(`${wsUrl}/availability`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type, hotelId, availability, rooms, price } = data;

    switch (type) {
      case 'availability_update':
        this.updateHotelAvailability(hotelId, { availability, rooms, price });
        break;

      case 'price_change':
        this.notifyListeners(`price-${hotelId}`, { hotelId, price });
        break;

      case 'room_released':
        this.notifyListeners(`rooms-${hotelId}`, { hotelId, rooms, availability });
        break;

      case 'last_room_alert':
        this.notifyListeners(`alert-${hotelId}`, { hotelId, message: 'Last room available!' });
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Update local availability cache
   */
  updateHotelAvailability(hotelId, data) {
    this.hotelAvailability.set(hotelId, {
      ...this.hotelAvailability.get(hotelId),
      ...data,
      lastUpdated: new Date().toISOString(),
    });

    this.notifyListeners(`availability-${hotelId}`, data);
  }

  /**
   * Subscribe to hotel availability updates
   */
  subscribeToHotel(hotelId, callback) {
    const key = `availability-${hotelId}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
      // Send subscription message to server
      this.send({
        type: 'subscribe',
        hotelId,
      });
    }

    this.listeners.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }

      // Unsubscribe from server if no listeners
      if (listeners.length === 0) {
        this.send({
          type: 'unsubscribe',
          hotelId,
        });
      }
    };
  }

  /**
   * Subscribe to price changes
   */
  subscribeToPriceChange(hotelId, callback) {
    const key = `price-${hotelId}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key).push(callback);

    return () => {
      const listeners = this.listeners.get(key);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Reconnect on disconnect
   */
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect().catch(() => {
          // Retry will happen in onclose
        });
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  /**
   * Get cached availability
   */
  getAvailability(hotelId) {
    return this.hotelAvailability.get(hotelId);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.listeners.clear();
      this.hotelAvailability.clear();
    }
  }
}

/**
 * React Hook for Real-time Availability
 * Usage: const { available, rooms, price } = useRealTimeAvailability(hotelId, availabilityManager);
 */
export const useRealTimeAvailability = (hotelId, availabilityManager) => {
  const [data, setData] = React.useState({
    available: true,
    rooms: 0,
    price: null,
    lastUpdated: null,
  });

  React.useEffect(() => {
    if (!hotelId || !availabilityManager) return;

    // Set initial data from cache
    const cachedData = availabilityManager.getAvailability(hotelId);
    if (cachedData) {
      setData((prev) => ({ ...prev, ...cachedData }));
    }

    // Subscribe to updates
    const unsubscribe = availabilityManager.subscribeToHotel(hotelId, (update) => {
      setData((prev) => ({
        ...prev,
        ...update,
        lastUpdated: new Date().toISOString(),
      }));
    });

    return unsubscribe;
  }, [hotelId, availabilityManager]);

  return data;
};

/**
 * React Hook for Price Changes
 * Usage: const { price, priceHistory } = useRealTimePrice(hotelId, availabilityManager);
 */
export const useRealTimePrice = (hotelId, availabilityManager) => {
  const [price, setPrice] = React.useState(null);
  const [priceHistory, setPriceHistory] = React.useState([]);

  React.useEffect(() => {
    if (!hotelId || !availabilityManager) return;

    const unsubscribe = availabilityManager.subscribeToPriceChange(hotelId, (data) => {
      setPrice(data.price);
      setPriceHistory((prev) => [
        ...prev,
        {
          price: data.price,
          timestamp: new Date().toISOString(),
        },
      ].slice(-10)); // Keep last 10 price points
    });

    return unsubscribe;
  }, [hotelId, availabilityManager]);

  return { price, priceHistory };
};

/**
 * Initialize Availability Manager
 * Should be called once in your app (e.g., in App.jsx or a context)
 */
export const initializeAvailabilityManager = (apiUrl) => {
  const manager = new AvailabilityManager(apiUrl);
  manager.connect().catch((error) => {
    console.error('Failed to connect to availability service:', error);
  });
  return manager;
};

export default {
  AvailabilityManager,
  useRealTimeAvailability,
  useRealTimePrice,
  initializeAvailabilityManager,
};
