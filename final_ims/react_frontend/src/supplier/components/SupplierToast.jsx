import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToast, hideToast } from '../redux/slices/uiSlice';

/**
 * Toast notification for the supplier module (Redux & Prop integrated).
 * Auto-dismisses after 3 seconds.
 */
export default function SupplierToast({ message: propMessage, type: propType, onClose }) {
  const dispatch = useDispatch();
  let reduxToast = { show: false, message: '', type: 'ok' };
  try {
    reduxToast = useSelector(selectToast) || reduxToast;
  } catch {
    // Graceful fallback if rendered outside Redux provider
  }

  const message = propMessage !== undefined ? propMessage : (reduxToast.show ? reduxToast.message : '');
  const type = propType || reduxToast.type || 'success';

  const handleClose = () => {
    if (onClose) onClose();
    try {
      dispatch(hideToast());
    } catch {}
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => handleClose(), 3000);
    return () => clearTimeout(timer);
  }, [message]);

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
