/**
 * NotificationToast_consumer.jsx - Temporary Floating Success / Alert Notification
 * 
 * IN LAYMAN'S TERMS:
 * A subtle, floating popup badge at the bottom-right of the screen that flashes
 * quick confirmations like "Added to cart!" or "Store updated!".
 */

import React from 'react';

export default function NotificationToast_consumer({ message, visible }) {
  if (!visible || !message) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <span className="toast-icon">✓</span>
      <span className="toast-text">{message}</span>
    </div>
  );
}
