(function () {
  var defaultBase =
    window.location &&
    window.location.protocol !== 'file:' &&
    window.location.hostname
      ? window.location.protocol + '//' + window.location.hostname + ':3001/api'
      : 'http://localhost:3001/api';

  window.IMS_API_BASE_URL = window.IMS_API_BASE_URL || defaultBase;

  async function request(path, options) {
    var response = await fetch(window.IMS_API_BASE_URL + path, options || {});
    var contentType = response.headers.get('content-type') || '';
    var payload =
      contentType.indexOf('application/json') >= 0
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      var message =
        payload && typeof payload === 'object'
          ? payload.message || payload.error || 'Request failed'
          : String(payload || 'Request failed');
      var error = new Error(message);
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  function getErrorMessage(error) {
    if (!error) {
      return 'Something went wrong';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }

    if (typeof error.message === 'string') {
      return error.message;
    }

    return 'Something went wrong';
  }

  window.IMS_HTTP = {
    request: request,
    getErrorMessage: getErrorMessage,
  };
})();
