import React from 'react';

/**
 * NotificationToast Component
 * 
 * Props:
 * - message: string (the message text to show)
 * - visible: boolean (whether the toast is currently visible)
 */
export default function NotificationToast({ message, visible }) {
  if (!visible || !message) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <span className="toast-icon">✓</span>
      <span className="toast-text">{message}</span>
    </div>
  );
}
