import React from 'react';

/**
 * Reusable modal backdrop + container for supplier module.
 * Clicking outside the modal closes it.
 */
export default function SupplierModal({ open, onClose, wide, children }) {
  if (!open) return null;

  return (
    <div className="sup-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`sup-modal${wide ? ' wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
