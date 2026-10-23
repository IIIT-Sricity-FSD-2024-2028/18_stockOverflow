import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/**
 * DataSyncContext - Cross-Module Real-time Synchronization Service
 * 
 * Provides:
 * 1. Instant same-tab event bus (`emitDataSync`)
 * 2. Multi-tab live coordination (`BroadcastChannel('stockoverflow_sync')`)
 * 3. 5-second resilient polling heartbeat (`useDataSync`)
 * 4. Automatic refresh on tab focus / window visibilitychange
 */

export const SYNC_TOPICS = {
  ALL: 'all',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  TRANSACTIONS: 'transactions',
  REVENUE: 'revenue',
  ASSIGNMENTS: 'assignments',
  USERS: 'users',
  STORES: 'stores',
};

const CHANNEL_NAME = 'stockoverflow_sync';
let broadcastChannel = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (_err) {
  broadcastChannel = null;
}

/**
 * Globally emit a data change to notify all active views & tabs.
 * Can be called inside React components or plain JS API helpers.
 */
export function emitDataSync(topic = 'all', payload = {}) {
  const eventData = {
    topic,
    payload,
    timestamp: Date.now(),
  };

  // 1. Same-tab CustomEvent
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('so_datasync', { detail: eventData }));
    } catch (_e) {}
  }

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(eventData);
    } catch (_e) {}
  }
}

const DataSyncContext = createContext({
  emitSync: emitDataSync,
  lastSyncEvent: null,
});

export function DataSyncProvider({ children }) {
  const [lastSyncEvent, setLastSyncEvent] = useState(null);

  useEffect(() => {
    const handleSync = (data) => {
      setLastSyncEvent(data);
    };

    // Listen to same-tab events
    const onLocalEvent = (e) => {
      if (e.detail) handleSync(e.detail);
    };
    window.addEventListener('so_datasync', onLocalEvent);

    // Listen to cross-tab BroadcastChannel messages
    if (broadcastChannel) {
      broadcastChannel.onmessage = (e) => {
        if (e.data) {
          handleSync(e.data);
          // Also dispatch locally so local custom event listeners receive it
          window.dispatchEvent(new CustomEvent('so_datasync', { detail: e.data }));
        }
      };
    }

    return () => {
      window.removeEventListener('so_datasync', onLocalEvent);
    };
  }, []);

  return (
    <DataSyncContext.Provider value={{ emitSync: emitDataSync, lastSyncEvent }}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSyncContext() {
  return useContext(DataSyncContext);
}

/**
 * Custom hook to keep any view or table synchronized with backend mutations.
 * 
 * @param {string|string[]} topics - Topic or array of topics to subscribe to ('products', 'orders', etc.)
 * @param {Function} onSync - Callback function to refresh data (async or sync)
 * @param {Object} options - { intervalMs: 5000, enabled: true, runImmediately: false }
 */
export function useDataSync(topics, onSync, options = {}) {
  const {
    intervalMs = 0,
    enabled = true,
    runImmediately = false,
  } = options;

  const topicList = useRef(Array.isArray(topics) ? topics : [topics]);
  topicList.current = Array.isArray(topics) ? topics : [topics];

  const callbackRef = useRef(onSync);
  callbackRef.current = onSync;

  const trigger = useCallback(() => {
    if (!enabled || !callbackRef.current) return;
    try {
      callbackRef.current();
    } catch (err) {
      console.warn('[DataSync] callback error:', err);
    }
  }, [enabled]);

  // Run on mount if requested
  useEffect(() => {
    if (runImmediately && enabled) {
      trigger();
    }
  }, [runImmediately, enabled, trigger]);

  // Listen to same-tab and cross-tab events
  useEffect(() => {
    if (!enabled) return;

    const handleEvent = (e) => {
      const eventDetail = e.detail;
      if (!eventDetail || !eventDetail.topic) return;

      const currentTopics = topicList.current;
      const matches =
        eventDetail.topic === 'all' ||
        currentTopics.includes('all') ||
        currentTopics.includes(eventDetail.topic);

      if (matches) {
        trigger();
      }
    };

    window.addEventListener('so_datasync', handleEvent);
    return () => {
      window.removeEventListener('so_datasync', handleEvent);
    };
  }, [enabled, trigger]);

  // 5-second resilient polling heartbeat (only when tab is active/visible)
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        trigger();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, trigger]);

  // Instant refresh when user returns to this browser tab
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        trigger();
      }
    };

    const handleFocus = () => {
      trigger();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, trigger]);
}
