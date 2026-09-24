import React, { useEffect } from 'react';

/**
 * Toast notification for the supplier module.
 * Auto-dismisses after 3 seconds.
 */
export default function SupplierToast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isError = type === 'err' || type === 'error';

  return (
    <div className="sup-toast">
      <svg viewBox="0 0 20 20" fill="none" stroke={isError ? '#ef4444' : '#22c55e'} strokeWidth="2">
        {isError ? (
          <>
            <circle cx="10" cy="10" r="8.5" />
            <line x1="7" y1="7" x2="13" y2="13" />
            <line x1="13" y1="7" x2="7" y2="13" />
          </>
        ) : (
          <>
            <circle cx="10" cy="10" r="8.5" />
            <polyline points="6.5,10 9,12.5 13.5,7" />
          </>
        )}
      </svg>
      <span>{message}</span>
    </div>
  );
}
