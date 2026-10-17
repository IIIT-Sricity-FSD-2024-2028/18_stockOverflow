import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../api/client';

export default function MultiStoreView() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChecks, setSelectedChecks] = useState({});
  const [checkAll, setCheckAll] = useState(false);

  // Drawer state
  const [activeDrawerStore, setActiveDrawerStore] = useState(null);
  const [drawerStats, setDrawerStats] = useState({
    netProfit: 0,
    netSales: 0,
    netPurchase: 0,
    invValue: 0,
    totalUnits: 0,
    totalSalesCount: 0,
    totalPoCount: 0,
    products: [],
    alerts: [],
  });
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Fetch real stores and live product counts matching vanilla
  useEffect(() => {
    async function loadStores() {
      try {
        setLoading(true);

        // User session info
        const retailerId = user?.retailerId || user?.profileId || (user?.role === 'retailer' ? user?.id : '') || '';
        const storeId = user?.currentStoreId || user?.storeId || '';
        const scopedQuery = retailerId
          ? `?retailerId=${encodeURIComponent(retailerId)}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`
          : '';

        // 1. Fetch live products from backend
        const liveProducts = await request(`/products${scopedQuery}`).catch(() => []);
        const prods = Array.isArray(liveProducts) ? liveProducts : [];
        const totalStockCount = prods.reduce(
          (sum, p) => sum + (Number(p.qty != null ? p.qty : p.initialQty) || 0),
          0
        );
        const totalProductCount = prods.length;

        // 2. Fetch candidate stores from API
        const storesQuery = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : '';
        const apiStores = await request(`/stores${storesQuery}`).catch(() => []);
        let candidateStores = Array.isArray(apiStores) ? [...apiStores] : [];

        const retailerName = String(user?.name || (user?.email ? user.email.split('@')[0] : 'Store Manager')).trim();
        const profileStores = Array.isArray(user?.profile?.stores) ? user.profile.stores : [];

        // Match stores associated with active retailer
        let matchedStores = candidateStores.filter((store) => {
          const storeId = String(store.id || store.code || '').toUpperCase();
          const storeRetailerId = String(store.retailerId || '').trim();
          const activeStoreId = String(user?.storeId || user?.currentStoreId || '').toUpperCase();

          if (retailerId && storeRetailerId === retailerId) return true;
          if (activeStoreId && (storeId === activeStoreId || store.name === user?.store)) return true;
          return false;
        });

        // If none matched in API stores, use profile stores or session store
        if (!matchedStores.length) {
          if (profileStores.length > 0) {
            matchedStores = profileStores.map((s, idx) => ({
              id: s.code || s.storeId || s.id || `STORE-0${idx + 1}`,
              code: s.code || `STORE-0${idx + 1}`,
              retailerId: retailerId,
              name: s.name,
              location: s.address || 'Main Street',
              manager: s.contactPerson || retailerName,
              phone: s.phone || '+91 98765 43210',
              status: s.status || 'active',
              createdOn: '-',
            }));
          } else {
            matchedStores = [
              {
                id: user?.storeId || 'STORE-01',
                code: user?.storeId || 'STORE-01',
                retailerId: retailerId,
                name: user?.store || (user?.profile?.businessName ? `${user.profile.businessName} (Main)` : `${retailerName}'s Store`),
                location: user?.profile?.address || 'Main Commercial Market',
                manager: retailerName,
                phone: user?.profile?.businessPhone || '+91 98765 43210',
                status: 'active',
                createdOn: '-',
              },
            ];
          }
        }

        const formatted = matchedStores.map((s, idx) => {
          const storeId = s.id || s.code || `STORE-0${idx + 1}`;
          const storeName = s.name || user?.store || "Main Store";
          const contact = s.manager || s.contactPerson || s.contact || retailerName;
          const phone = s.phone || s.phoneNumber || '+91 98765 43210';
          const createdOn = s.createdOn || (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '-');
          const status = s.status === 'inactive' ? 'inactive' : 'active';

          return {
            id: storeId,
            code: s.code || storeId,
            name: storeName,
            contact: contact,
            phone: phone,
            totalProducts: totalProductCount,
            totalStock: totalStockCount,
            createdOn: createdOn,
            status: status,
            liveProducts: prods,
          };
        });

        setStores(formatted);
      } catch (err) {
        console.error('Error loading stores:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, [user]);

  // Open Drawer and load real stats
  const handleOpenDrawer = async (store) => {
    setActiveDrawerStore(store);
    setDrawerLoading(true);

    try {
      const [transactions, purchaseOrders, returns] = await Promise.all([
        request('/transactions').catch(() => []),
        request('/purchase-orders').catch(() => []),
        request('/returns').catch(() => []),
      ]);

      const txList = Array.isArray(transactions) ? transactions : [];
      const poList = Array.isArray(purchaseOrders) ? purchaseOrders : [];
      const retList = Array.isArray(returns) ? returns : [];

      const prods = (store.liveProducts || []).map((p) => ({
        sku: p.sku || p.id,
        name: p.name,
        cat: p.category || 'General',
        qty: Number(p.qty != null ? p.qty : p.initialQty) || 0,
        max: Math.max(Number(p.max || p.initialQty || p.qty || 100), 100),
        price: Math.round(Number(p.price || p.priceUSD || 0)),
        emoji: p.emoji || '📦',
      }));

      const totalUnits = prods.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
      const invValue = prods.reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.price) || 0), 0);
      const alerts = prods.filter((p) => p.qty === 0 || (p.max ? p.qty / p.max < 0.2 : false));

      const confirmedReturns = retList.filter((r) => {
        const s = String(r.status || '').toLowerCase();
        return s === 'approved' || s === 'exchanged' || s === 'confirmed';
      });

      const totalSales = txList.reduce((sum, tx) => sum + Number(tx.finalTotal || tx.totalAmount || 0), 0);
      const totalSalesReturn = confirmedReturns
        .filter((r) => String(r.type || '').toLowerCase() !== 'purchase')
        .reduce((sum, r) => sum + Number(r.refundAmount || r.amount || r.total || 0), 0);
      const netSales = Math.max(0, totalSales - totalSalesReturn);

      const deliveredPOs = poList.filter((po) => String(po.status || '').toLowerCase() === 'delivered');
      const totalPurchase = deliveredPOs.reduce((sum, po) => sum + Number(po.total || po.grandTotal || 0), 0);
      const purchaseReturn = confirmedReturns
        .filter((r) => String(r.type || '').toLowerCase() === 'purchase')
        .reduce((sum, r) => sum + Number(r.refundAmount || r.total || 0), 0);
      const netPurchase = Math.max(0, totalPurchase - purchaseReturn);

      const netProfit = Math.max(0, netSales - netPurchase);

      setDrawerStats({
        netProfit,
        netSales,
        netPurchase,
        invValue,
        totalUnits,
        totalSalesCount: txList.length,
        totalPoCount: poList.length,
        products: prods,
        alerts,
      });
    } catch (err) {
      console.error('Error fetching drawer stats:', err);
    } finally {
      setDrawerLoading(false);
    }
  };



  // Filter & sort
  const filtered = stores.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(s.name).toLowerCase().includes(q) ||
      String(s.contact).toLowerCase().includes(q) ||
      String(s.phone).toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (sortKey) {
    filtered.sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return typeof va === 'string' ? va.localeCompare(vb) * sortDir : (va - vb) * sortDir;
    });
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir * -1);
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const toggleStatusFilter = () => {
    const cycle = ['all', 'active', 'inactive'];
    const nextIdx = (cycle.indexOf(statusFilter) + 1) % cycle.length;
    setStatusFilter(cycle[nextIdx]);
  };

  const statusLabels = {
    all: 'Status',
    active: '● Active',
    inactive: '● Inactive',
  };

  const handleCheckAll = (checked) => {
    setCheckAll(checked);
    const updated = {};
    filtered.forEach((s) => {
      updated[s.id] = checked;
    });
    setSelectedChecks(updated);
  };

  const handleRowCheck = (id, checked) => {
    setSelectedChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentSlice = filtered.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  return (
    <div className="page-wrap" style={{ padding: '22px 28px 40px', flex: 1, overflow: 'auto' }}>
      {/* PAGE HEADER */}
      <div className="page-head" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-title" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            Multi Store View
          </div>
          <div className="page-subtitle" style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>
            Inventory / Multi Store View
          </div>
        </div>
      </div>

      {/* TABLE PANEL */}
      <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="filter-search" style={{ display: 'flex', alignItems: 'center', gap: '7px', border: '1px solid var(--border)', borderRadius: '5px', padding: '6px 10px', background: '#fff', maxWidth: '240px', flex: 1 }}>
            <svg viewBox="0 0 13 13" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="8.5" y1="8.5" x2="12" y2="12" />
            </svg>
            <input
              type="text"
              placeholder="Search stores…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: 'var(--text-primary)', width: '100%', background: 'transparent' }}
            />
          </div>

          <div
            className="filter-select"
            onClick={toggleStatusFilter}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '5px', background: '#fff', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <span>{statusLabels[statusFilter]}</span>
            <svg viewBox="0 0 11 11" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="2,4 5.5,7.5 9,4" />
            </svg>
          </div>

          <div style={{ flex: 1 }}></div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Nunito Sans', sans-serif" }}>
            <thead>
              <tr style={{ background: '#f5f6fa' }}>
                <th style={{ width: '52px', padding: '9px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <div className="cb-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      checked={checkAll}
                      onChange={(e) => handleCheckAll(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('name')}
                  style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Store
                    <svg viewBox="0 0 10 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                      <polyline points="2,5 5,2 8,5" />
                      <polyline points="2,9 5,12 8,9" />
                    </svg>
                  </div>
                </th>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  Contact Person
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('phone')}
                  style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Phone</div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('totalProducts')}
                  style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Total Products
                    <svg viewBox="0 0 10 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                      <polyline points="2,5 5,2 8,5" />
                      <polyline points="2,9 5,12 8,9" />
                    </svg>
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('totalStock')}
                  style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Total Stock
                    <svg viewBox="0 0 10 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                      <polyline points="2,5 5,2 8,5" />
                      <polyline points="2,9 5,12 8,9" />
                    </svg>
                  </div>
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('createdOn')}
                  style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Created On
                    <svg viewBox="0 0 10 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                      <polyline points="2,5 5,2 8,5" />
                      <polyline points="2,9 5,12 8,9" />
                    </svg>
                  </div>
                </th>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ width: '90px', padding: '9px 16px', borderBottom: '1px solid var(--border)' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontFamily: "'Nunito Sans', sans-serif" }}>
                    Loading stores...
                  </td>
                </tr>
              ) : currentSlice.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontFamily: "'Nunito Sans', sans-serif" }}>
                    No stores associated with your retailer account.
                  </td>
                </tr>
              ) : (
                currentSlice.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f0f2f4', height: '56px', transition: 'background .13s' }}>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                      <div className="cb-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!selectedChecks[s.id]}
                          onChange={(e) => handleRowCheck(s.id, e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(s.contact || 'J').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.contact}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle', color: 'var(--text-secondary)', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px' }}>
                      {s.phone}
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {String(s.totalProducts).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {s.totalStock}
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle', fontFamily: "'Nunito Sans', sans-serif", color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {s.createdOn}
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                      <span className={`status-badge ${s.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '11.5px', fontWeight: 700, background: s.status === 'active' ? '#22c55e' : '#ef4444', color: '#fff' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', flexShrink: 0 }}></span>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', verticalAlign: 'middle' }}>
                      <div className="action-btns" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          className="action-btn"
                          title="View Inventory"
                          onClick={() => handleOpenDrawer(s)}
                          style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .13s' }}
                        >
                          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" />
                            <circle cx="7" cy="7" r="2" />
                          </svg>
                        </div>
                        <div
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this store view?')) {
                              setStores(stores.filter((item) => item.id !== s.id));
                            }
                          }}
                          style={{ width: '30px', height: '30px', borderRadius: '5px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .13s' }}
                        >
                          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="2,3.5 12,3.5" />
                            <path d="M5.5 3.5V2.5h3V3.5" />
                            <path d="M3 3.5l.7 8h6.6l.7-8" />
                            <line x1="5.5" y1="6" x2="5.5" y2="10" />
                            <line x1="8.5" y1="6" x2="8.5" y2="10" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="table-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', background: '#fff' }}>
          <div className="tf-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <div className="rows-select" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Row Per Page
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 6px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', background: '#fff', cursor: 'pointer', outline: 'none' }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
              Entries
            </div>
          </div>

          <div className="tf-pages" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              className="pg-btn"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              style={{ minWidth: '28px', height: '28px', padding: '0 4px', borderRadius: '5px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polyline points="7,2 3,6 7,10" />
              </svg>
            </div>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                className={`pg-btn ${currentPage === idx ? 'active' : ''}`}
                onClick={() => setCurrentPage(idx)}
                style={{ minWidth: '28px', height: '28px', padding: '0 4px', borderRadius: '5px', border: '1px solid var(--border)', background: currentPage === idx ? '#2e6bc5' : '#fff', color: currentPage === idx ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", fontSize: '12px', fontWeight: 700 }}
              >
                {idx + 1}
              </div>
            ))}

            <div
              className="pg-btn"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              style={{ minWidth: '28px', height: '28px', padding: '0 4px', borderRadius: '5px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polyline points="5,2 9,6 5,10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STORE DETAIL DRAWER (EXACT FIGMA / VANILLA PARITY)
      ═══════════════════════════════════════ */}
      {activeDrawerStore && (
        <div
          className="overlay open"
          onClick={() => setActiveDrawerStore(null)}
        >
          <div
            className="drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Head */}
            <div className="drawer-head">
              <div>
                <div className="drawer-title">
                  {activeDrawerStore.name} – Dashboard &amp; Inventory Overview
                </div>
                <div className="drawer-subtitle">
                  Contact: {activeDrawerStore.contact} · {activeDrawerStore.phone}
                </div>
              </div>
              <div
                className="drawer-close"
                onClick={() => setActiveDrawerStore(null)}
              >
                <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="3" x2="11" y2="11" />
                  <line x1="11" y1="3" x2="3" y2="11" />
                </svg>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body">
              {drawerLoading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px' }}>
                  Loading {activeDrawerStore.name} Stats...
                </div>
              ) : (
                <>
                  {/* Mini Dashboard Summary Cards */}
                  <div className="store-metrics">
                    <div className="sm-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div className="sm-label" style={{ color: '#166534' }}>Net Profit</div>
                      <div className="sm-value" style={{ color: '#15803d' }}>
                        ₹{drawerStats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="sm-sub" style={{ color: '#15803d' }}>Net Sales - Net Purchase</div>
                    </div>

                    <div className="sm-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <div className="sm-label" style={{ color: '#1e40af' }}>Net Sales</div>
                      <div className="sm-value" style={{ color: '#1d4ed8' }}>
                        ₹{drawerStats.netSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="sm-sub" style={{ color: '#1d4ed8' }}>{drawerStats.totalSalesCount} Total Sales</div>
                    </div>

                    <div className="sm-card" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                      <div className="sm-label" style={{ color: '#9a3412' }}>Net Purchase</div>
                      <div className="sm-value" style={{ color: '#c2410c' }}>
                        ₹{drawerStats.netPurchase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="sm-sub" style={{ color: '#c2410c' }}>{drawerStats.totalPoCount} Total POs</div>
                    </div>

                    <div className="sm-card" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                      <div className="sm-label" style={{ color: '#6b21a8' }}>Total Inventory Value</div>
                      <div className="sm-value" style={{ color: '#7e22ce' }}>
                        ₹{drawerStats.invValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="sm-sub" style={{ color: '#7e22ce' }}>{drawerStats.totalUnits} Stock Units</div>
                    </div>
                  </div>

                  {/* Two cols: Stock Levels + Alerts / Warehouses */}
                  <div className="drawer-two-col">
                    {/* Left: Stock Levels */}
                    <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                        <svg viewBox="0 0 13 13" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <line x1="1" y1="6.5" x2="12" y2="6.5" />
                          <rect x="2" y="4" width="4" height="5" rx="1" />
                          <rect x="8" y="3" width="3" height="7" rx="1" />
                        </svg>
                        Store Inventory Stock Levels
                      </div>
                      <div className="sbi-list">
                        {drawerStats.products.map((p, idx) => {
                          const pct = p.max ? Math.round((p.qty / p.max) * 100) : 0;
                          let barColor = '#22c55e';
                          let scClass = 'sc-ok';
                          let scLabel = 'In Stock';
                          if (p.qty === 0) {
                            barColor = '#d1d5db';
                            scClass = 'sc-out';
                            scLabel = 'Out of Stock';
                          } else if (pct < 10) {
                            barColor = '#ef4444';
                            scClass = 'sc-critical';
                            scLabel = 'Critical';
                          } else if (pct < 25) {
                            barColor = '#f59e0b';
                            scClass = 'sc-low';
                            scLabel = 'Low Stock';
                          }

                          return (
                            <div className="sbi-item" key={idx}>
                              <div className="sbi-emoji">{p.emoji || '📦'}</div>
                              <div className="sbi-info">
                                <div className="sbi-name">{p.name}</div>
                                <div className="sbi-cat">{p.cat} · ₹{p.price.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="sbi-bar-wrap">
                                <div className="sbi-bar-bg">
                                  <div className="sbi-bar-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                                </div>
                              </div>
                              <div className="sbi-pct">{pct}%</div>
                              <div className="sbi-qty">{p.qty}</div>
                              <span className={`sc-chip ${scClass}`}>{scLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Low Stock Alerts */}
                    <div>
                      <div className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 13 13" width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="1.4">
                              <circle cx="6.5" cy="6.5" r="5.5" />
                              <line x1="6.5" y1="4" x2="6.5" y2="7.5" />
                              <circle cx="6.5" cy="9.5" r=".7" fill="#ef4444" stroke="none" />
                            </svg>
                          </div>
                          Low Stock Alerts
                        </div>
                        {drawerStats.alerts.length === 0 ? (
                          <div style={{ padding: '14px 16px', fontFamily: "'Nunito Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
                            All products are well stocked ✓
                          </div>
                        ) : (
                          drawerStats.alerts.map((p, idx) => {
                            const pct = Math.round((p.qty / p.max) * 100);
                            const isCrit = p.qty === 0 || pct < 5;
                            return (
                              <div className="al-item" key={idx}>
                                <div className={`al-dot ${isCrit ? 'critical' : 'low'}`}></div>
                                <div className="al-info">
                                  <div className="al-name">{p.name}</div>
                                  <div className="al-sub">{p.cat} · {pct}% remaining</div>
                                </div>
                                <div className="al-qty" style={{ color: isCrit ? '#ef4444' : '#f59e0b' }}>
                                  {p.qty} units
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
