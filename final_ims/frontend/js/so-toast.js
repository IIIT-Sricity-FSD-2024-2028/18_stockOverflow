/**
 * Stock Overflow - Custom Website Notification & Confirmation System
 * Replaces native browser alert() and confirm() with styled website toasts & modals.
 */
(function () {
  'use strict';

  // Inject CSS styles for Toast and Confirm Modal
  function injectStyles() {
    if (document.getElementById('so-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'so-toast-styles';
    style.textContent = `
      /* SO Toast Container */
      #so-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        max-width: 380px;
        width: calc(100% - 40px);
      }

      .so-toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.08);
        border-left: 4px solid #5b67ca;
        font-family: 'DM Sans', 'Inter', -apple-system, sans-serif;
        font-size: 13.5px;
        font-weight: 500;
        color: #1e293b;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(30px) scale(0.95);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .so-toast.show {
        opacity: 1;
        transform: translateX(0) scale(1);
      }

      .so-toast-icon {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 700;
      }

      .so-toast-success {
        border-left-color: #10b981;
      }
      .so-toast-success .so-toast-icon {
        background: #d1fae5;
        color: #065f46;
      }

      .so-toast-error {
        border-left-color: #ef4444;
      }
      .so-toast-error .so-toast-icon {
        background: #fee2e2;
        color: #991b1b;
      }

      .so-toast-warning {
        border-left-color: #f59e0b;
      }
      .so-toast-warning .so-toast-icon {
        background: #fef3c7;
        color: #92400e;
      }

      .so-toast-info {
        border-left-color: #5b67ca;
      }
      .so-toast-info .so-toast-icon {
        background: #eef0fd;
        color: #5b67ca;
      }

      .so-toast-message {
        flex: 1;
      }

      .so-toast-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .so-toast-close:hover {
        color: #475569;
      }

      /* SO Custom Confirm Modal */
      .so-confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(4px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
      }

      .so-confirm-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .so-confirm-modal {
        background: #ffffff;
        border-radius: 16px;
        width: 100%;
        max-width: 420px;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        transform: scale(0.9);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'DM Sans', 'Inter', -apple-system, sans-serif;
      }

      .so-confirm-overlay.active .so-confirm-modal {
        transform: scale(1);
      }

      .so-confirm-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .so-confirm-title-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #eef0fd;
        color: #5b67ca;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }

      .so-confirm-body {
        font-size: 14px;
        color: #475569;
        line-height: 1.5;
        margin-bottom: 24px;
      }

      .so-confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .so-confirm-btn {
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 13.5px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .so-confirm-btn-cancel {
        background: #f1f5f9;
        color: #475569;
      }
      .so-confirm-btn-cancel:hover {
        background: #e2e8f0;
        color: #1e293b;
      }

      .so-confirm-btn-ok {
        background: #5b67ca;
        color: #ffffff;
      }
      .so-confirm-btn-ok:hover {
        background: #4a54b3;
      }

      .so-confirm-btn-danger {
        background: #ef4444;
        color: #ffffff;
      }
      .so-confirm-btn-danger:hover {
        background: #dc2626;
      }
    `;
    document.head.appendChild(style);
  }

  function getContainer() {
    let container = document.getElementById('so-toast-container');
    if (!container) {
      injectStyles();
      container = document.createElement('div');
      container.id = 'so-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type) {
    type = type || 'info';
    if (type === 'err' || type === 'danger') type = 'error';

    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `so-toast so-toast-${type}`;

    let iconSymbol = 'ℹ';
    if (type === 'success') iconSymbol = '✓';
    if (type === 'error') iconSymbol = '✕';
    if (type === 'warning') iconSymbol = '⚠';

    toast.innerHTML = `
      <div class="so-toast-icon">${iconSymbol}</div>
      <div class="so-toast-message">${escapeHtml(message)}</div>
      <button class="so-toast-close">&times;</button>
    `;

    toast.querySelector('.so-toast-close').addEventListener('click', () => {
      dismissToast(toast);
    });

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      dismissToast(toast);
    }, 3800);
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function confirmModal(message, title, isDanger) {
    return new Promise((resolve) => {
      injectStyles();

      const overlay = document.createElement('div');
      overlay.className = 'so-confirm-overlay';

      const okClass = isDanger ? 'so-confirm-btn-danger' : 'so-confirm-btn-ok';

      overlay.innerHTML = `
        <div class="so-confirm-modal">
          <div class="so-confirm-title">
            <div class="so-confirm-title-icon">${isDanger ? '⚠' : '💬'}</div>
            <span>${escapeHtml(title || 'Confirm Action')}</span>
          </div>
          <div class="so-confirm-body">${escapeHtml(message)}</div>
          <div class="so-confirm-actions">
            <button class="so-confirm-btn so-confirm-btn-cancel" id="soConfirmCancel">Cancel</button>
            <button class="so-confirm-btn ${okClass}" id="soConfirmOk">Confirm</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });

      function close(result) {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          resolve(result);
        }, 200);
      }

      overlay.querySelector('#soConfirmCancel').addEventListener('click', () => close(false));
      overlay.querySelector('#soConfirmOk').addEventListener('click', () => close(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
    });
  }

  // Global SOToast API
  window.SOToast = {
    show: showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
    warning: (msg) => showToast(msg, 'warning'),
    confirm: confirmModal,
  };

  // Override window.alert to automatically use website primary toast
  window.alert = function (msg) {
    if (!msg) return;
    showToast(String(msg), 'info');
  };
})();
