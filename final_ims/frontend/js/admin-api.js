(function () {
  function readSession() {
    try {
      return JSON.parse(localStorage.getItem('so_session') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function getAdminScope() {
    const session = readSession();
    if (!session) {
      return {};
    }

    const role = String(session.role || '').toLowerCase();
    if (role !== 'admin') {
      return {};
    }

    return {
      adminId: String(session.id || '').trim(),
    };
  }

  function withQuery(path, params) {
    const search = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        search.set(key, String(value).trim());
      }
    });
    const suffix = search.toString();
    return suffix ? path + (path.indexOf('?') >= 0 ? '&' : '?') + suffix : path;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Dashboard
  async function getDashboardStats() {
    return window.IMS_HTTP.request('/admin/dashboard/stats');
  }

  // User Management
  async function getAllUsers() {
    return window.IMS_HTTP.request('/admin/users');
  }

  async function getUserById(id) {
    if (!id) {
      return null;
    }
    return window.IMS_HTTP.request('/admin/users/' + encodeURIComponent(id));
  }

  async function createUser(payload) {
    return window.IMS_HTTP.request('/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function updateUser(id, payload) {
    return window.IMS_HTTP.request('/admin/users/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function deleteUser(id) {
    return window.IMS_HTTP.request('/admin/users/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  // Role Management
  async function getAllRoles() {
    return window.IMS_HTTP.request('/admin/roles');
  }

  async function getRoleById(id) {
    if (!id) {
      return null;
    }
    return window.IMS_HTTP.request('/admin/roles/' + encodeURIComponent(id));
  }

  async function createRole(payload) {
    return window.IMS_HTTP.request('/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function updateRole(id, payload) {
    return window.IMS_HTTP.request('/admin/roles/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function deleteRole(id) {
    return window.IMS_HTTP.request('/admin/roles/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  // Store Management
  async function getAllStores() {
    return window.IMS_HTTP.request('/admin/stores');
  }

  async function getStoreById(id) {
    if (!id) {
      return null;
    }
    return window.IMS_HTTP.request('/admin/stores/' + encodeURIComponent(id));
  }

  async function createStore(payload) {
    return window.IMS_HTTP.request('/admin/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function updateStore(id, payload) {
    return window.IMS_HTTP.request('/admin/stores/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function deleteStore(id) {
    return window.IMS_HTTP.request('/admin/stores/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  }

  // System Settings
  async function getSystemSettings() {
    return window.IMS_HTTP.request('/admin/settings');
  }

  async function updateSystemSettings(payload) {
    return window.IMS_HTTP.request('/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  window.AdminApi = {
    getDashboardStats,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    getSystemSettings,
    updateSystemSettings,
  };
})();