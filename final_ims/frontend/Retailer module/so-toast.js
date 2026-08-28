(function() {
  window.showToast = window.showToast || function(message, type) {
    if (window.RetailerUi && window.RetailerUi.showToast) {
      window.RetailerUi.showToast(message, type);
      return;
    }
    console.log('[Toast]', type || 'info', message);
  };
})();
