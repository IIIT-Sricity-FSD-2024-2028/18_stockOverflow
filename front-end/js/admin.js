document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Session Management
  const session = DB.getCurrentSession();
  
  if (!session || session.role.toLowerCase() !== 'admin') {
    // If testing without login, you can uncomment the next line to bypass
    // alert('Access Denied. You must be logged in as an Admin.');
    // window.location.href = '../auth/login.html';
  } else {
    // Populate header with user details
    const navName = document.getElementById('navName');
    const navRole = document.getElementById('navRole');
    const navAvatar = document.getElementById('navAvatar');
    
    if (navName) navName.textContent = session.name;
    if (navRole) navRole.textContent = session.role === 'admin' ? 'Administrator' : session.role;
    if (navAvatar) {
      const initials = session.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      navAvatar.textContent = initials;
    }
  }

  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      DB.logout();
      window.location.href = '../index.html';
    });
  }

  // Helper Badge Renderers
  const getRoleBadge = (role) => {
    let colorClass = 'badge-primary';
    if(role.toLowerCase() === 'supplier') colorClass = 'badge-warning';
    if(role.toLowerCase() === 'consumer') colorClass = 'badge-success';
    if(role.toLowerCase() === 'admin') colorClass = 'badge-danger';
    return `<span class="badge ${colorClass}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>`;
  };

  const getStatusBadge = (status) => {
    let colorClass = 'badge-success';
    if(status === 'Warning') colorClass = 'badge-warning';
    if(status === 'Inactive') colorClass = 'badge-danger';
    return `<span class="badge ${colorClass}">${status}</span>`;
  };


  // --- DASHBOARD METRICS ---
  const isDashboard = document.getElementById('totalRetailers');
  if (isDashboard) {
    const users = DB.getUsers();
    const inventory = DB.getInventory ? DB.getInventory() : [];
    
    let ret = 0, sup = 0, con = 0;
    users.forEach(u => {
      let r = u.role.toLowerCase();
      if(r==='retailer') ret++;
      else if(r==='supplier') sup++;
      else if(r==='consumer') con++;
    });

    const elRetailers = document.getElementById('totalRetailers');
    if (elRetailers) elRetailers.textContent = ret;

    const elSuppliers = document.getElementById('totalSuppliers');
    if (elSuppliers) elSuppliers.textContent = sup;
    
    const elConsumers = document.getElementById('totalConsumers');
    if (elConsumers) elConsumers.textContent = con;
    
    const elLowStock = document.getElementById('lowStockAlerts');
    if (elLowStock) {
      const lowStockCount = inventory.filter(item => {
        const qty = item.stockLevel !== undefined ? Number(item.stockLevel) : Number(item.qty || 0);
        const min = item.min ? Number(item.min) : 10;
        return qty <= min;
      }).length;
      elLowStock.textContent = lowStockCount;
    }
  }

  // --- USERS MODULE (CRUD) ---
  const usersTable = document.getElementById('usersTable');
  if (usersTable) {
    // Render
    const tbody = usersTable.querySelector('tbody');
    let users = DB.getUsers();

    const renderUsers = (data) => {
      tbody.innerHTML = '';
      data.forEach(user => {
        const initials = user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        let bg = '#eff6ff'; // default blue
        let txt = 'var(--primary-color)';
        if(user.role === 'supplier') { bg = '#fef3c7'; txt = 'var(--warning-color)'; }
        if(user.role === 'consumer') { bg = '#d1fae5'; txt = 'var(--success-color)'; }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background-color: ${bg}; color: ${txt}; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem;">
                ${initials}
              </div>
              <span style="font-weight: 500;">${user.name}</span>
            </div>
          </td>
          <td style="color: var(--text-muted);">${user.email}</td>
          <td>${getRoleBadge(user.role)}</td>
          <td style="color: var(--text-muted);">${user.store || '-'}</td>
          <td>${getStatusBadge(user.status)}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;" class="action-btns">
              <button class="btn-icon btn-view" title="View">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn-icon btn-edit" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              ${user.role.toLowerCase() !== 'admin' ? `
              <button class="btn-icon text-danger btn-delete" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>` : ''}
            </div>
          </td>
        `;

        // Add event listeners for actual functionality
        tr.querySelector('.btn-view').addEventListener('click', () => window.viewUser(user.id));
        tr.querySelector('.btn-edit').addEventListener('click', () => window.editUser(user.id));
        const delBtn = tr.querySelector('.btn-delete');
        if(delBtn) delBtn.addEventListener('click', () => window.deleteUser(user.id));

        tbody.appendChild(tr);
      });
      document.getElementById('userCount').textContent = `Showing ${data.length} users`;
    };

    renderUsers(users);

    // Filters
    const searchInput = document.getElementById('userSearch');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');

    const filterData = () => {
      const q = searchInput.value.toLowerCase();
      const r = roleFilter.value;
      const s = statusFilter.value;
      
      const filtered = users.filter(u => {
        const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchR = r ? u.role.toLowerCase() === r.toLowerCase() : true;
        const matchS = s ? u.status === s : true;
        return matchQ && matchR && matchS;
      });
      renderUsers(filtered);
    };

    if(searchInput) searchInput.addEventListener('input', filterData);
    if(roleFilter) roleFilter.addEventListener('change', filterData);
    if(statusFilter) statusFilter.addEventListener('change', filterData);

    // Global Functions for modal actions
    window.openUserModal = () => {
      document.getElementById('userForm').reset();
      document.getElementById('userId').value = '';
      document.getElementById('modalTitle').textContent = 'Add User';
      document.getElementById('pass_group').style.display = 'block'; // force pass on new
      document.getElementById('u_password').setAttribute('required', 'required');
      document.getElementById('userModal').classList.add('active');
    };

    window.closeUserModal = () => {
      document.getElementById('userModal').classList.remove('active');
    };

    // Define global handlers first to ensure they are available to onclick
    window.viewUser = (id) => {
      const user = users.find(u => u.id == id);
      if(!user) return;
      const initials = user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
      document.getElementById('v_avatar').textContent = initials;
      document.getElementById('v_name').textContent = user.name;
      document.getElementById('v_email').textContent = user.email;
      document.getElementById('v_status').textContent = user.status;
      document.getElementById('v_store').textContent = user.store || 'Not assigned';
      document.getElementById('v_id').textContent = user.id;
      document.getElementById('v_role_badge').innerHTML = getRoleBadge(user.role);
      document.getElementById('viewUserModal').classList.add('active');
    };

    window.closeViewModal = () => {
      document.getElementById('viewUserModal').classList.remove('active');
    };

    let userIdToDelete = null;

    window.closeDeleteModal = () => {
      document.getElementById('deleteConfirmModal').classList.remove('active');
      userIdToDelete = null;
    };

    window.deleteUser = (id) => {
      console.log('Opening delete confirmation for:', id);
      userIdToDelete = id;
      document.getElementById('deleteConfirmModal').classList.add('active');
    };

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (!userIdToDelete) return;
        
        let currentUsers = DB.getUsers(); 
        const updatedUsers = currentUsers.filter(u => u.id != userIdToDelete); 
        DB.saveUsers(updatedUsers);
        
        // Sync local state and refresh UI
        users = updatedUsers; 
        renderUsers(users);
        
        console.log('User deleted successfully via custom modal.');
        window.closeDeleteModal();
      };
    }

    window.editUser = (id) => {
      const user = users.find(u => u.id == id);
      if(!user) return;
      document.getElementById('modalTitle').textContent = 'Edit User';
      document.getElementById('userId').value = user.id;
      document.getElementById('u_name').value = user.name;
      document.getElementById('u_email').value = user.email;
      document.getElementById('u_role').value = user.role.toLowerCase();
      document.getElementById('u_status').value = user.status;
      document.getElementById('u_store').value = user.store;
      document.getElementById('pass_group').style.display = 'none';
      document.getElementById('u_password').removeAttribute('required');
      document.getElementById('userModal').classList.add('active');
    };

    renderUsers(users);

    // Form Submit
    document.getElementById('userForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('userId').value;
      const newData = {
        name: document.getElementById('u_name').value,
        email: document.getElementById('u_email').value,
        role: document.getElementById('u_role').value,
        status: document.getElementById('u_status').value,
        store: document.getElementById('u_store').value
      };

      if (id) {
        // Edit
        const idx = users.findIndex(u => u.id === id);
        users[idx] = { ...users[idx], ...newData };
      } else {
        // Create
        newData.id = Date.now().toString();
        newData.password = document.getElementById('u_password').value; // In real app, hash this
        users.push(newData);
      }

      DB.saveUsers(users);
      renderUsers(users);
      if(elTotals) elTotals.textContent = users.length;
      closeUserModal();
    });
  }


  // --- ROLES MODULE ---
  const roleList = document.getElementById('roleList');
  if (roleList) {
    let roles = DB.getRoles();
    let currentRoleIndex = 0; // Default to first role

    const renderRoleList = () => {
      roleList.innerHTML = '';
      roles.forEach((role, idx) => {
        const li = document.createElement('li');
        li.style.padding = '1rem 1.5rem';
        li.style.cursor = 'pointer';
        li.style.borderLeft = idx === currentRoleIndex ? '3px solid var(--primary-color)' : '3px solid transparent';
        li.style.backgroundColor = idx === currentRoleIndex ? 'var(--primary-light)' : 'transparent';
        
        li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background-color: #fff; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${idx === currentRoleIndex ? 'var(--primary-color)' : 'var(--text-muted)'}" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div>
              <div style="font-weight: 500; font-size: 0.95rem; color: ${idx === currentRoleIndex ? 'var(--primary-color)' : 'var(--text-main)'};">${role.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${role.description.substring(0, 30)}...</div>
            </div>
          </div>
        `;
        li.onclick = () => {
          currentRoleIndex = idx;
          renderRoleList();
          renderPermissions();
        };
        roleList.appendChild(li);
      });
    };

    const permMap = {
      viewInventory: { label: 'View Inventory', desc: 'View all inventory items' },
      editInventory: { label: 'Edit Inventory', desc: 'Add, edit, and remove inventory items' },
      manageOrders: { label: 'Manage Orders', desc: 'Create, view, and manage orders' },
      updateDeliveryStatus: { label: 'Update Delivery Status', desc: 'Update order delivery status' },
      viewReports: { label: 'View Reports', desc: 'Access and view system reports' },
      manageUsers: { label: 'Manage Users', desc: 'Add, edit, and remove users' }
    };

    const renderPermissions = () => {
      const role = roles[currentRoleIndex];
      document.getElementById('currentRoleTitle').innerHTML = `
        ${role.name} Permissions
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
      `;
      document.getElementById('currentRoleDesc').textContent = role.description;

      const pTable = document.getElementById('permissionsTable');
      pTable.innerHTML = '';
      
      Object.keys(permMap).forEach(k => {
        const val = role.permissions[k];
        const tr = document.createElement('tr');
        
        let iconHtml = val 
          ? `<div style="width: 24px; height: 24px; border-radius: 6px; background-color: #d1fae5; color: var(--success-color); display: flex; align-items: center; justify-content: center; margin-right: 1rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`
          : `<div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef2f2; color: var(--danger-color); display: flex; align-items: center; justify-content: center; margin-right: 1rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>`;
          
        tr.innerHTML = `
          <td>
            <div style="display: flex; align-items: center;">
              ${iconHtml}
              <span style="font-weight: 500;">${permMap[k].label}</span>
            </div>
          </td>
          <td style="color: var(--text-muted);">${permMap[k].desc}</td>
          <td style="text-align: right;">
            <label class="switch">
              <input type="checkbox" id="perm_${k}" ${val ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
        `;
        pTable.appendChild(tr);
      });
    };

    window.saveRolePermissions = () => {
      const role = roles[currentRoleIndex];
      Object.keys(permMap).forEach(k => {
        role.permissions[k] = document.getElementById(`perm_${k}`).checked;
      });
      DB.saveRoles(roles);
      alert('Permissions saved successfully!');
      renderPermissions();
    };

    // Create New Role modal
    window.openCreateRoleModal = () => {
      const overlay = document.getElementById('createRoleOverlay');
      if(overlay) {
        overlay.classList.add('active');
        // Reset form
        document.getElementById('newRoleName').value = '';
        document.getElementById('newRoleDesc').value = '';
        document.querySelectorAll('.new-perm-toggle').forEach(el => el.checked = false);
      }
    };
    window.closeCreateRoleModal = () => {
      const overlay = document.getElementById('createRoleOverlay');
      if(overlay) overlay.classList.remove('active');
    };
    window.submitNewRole = () => {
      const name = document.getElementById('newRoleName').value.trim();
      const desc = document.getElementById('newRoleDesc').value.trim();
      if(!name) { alert('Please enter a role name.'); return; }
      const perms = {};
      Object.keys(permMap).forEach(k => {
        const el = document.getElementById('newperm_' + k);
        perms[k] = el ? el.checked : false;
      });
      roles.push({ name, description: desc || 'Custom role', permissions: perms });
      DB.saveRoles(roles);
      closeCreateRoleModal();
      currentRoleIndex = roles.length - 1;
      renderRoleList();
      renderPermissions();
    };

    renderRoleList();
    renderPermissions();
  }
});
