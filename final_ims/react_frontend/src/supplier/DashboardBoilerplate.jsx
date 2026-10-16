import React from 'react';
import './supplier.css';

export default function DashboardBoilerplate() {
return (<>


{/* ══════ SIDEBAR ══════ */}
<aside className="sidebar">
  <div className="sb-brand">
    <div className="sidebar-logo"><img src="Logo.png" alt="StockOverflow" /></div>
  </div>

  <div className="sb-body">
    <div className="sb-group">
      <div className="sb-group-label">Main</div>
      <div className="sb-menus">
        <div className="sb-item active" onClick="showSection('dashboard',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg></span>
          <span className="sb-item-label">Dashboard</span>
        </div>
      </div>
    </div>

    <div className="sb-divider"></div>

    <div className="sb-group">
      <div className="sb-group-label">My Business</div>
      <div className="sb-menus">
        <div className="sb-item" onClick="showSection('profile',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5.5" r="3"/><path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5"/></svg></span>
          <span className="sb-item-label">Supplier Profile</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
        <div className="sb-item" onClick="showSection('products',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1L15 4.5v7L8 15 1 11.5v-7L8 1z"/><path d="M1 4.5L8 8l7-3.5M8 8v7"/></svg></span>
          <span className="sb-item-label">Product Catalog</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
        <div className="sb-item" onClick="showSection('orders',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/><polyline points="9,2 9,6 13,6"/></svg></span>
          <span className="sb-item-label">Purchase Orders</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
      </div>
    </div>

    <div className="sb-divider"></div>

    <div className="sb-group">
      <div className="sb-group-label">Retailers</div>
      <div className="sb-menus">
        <div className="sb-item" onClick="showSection('retailers',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1" width="14" height="14" rx="1.5"/><line x1="4" y1="1" x2="4" y2="15"/><line x1="1" y1="8" x2="15" y2="8"/></svg></span>
          <span className="sb-item-label">Retailer List</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
        <div className="sb-item" onClick="showSection('performance',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="2,13 5.5,8.5 8.5,11 13.5,4"/><polyline points="10.5,4 13.5,4 13.5,7"/></svg></span>
          <span className="sb-item-label">My Performance</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
      </div>
    </div>

    <div className="sb-divider"></div>

    <div className="sb-group">
      <div className="sb-group-label">Plans &amp; Billing</div>
      <div className="sb-menus">
        <div className="sb-item" onClick="showSection('plan',this)">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><polygon points="8 1 10.3 5.7 15.5 6.5 11.8 10.1 12.6 15.3 8 12.8 3.4 15.3 4.2 10.1 0.5 6.5 5.7 5.7 8 1"/></svg></span>
          <span className="sb-item-label">Subscription Plan</span>
          <span className="sb-item-arr"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
      </div>
    </div>

    <div className="sb-divider"></div>

    <div className="sb-group">
      <div className="sb-group-label">Settings</div>
      <div className="sb-menus">
        <div className="sb-item" onClick="logoutSupplierModule()">
          <span className="sb-item-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10.5 8H2.5M5,5 2,8 5,11"/><path d="M6 3.5h5.5a2 2 0 012 2v5a2 2 0 01-2 2H6"/></svg></span>
          <span className="sb-item-label">Logout</span>
        </div>
      </div>
    </div>
  </div>

  <div className="sb-user">
    <div className="sb-avatar" id="sidebarAvatar">SP</div>
    <div className="sb-user-info">
      <div className="sb-user-name" id="sidebarUserName">Supplier profile</div>
      <div className="sb-user-email" id="sidebarUserEmail">No email linked</div>
    </div>
  </div>
</aside>

{/* ══════ MAIN ══════ */}
<div className="main">
  <header className="topbar">
    <div className="topbar-left">
      <div className="breadcrumb" id="bc">
        <a href="#">Home</a>
        <span className="bc-sep">/</span>
        <span className="current">Dashboard</span>
      </div>
    </div>
    <div className="topbar-right">
      <div className="notif-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div className="notif-dot"></div>
      </div>
      <button className="topbar-avatar" id="topbarAvatar" onClick="toggleProfilePopover(event)" type="button">SP</button>
      <div className="profile-popover" id="profilePopover">
        <div className="profile-popover-head">
          <div className="profile-popover-avatar" id="profilePopoverAvatar">SP</div>
          <div>
            <div className="profile-popover-name" id="profilePopoverName">Supplier profile</div>
            <div className="profile-popover-sub" id="profilePopoverCode">No supplier code</div>
          </div>
        </div>
        <div className="profile-popover-grid">
          <div className="profile-popover-item">
            <div className="profile-popover-label">Email</div>
            <div className="profile-popover-value" id="profilePopoverEmail">No email linked</div>
          </div>
          <div className="profile-popover-item">
            <div className="profile-popover-label">Phone</div>
            <div className="profile-popover-value" id="profilePopoverPhone">-</div>
          </div>
          <div className="profile-popover-item">
            <div className="profile-popover-label">Category</div>
            <div className="profile-popover-value" id="profilePopoverCategory">-</div>
          </div>
          <div className="profile-popover-item">
            <div className="profile-popover-label">State</div>
            <div className="profile-popover-value" id="profilePopoverState">-</div>
          </div>
        </div>
        <div className="profile-popover-actions">
          <button className="btn btn-outline btn-sm" onClick="openProfileFromPopover()" type="button">Open Profile</button>
          <button className="btn btn-primary btn-sm" onClick="copySupplierDirectoryEndpoint()" type="button">Directory API</button>
        </div>
      </div>
    </div>
  </header>

  <div className="page-body">

    {/* ══ DASHBOARD ══ */}
    <div className="section active" id="sec-dashboard">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back</div>
          <div className="page-sub">Here's what's happening with your supply chain today.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick="showSection('products',document.querySelector('.sb-item:nth-child(1)'))">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
            Add Product
          </button>
        </div>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: '16px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-value" id="statTotalSalesVal" style={{ color: '#059669' }}>₹0.00</div>
          <div className="stat-label">Total Completed Sales</div>
          <div className="stat-trend trend-up" id="statTotalSalesTrend">↑ 0 POs Fulfilled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div className="stat-value" id="statNetPayoutVal" style={{ color: '#2563eb' }}>₹0.00</div>
          <div className="stat-label">Net Supplier Payout</div>
          <div className="stat-trend trend-up" style={{ color: '#2563eb', fontWeight: 700 }}>98% Payout Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7e22ce" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0"/><path d="M9 12h6"/></svg>
          </div>
          <div className="stat-value" id="statPlatformFeeVal" style={{ color: '#7e22ce' }}>₹0.00</div>
          <div className="stat-label">2% Platform Fee</div>
          <div className="stat-trend trend-up" style={{ color: '#7e22ce', fontWeight: 700 }}>2.0% Commission</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/></svg>
          </div>
          <div className="stat-value" id="statPendingOrdersVal" style={{ color: '#f59e0b' }}>0</div>
          <div className="stat-label">Pending Orders</div>
          <div className="stat-trend" id="statPendingOrdersTrend" style={{ color: '#d97706' }}>0 total orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" stroke-width="1.5"><polyline points="2,13 5.5,8.5 8.5,11 13.5,4"/></svg>
          </div>
          <div className="stat-value" id="statFulfilmentVal" style={{ color: '#8b5cf6' }}>100%</div>
          <div className="stat-label">Fulfilment Rate</div>
          <div className="stat-trend trend-up" id="statFulfilmentTrend">↑ 0 delivered orders</div>
        </div>
      </div>

      {/* Sales & PO Fulfilment Performance Banner */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #092c4c 0%, #1e429f 100%)', color: '#fff', border: 'none', padding: '20px 24px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Sales &amp; Fulfilment Intelligence</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: ''Space Grotesk',sans-serif', marginBottom: '4px' }} id="dashTotalSalesHeadline">₹0.00 Gross Fulfilled Sales</div>
            <div style={{ fontSize: '13px', color: '#cbd5e1' }} id="dashSalesSubheadline">Completing purchase orders automatically records gross revenue, calculates the 2% platform fee, and updates your network performance.</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', backdropFilter: 'blur(4px)', minWidth: '110px' }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>Fulfilled POs</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: ''Space Grotesk',sans-serif' }} id="dashDeliveredCount">0</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', backdropFilter: 'blur(4px)', minWidth: '130px' }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>Pending Value</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: ''Space Grotesk',sans-serif' }} id="dashPendingValue">₹0.00</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', backdropFilter: 'blur(4px)', minWidth: '130px' }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>Avg PO Value</div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: ''Space Grotesk',sans-serif' }} id="dashAvgOrderValue">₹0.00</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#eef3fc' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" stroke-width="1.4"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/><polyline points="9,2 9,6 13,6"/></svg>
            </div>
            Recent Orders
          </div>
          <button className="btn btn-outline btn-sm" onClick="showSection('orders',null)">View All</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Order ID</th><th>Retailer</th><th>Product</th><th>Qty</th><th>Date</th><th>Status</th>
            </tr></thead>
            <tbody id="dashboardRecentOrdersBody">
              <tr>
                <td colspan="6" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-3)' }}>No purchase orders linked yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#dcfce7' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#22c55e" stroke-width="1.4"><rect x="1" y="1" width="11" height="11" rx="1"/><line x1="4" y1="1" x2="4" y2="12"/><line x1="1" y1="6" x2="12" y2="6"/></svg>
            </div>
            Top Retailers by Volume
          </div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div id="topRetailers"></div>
        </div>
      </div>
    </div>

    {/* ══ SUPPLIER PROFILE ══ */}
    <div className="section" id="sec-profile">
      <div className="page-header">
        <div>
          <div className="page-title">Supplier Profile</div>
          <div className="page-sub">Manage your business info, contact details and branding</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick="saveProfile()">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,7 5.5,10.5 11,3.5"/></svg>
            Save Changes
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#eef3fc' }}><svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" stroke-width="1.4"><rect x="1" y="1" width="11" height="11" rx="1.5"/></svg></div>
            Business Information
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="fg fg-2">
            <div className="field"><label className="field-label">Supplier Name <span className="req">*</span></label><input type="text" value="" id="p-name"/ /></div>
            <div className="field"><label className="field-label">Supplier Code</label><input type="text" value="" readonly style={{ background: '#f9fafb' }} id="p-code"/ /></div>
          </div>
          <div className="fg fg-2">
            <div className="field"><label className="field-label">Business Email <span className="req">*</span></label><input type="email" value="" id="p-email"/ /></div>
            <div className="field"><label className="field-label">Phone</label><input type="tel" value="" id="p-phone"/ /></div>
          </div>
          <div className="fg fg-3">
            <div className="field"><label className="field-label">Category</label><select id="p-cat"><option selected>Electronics</option><option>Computers</option><option>Fashion</option><option>Furniture</option><option>Food & Beverage</option><option>Appliances</option><option>Mobile</option><option>Sports</option><option>Beauty</option><option>Mixed</option></select></div>
            <div className="field"><label className="field-label">State</label><select id="p-state"><option>Gujarat</option><option>Maharashtra</option><option selected>Uttar Pradesh</option><option>Delhi</option><option>Karnataka</option></select></div>
            <div className="field"><label className="field-label">Payment Terms</label><select id="p-terms"><option selected>Net 30</option><option>Net 15</option><option>Net 45</option><option>COD</option><option>Prepaid</option></select></div>
          </div>
          <div className="fg fg-1">
            <div className="field"><label className="field-label">Address</label><input type="text" value="" id="p-addr"/ /></div>
          </div>
          <div className="fg fg-2">
            <div className="field"><label className="field-label">Website</label><input type="url" value="" id="p-web"/ /></div>
            <div className="field"><label className="field-label">GST Number</label><input type="text" value="" id="p-gst"/ /></div>
          </div>
          <div className="fg fg-1">
            <div className="field"><label className="field-label">About / Description</label><textarea id="p-desc" style={{ minHeight: '70px' }}></textarea></div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#dcfce7' }}><svg viewBox="0 0 13 13" fill="none" stroke="#22c55e" stroke-width="1.4"><circle cx="6.5" cy="4.5" r="2.5"/><path d="M1 12c0-3 2.46-5 5.5-5s5.5 2 5.5 5"/></svg></div>
            Contact Person
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="fg fg-3">
            <div className="field"><label className="field-label">Full Name <span className="req">*</span></label><input type="text" value="" id="p-contact-name"/ /></div>
            <div className="field"><label className="field-label">Designation</label><input type="text" value="" id="p-contact-title"/ /></div>
            <div className="field"><label className="field-label">Direct Email</label><input type="email" value="" id="p-contact-email"/ /></div>
          </div>
        </div>
      </div>

      {/* ══ SUPPLIER DOCUMENTS & CERTIFICATIONS ══ */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#fef3c7' }}>
              <svg viewBox="0 0 13 13" fill="none" stroke="#f59e0b" stroke-width="1.4"><path d="M7 1.5H3a1 1 0 00-1 1v8.5a1 1 0 001 1h7a1 1 0 001-1V5.5L7 1.5z"/><polyline points="7,1.5 7,5.5 11,5.5"/></svg>
            </div>
            Business Documents & Certifications (File Upload)
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="fg fg-3">
            <div className="field">
              <label className="field-label">Document Type <span className="req">*</span></label>
              <select id="doc-type-select">
                <option value="GST Registration Certificate">GST Registration Certificate</option>
                <option value="Trade License">Trade License</option>
                <option value="ISO / Quality Compliance Certificate">ISO / Quality Compliance Certificate</option>
                <option value="Product Specification Sheet">Product Specification Sheet</option>
                <option value="Bank Authorization Letter">Bank Authorization Letter</option>
                <option value="General Certification">General Certification</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Select File (PDF, PNG, JPG, DOCX, CSV - Max 5MB) <span className="req">*</span></label>
              <input type="file" id="doc-file-input" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.csv" style={{ height: '40px', padding: '6px 12px' }} / />
            </div>
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label className="field-label">&nbsp;</label>
              <button className="btn btn-primary" onClick="uploadSupplierDocument()" id="doc-upload-btn" type="button">
                <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 10V2.5M6.5 2.5L3.5 5.5M6.5 2.5L9.5 5.5"/><line x1="2" y1="11" x2="11" y2="11"/></svg>
                Upload Document
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontFamily: ''Space Grotesk',sans-serif', fontSize: '13.5px', fontWeight: 600, marginBottom: '10px', color: 'var(--text)' }}>
              Uploaded Documents & Certifications
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Filename</th>
                    <th>Size</th>
                    <th>Uploaded Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="supplierDocsBody">
                  <tr>
                    <td colspan="5" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-3)' }}>
                      No documents uploaded yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ══ PRODUCTS ══ */}
    <div className="section" id="sec-products">
      <div className="page-header">
        <div>
          <div className="page-title">Product Catalog</div>
          <div className="page-sub">Manage products you supply to retailers</div>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
            <input type="text" placeholder="Search products…" oninput="filterProducts(this.value)" style={{ paddingLeft: '34px' }}/ />
          </div>
          <button className="btn btn-primary" onClick="openProductModal()">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
            Add Product
          </button>
        </div>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl" id="prodTable">
            <thead><tr>
              <th className="tbl-check"><input type="checkbox"/ /></th>
              <th>SKU</th><th>Product Name</th><th>Category</th><th>Unit Price</th><th>Min Order</th><th>Stock</th><th>Status</th><th></th>
            </tr></thead>
            <tbody id="prodBody"></tbody>
          </table>
          <div id="prodEmpty" className="empty" style={{ display: 'none' }}>
            <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M22 4L40 13.5v17L22 40 4 30.5v-17L22 4z"/></svg>
            <div className="empty-title">No products yet</div>
            <div className="empty-sub">Add your first product to start receiving orders from retailers</div>
          </div>
        </div>
      </div>
    </div>

    {/* ══ PURCHASE ORDERS ══ */}
    <div className="section" id="sec-orders">
      <div className="page-header">
        <div>
          <div className="page-title">Purchase Orders</div>
          <div className="page-sub">Orders received from all your retailers</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick="exportOrders()">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 9l-3 3-3-3M8 12V4"/><polyline points="2,4 5,1 8,4"/><line x1="2" y1="7" x2="5" y2="7"/></svg>
            Export
          </button>
        </div>
      </div>
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ maxWidth: '260px' }}>
            <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
            <input type="text" id="orderSearchInput" placeholder="Search orders…" style={{ paddingLeft: '34px' }} onkeydown="if(event.key==='Enter'){applyOrderFilters();}"/ />
          </div>
          <select id="orderStatusFilter" style={{ width: 'auto', height: '40px', padding: '0 30px 0 10px' }}>
            <option value="all">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="indelivery">In Delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
          </select>
          <input type="date" id="orderDateFrom" style={{ height: '40px', padding: '0 10px', width: 'auto' }}/ />
          <input type="date" id="orderDateTo" style={{ height: '40px', padding: '0 10px', width: 'auto' }}/ />
          <button className="btn btn-primary btn-sm" onClick="applyOrderFilters()">Apply</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Order ID</th><th>Retailer</th><th>Product</th><th>Qty</th><th>Order Date</th><th>Est. Delivery</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody id="ordersBody"></tbody>
          </table>
          <div id="ordersEmpty" className="empty" style={{ display: 'none' }}>
            <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="6" y="8" width="32" height="28" rx="4"/><path d="M14 4v8M30 4v8M6 18h32"/></svg>
            <div className="empty-title">No purchase orders found</div>
            <div className="empty-sub">Try changing your filters or wait for new retailer orders</div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div id="ordersSummary" style={{ fontFamily: ''Nunito Sans',sans-serif', fontSize: '12.5px', color: 'var(--text-3)' }}>Showing 0 of 0 orders</div>
          <div id="ordersPagination" style={{ display: 'flex', gap: '4px' }}></div>
        </div>
      </div>
    </div>

    {/* ══ RETAILER LIST ══ */}
    <div className="section" id="sec-retailers">
      <div className="page-header">
        <div>
          <div className="page-title">Retailer List</div>
          <div className="page-sub">Your registered retailers — fulfilment details & relationship status</div>
        </div>
        <div className="page-actions">
          <div className="search-wrap">
            <div className="search-icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13"/></svg></div>
            <input type="text" placeholder="Search retailers…" oninput="filterRetailers(this.value)" style={{ paddingLeft: '34px' }}/ />
          </div>
          <button className="btn btn-primary" onClick="openRetailerModal()">
            <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="6.5" y1="2" x2="6.5" y2="11"/><line x1="2" y1="6.5" x2="11" y2="6.5"/></svg>
            Add Retailer
          </button>
        </div>
      </div>
      <div className="card">
        <div className="tabs">
          <div className="tab active" onClick="filterRetailerTab('all',this)">All Retailers</div>
          <div className="tab" onClick="filterRetailerTab('active',this)">Active</div>
          <div className="tab" onClick="filterRetailerTab('inactive',this)">Inactive</div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th className="tbl-check"><input type="checkbox"/ /></th>
              <th>Retailer</th><th>Contact</th><th>State</th><th>Last Order</th><th>Fulfilment</th><th>Rating Given</th><th>Status</th><th></th>
            </tr></thead>
            <tbody id="retailerBody"></tbody>
          </table>
          <div id="retailerEmpty" className="empty" style={{ display: 'none' }}>
            <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="5" y="5" width="34" height="34" rx="2"/><line x1="14" y1="5" x2="14" y2="39"/><line x1="5" y1="22" x2="39" y2="22"/></svg>
            <div className="empty-title">No retailers added</div>
            <div className="empty-sub">Add your first retailer to start tracking orders and performance</div>
          </div>
        </div>
      </div>
    </div>

    {/* ══ PERFORMANCE ══ */}
    <div className="section" id="sec-performance">
      <div className="page-header">
        <div>
          <div className="page-title">My Performance</div>
          <div className="page-sub">Ratings and feedback given by your retailers</div>
        </div>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}><svg viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" stroke-width="1.5"><polyline points="2,13 5.5,8.5 8.5,11 13.5,4"/></svg></div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>4.6</div>
          <div className="stat-label">Overall Rating</div>
          <div className="stat-trend trend-up" style={{ fontSize: '14px' }}>★★★★½</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}><svg viewBox="0 0 16 16" fill="none" stroke="#22c55e" stroke-width="1.5"><polyline points="2,8 6,4 10,8 14,4"/></svg></div>
          <div className="stat-value" style={{ color: '#22c55e' }}>94%</div>
          <div className="stat-label">On-time Delivery</div>
          <div className="stat-trend trend-up">↑ +2% this quarter</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef3fc' }}><svg viewBox="0 0 16 16" fill="none" stroke="#2e6bc5" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><polyline points="5,8 7,10 11,6"/></svg></div>
          <div className="stat-value" style={{ color: '#2e6bc5' }}>99.1%</div>
          <div className="stat-label">Order Accuracy</div>
          <div className="stat-trend trend-up">↑ excellent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}><svg viewBox="0 0 16 16" fill="none" stroke="#f59e0b" stroke-width="1.5"><rect x="1.5" y="4" width="13" height="10" rx="1.5"/><path d="M5 4V3a3 3 0 016 0v1"/></svg></div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>2.3 days</div>
          <div className="stat-label">Avg. Lead Time</div>
          <div className="stat-trend trend-up">↓ -0.4 improved</div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#ede9fe' }}><svg viewBox="0 0 13 13" fill="none" stroke="#8b5cf6" stroke-width="1.4"><path d="M6.5 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6L1.3 4.8l3.6-.5z"/></svg></div>
            Ratings Given by Retailers
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Retailer</th><th>Quality</th><th>Delivery</th><th>Comm.</th><th>Pricing</th><th>Overall</th><th>Comment</th><th>Date</th>
            </tr></thead>
            <tbody id="ratingBody"></tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <div className="card-icon" style={{ background: '#eef3fc' }}><svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" stroke-width="1.4"><rect x="1" y="1" width="11" height="11" rx="1"/></svg></div>
            Performance Breakdown by Retailer
          </div>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }} id="perfBreakdown"></div>
      </div>
    </div>

    {/* ══ SUBSCRIPTION PLANS & BILLING ══ */}
    <div className="section" id="sec-plan">
      <div className="page-header">
        <div>
          <div className="page-title">SaaS Growth &amp; Subscription Plans</div>
          <div className="page-sub">Tiered membership plans designed for MSME suppliers, distributors, and manufacturers across India</div>
        </div>
      </div>

      {/* Current Active Plan Banner */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: '#fff', border: 'none', padding: '24px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>Current Active Membership</span>
              <span id="supplierPlanStatusBadge" style={{ background: '#22c55e', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>Active</span>
            </div>
            <h2 id="supplierCurrentPlanName" style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>Starter Kirana (Free Tier)</h2>
            <p id="supplierPlanDesc" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>Basic catalog access. Allows up to 50 product items in your supplier catalog.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.65)', marginBottom: '4px' }}>CATALOG UTILIZATION</div>
            <div id="supplierPlanUsageText" style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>0 / 50 Products</div>
            <div style={{ width: '160px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
              <div id="supplierPlanUsageBar" style={{ width: '10%', height: '100%', background: '#38bdf8', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tier Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
        {/* Tier 1: Free */}
        <div className="card" id="cardTierFree" style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Starter Kirana</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }}>Free forever for MSME onboarding</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>₹0 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-3)' }}>/ month</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> 1 Store Location</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Up to 50 Products Catalog</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> UPI QR &amp; POS Billing Terminal</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Daily WhatsApp Sales Summary</li>
          </ul>
          <button className="btn btn-outline" id="btnTierFree" onClick="setSupplierPlan('free')" style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }} disabled>Current Active Plan</button>
        </div>

        {/* Tier 2: Pro */}
        <div className="card" id="cardTierPro" style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '2px solid #3b82f6', position: 'relative', boxShadow: '0 8px 24px rgba(59,130,246,0.12)' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', letterSpacing: '0.5px' }}>MOST POPULAR (BHARAT)</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>Vyapar Pro</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }}>For growing distributors &amp; suppliers</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>₹799 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-3)' }}>/ month</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Up to 5 Retail Outlets</strong></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Unlimited Products &amp; SKUs</strong></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> GST E-Invoice &amp; e-Way Bill Generator</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> WhatsApp &amp; SMS Low Stock Alerts</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Automated Reorder Suggestions</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Priority Verification Staff Support</li>
          </ul>
          <button className="btn btn-primary" id="btnTierPro" onClick="openMockPaymentModal('pro')" style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}>Upgrade to Vyapar Pro</button>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="card" id="cardTierEnterprise" style={{ padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid #7e22ce' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#7e22ce', marginBottom: '4px' }}>Bharat Enterprise</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }}>Multi-depot suppliers &amp; large FMCG</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>₹3,499 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-3)' }}>/ month</span></div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <strong>Unlimited Stores &amp; Outlets</strong></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Multi-Warehouse Stock Transfer &amp; Depots</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Bulk Supplier POs &amp; Credit Terms</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Dedicated 24/7 Account Manager</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Custom ERP &amp; Tally Prime Sync API</li>
          </ul>
          <button className="btn btn-dark" id="btnTierEnterprise" onClick="openMockPaymentModal('enterprise')" style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}>Upgrade to Enterprise</button>
        </div>
      </div>

      {/* Billing & Tax Invoices History */}
      <div className="card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>Billing &amp; Tax Invoices</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-3)', margin: 0 }}>Download official GST-compliant tax invoices and manage automated SaaS renewals</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline btn-sm" onClick="toast('Next billing cycle: 1st of next month')">Next Renewal: 1st Next Month</button>
            <button className="btn btn-outline btn-sm" onClick="toast('Invoices synchronized with banking switch.')">Sync Invoices</button>
          </div>
        </div>

        <div className="tbl-wrap" style={{ borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Billing Date</th>
                <th>Plan Description</th>
                <th>Amount (INR)</th>
                <th>GST (18%)</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="supplierInvoicesTbody">
              <tr>
                <td style={{ fontFamily: ''Space Grotesk',sans-serif', fontWeight: 700, color: 'var(--primary)' }}>SO-INV-2026-081</td>
                <td>31 Aug 2026</td>
                <td><strong>Vyapar Pro SaaS (Monthly)</strong></td>
                <td>₹799.00</td>
                <td>₹143.82</td>
                <td><span style={{ fontWeight: 600 }}>UPI Instant</span></td>
                <td><span className="badge badge-delivered"><span className="badge-dot" style={{ background: '#22c55e' }}></span>Paid</span></td>
                <td><button className="btn btn-outline btn-sm" onClick="toast('Downloading GST Tax Invoice PDF for SO-INV-2026-081...')">Receipt</button></td>
              </tr>
              <tr>
                <td style={{ fontFamily: ''Space Grotesk',sans-serif', fontWeight: 700, color: 'var(--primary)' }}>SO-INV-2026-071</td>
                <td>01 Aug 2026</td>
                <td>Starter Kirana Onboarding</td>
                <td>₹0.00</td>
                <td>₹0.00</td>
                <td>Free Tier</td>
                <td><span className="badge badge-delivered"><span className="badge-dot" style={{ background: '#22c55e' }}></span>Active</span></td>
                <td><button className="btn btn-outline btn-sm" onClick="toast('Starter tier has zero charge.')">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</div>

{/* ══ MODAL: ADD PRODUCT ══ */}
<div className="modal-bg" id="productModal">
  <div className="modal">
    <div className="modal-title">
      <div className="card-icon" style={{ background: '#eef3fc', marginRight: '4px' }}><svg viewBox="0 0 13 13" fill="none" stroke="#2e6bc5" stroke-width="1.4"><path d="M6.5 1L12 4.5v4L6.5 12 1 8.5v-4L6.5 1z"/></svg></div>
      <span id="prodModalTitle">Add New Product</span>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Product Name <span className="req">*</span></label><input type="text" id="pm-name" placeholder="e.g. Laptop 15-inch"/ /><div id="pm-name-err" style={{ fontSize: '11px', color: 'var(--danger)', display: 'none', marginTop: '3px' }}>Required</div></div>
      <div className="field"><label className="field-label">SKU</label><input type="text" id="pm-sku" placeholder="Auto-generated" style={{ background: '#f9fafb' }} readonly/ /></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Brand</label><input type="text" id="pm-brand" placeholder="e.g. Lenovo"/ /></div>
      <div className="field"><label className="field-label">Product Variant</label><input type="text" id="pm-variant" placeholder="e.g. 16GB RAM / 512GB SSD"/ /></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Category <span className="req">*</span></label><select id="pm-cat"><option value="">Select</option><option>Electronics</option><option>Computers</option><option>Fashion</option><option>Furniture</option><option>Food & Beverage</option><option>Appliances</option><option>Mobile</option><option>Sports</option><option>Beauty</option><option>Mixed</option></select></div>
      <div className="field"><label className="field-label">Unit of Measure</label><select id="pm-unit"><option>Piece</option><option>Box</option><option>Kg</option><option>Ltr</option><option>Set</option><option>Pair</option><option>Meter</option></select></div>
    </div>
    <div className="fg fg-3">
      <div className="field"><label className="field-label">Unit Price (₹) <span className="req">*</span></label><input type="number" id="pm-price" placeholder="0.00" min="0" step="0.01"/ /></div>
      <div className="field"><label className="field-label">Min Order Qty</label><input type="number" id="pm-moq" placeholder="10" min="1"/ /></div>
      <div className="field"><label className="field-label">Available Stock</label><input type="number" id="pm-stock" placeholder="0" min="0"/ /></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Expiry Date</label><input type="date" id="pm-expiry"/ /></div>
      <div className="field"><label className="field-label">Review Summary</label><input type="text" id="pm-review" placeholder="e.g. 4.8/5 from 126 reviews"/ /></div>
    </div>
    <div className="fg fg-1">
      <div className="field"><label className="field-label">Description</label><textarea id="pm-desc" placeholder="Brief product description…" style={{ minHeight: '60px' }}></textarea></div>
    </div>
    <div className="modal-actions">
      <button className="btn btn-outline" onClick="closeModal('productModal')">Cancel</button>
      <button className="btn btn-primary" onClick="saveProduct()">
        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,7 5.5,10.5 11,3.5"/></svg>
        Save Product
      </button>
    </div>
  </div>
</div>

{/* ══ MODAL: ADD RETAILER ══ */}
<div className="modal-bg" id="retailerModal">
  <div className="modal">
    <div className="modal-title">
      <div className="card-icon" style={{ background: '#dcfce7', marginRight: '4px' }}><svg viewBox="0 0 13 13" fill="none" stroke="#22c55e" stroke-width="1.4"><rect x="1" y="1" width="11" height="11" rx="1"/><line x1="4" y1="1" x2="4" y2="12"/><line x1="1" y1="6" x2="12" y2="6"/></svg></div>
      Add Retailer
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Retailer Name <span className="req">*</span></label><input type="text" id="rm-name" placeholder="Enter retailer name"/ /><div id="rm-name-err" style={{ fontSize: '11px', color: 'var(--danger)', display: 'none', marginTop: '3px' }}>Required</div></div>
      <div className="field"><label className="field-label">Retailer Code</label><input type="text" id="rm-code" style={{ background: '#f9fafb' }} readonly/ /></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Contact Person <span className="req">*</span></label><input type="text" id="rm-contact" placeholder="Manager name"/ /></div>
      <div className="field"><label className="field-label">Email</label><input type="email" id="rm-email" placeholder="contact@retailer.com"/ /></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Phone</label><input type="tel" id="rm-phone" placeholder="+91 9876543210"/ /></div>
      <div className="field"><label className="field-label">State</label><select id="rm-state"><option>Gujarat</option><option>Maharashtra</option><option>Uttar Pradesh</option><option>Delhi</option><option>Karnataka</option><option>Bihar</option><option>Jharkhand</option><option>Haryana</option><option>Andhra Pradesh</option></select></div>
    </div>
    <div className="fg fg-2">
      <div className="field"><label className="field-label">Category Supplied</label><select id="rm-cat"><option>Electronics</option><option>Food & Grocery</option><option>Fashion</option><option>Mixed</option><option>Furniture</option></select></div>
      <div className="field"><label className="field-label">Credit Terms</label><select id="rm-terms"><option>Net 30</option><option>Net 15</option><option>Net 45</option><option>COD</option><option>Prepaid</option></select></div>
    </div>
    <div className="fg fg-1">
      <div className="field"><label className="field-label">Address</label><input type="text" id="rm-addr" placeholder="Full address"/ /></div>
    </div>
    <div className="modal-actions">
      <button className="btn btn-outline" onClick="closeModal('retailerModal')">Cancel</button>
      <button className="btn btn-primary" onClick="saveRetailer()">
        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,7 5.5,10.5 11,3.5"/></svg>
        Save Retailer
      </button>
    </div>
  </div>
</div>

{/* ══ MODAL: ORDER DETAIL ══ */}
<div className="modal-bg" id="orderModal">
  <div className="modal">
    <div className="modal-title">
      <div className="card-icon" style={{ background: '#fef3c7', marginRight: '4px' }}><svg viewBox="0 0 13 13" fill="none" stroke="#f59e0b" stroke-width="1.4"><path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/></svg></div>
      <span id="orderModalId">Order Details</span>
    </div>
    <div id="orderModalBody" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}></div>
    <div className="modal-actions" id="orderModalActions">
      <button className="btn btn-outline" onClick="closeModal('orderModal')">Close</button>
    </div>
  </div>
</div>

{/* ══ MODAL: RETAILER VIEW ══ */}
<div className="modal-bg" id="retailerViewModal">
  <div className="modal">
    <div className="modal-title">
      <div className="card-icon" style={{ background: '#e0e7ff', marginRight: '4px' }}><svg viewBox="0 0 13 13" fill="none" stroke="#3b82f6" stroke-width="1.4"><circle cx="6.5" cy="4" r="2.5"/><path d="M1.5 11c0-2.5 2-4 5-4s5 1.5 5 4"/></svg></div>
      <span id="retailerViewTitle">Retailer Details</span>
    </div>
    <div id="retailerViewBody" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', padding: '6px 0' }}></div>
    <div className="modal-actions">
      <button className="btn btn-outline" onClick="closeModal('retailerViewModal')">Close</button>
    </div>
  </div>
</div>

{/* ══ MODAL: MOCK PAYMENT GATEWAY ══ */}
<div className="modal-bg" id="paymentGatewayModal">
  <div className="modal" style={{ width: 'min(520px,94vw)', borderRadius: '14px', padding: 0, overflow: 'hidden' }}>
    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>StockOverflow Bharat Gateway</div>
        <div id="payModalPlanTitle" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>Upgrade to Vyapar Pro</div>
      </div>
      <button onClick="closeModal('paymentGatewayModal')" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>

    <div style={{ padding: '20px 24px' }}>
      {/* Amount Summary */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-2)', marginBottom: '6px' }}>
          <span>Plan Base Amount</span>
          <span id="payModalBaseAmount">₹799.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>
          <span>GST (18% Goods &amp; Services Tax)</span>
          <span id="payModalGst">₹143.82</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
          <span>Total Payable</span>
          <span id="payModalTotalAmount" style={{ color: '#2563eb' }}>₹942.82</span>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
        <button className="btn btn-primary btn-sm" id="payTabUpi" onClick="selectPayMethod('upi')">UPI / QR</button>
        <button className="btn btn-outline btn-sm" id="payTabCard" onClick="selectPayMethod('card')">Card (RuPay/Visa)</button>
        <button className="btn btn-outline btn-sm" id="payTabNet" onClick="selectPayMethod('net')">NetBanking</button>
      </div>

      {/* UPI Form */}
      <div id="payFormUpi">
        <div style={{ textAlign: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'inline-block', padding: '8px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <svg width="130" height="130" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#ffffff"/>
              <rect x="10" y="10" width="26" height="26" fill="#0f172a"/>
              <rect x="14" y="14" width="18" height="18" fill="#ffffff"/>
              <rect x="18" y="18" width="10" height="10" fill="#0f172a"/>
              <rect x="64" y="10" width="26" height="26" fill="#0f172a"/>
              <rect x="68" y="14" width="18" height="18" fill="#ffffff"/>
              <rect x="72" y="18" width="10" height="10" fill="#0f172a"/>
              <rect x="10" y="64" width="26" height="26" fill="#0f172a"/>
              <rect x="14" y="68" width="18" height="18" fill="#ffffff"/>
              <rect x="18" y="72" width="10" height="10" fill="#0f172a"/>
              <rect x="42" y="14" width="8" height="8" fill="#0f172a"/>
              <rect x="52" y="24" width="6" height="6" fill="#0f172a"/>
              <rect x="42" y="34" width="16" height="16" fill="#0f172a"/>
              <rect x="14" y="44" width="8" height="12" fill="#0f172a"/>
              <rect x="64" y="44" width="12" height="8" fill="#0f172a"/>
              <rect x="80" y="52" width="10" height="10" fill="#0f172a"/>
              <rect x="44" y="64" width="12" height="12" fill="#0f172a"/>
              <rect x="64" y="68" width="16" height="8" fill="#0f172a"/>
              <rect x="70" y="80" width="14" height="10" fill="#0f172a"/>
            </svg>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginTop: '6px' }}>Scan with GPay, PhonePe, Paytm or BHIM</div>
        </div>
        <div className="field" style={{ marginBottom: '12px' }}>
          <label className="field-label">Or Enter UPI ID</label>
          <input type="text" id="upiIdInput" placeholder="mobile@upi" value="supplier@upi"/ />
        </div>
      </div>

      {/* Card Form */}
      <div id="payFormCard" style={{ display: 'none' }}>
        <div className="field" style={{ marginBottom: '12px' }}>
          <label className="field-label">Card Number</label>
          <input type="text" placeholder="4532 •••• •••• 8892" value="4532 9812 3456 8892"/ />
        </div>
        <div className="fg fg-2" style={{ marginBottom: '12px' }}>
          <div className="field"><label className="field-label">Valid Thru</label><input type="text" placeholder="MM/YY" value="08/29"/ /></div>
          <div className="field"><label className="field-label">CVV</label><input type="password" placeholder="•••" value="882"/ /></div>
        </div>
        <div className="field" style={{ marginBottom: '12px' }}>
          <label className="field-label">Cardholder Name</label>
          <input type="text" id="cardHolderName" placeholder="Name on card" value="Authorized Signatory"/ />
        </div>
      </div>

      {/* Net Banking Form */}
      <div id="payFormNet" style={{ display: 'none' }}>
        <div className="field" style={{ marginBottom: '12px' }}>
          <label className="field-label">Select Popular Indian Bank</label>
          <select style={{ width: '100%' }}>
            <option>HDFC Bank</option>
            <option>State Bank of India (SBI)</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
            <option>Kotak Mahindra Bank</option>
            <option>Punjab National Bank (PNB)</option>
          </select>
        </div>
      </div>

      {/* Processing State */}
      <div id="payProcessingState" style={{ display: 'none', textAlign: 'center', padding: '24px 10px' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }}></div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Authorizing with Banking Switch...</div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Please do not refresh or close this window</div>
      </div>

      {/* Action Buttons */}
      <div id="payModalActions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn btn-outline" onClick="closeModal('paymentGatewayModal')">Cancel</button>
        <button className="btn btn-primary" id="btnPayConfirm" onClick="processMockPayment()" style={{ background: '#2563eb' }}>Pay Securely</button>
      </div>
    </div>
  </div>
</div>

{/* TOAST */}
<div className="toast" id="toast">
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="9" cy="9" r="7.5"/><polyline points="5.5,9 7.5,11.5 12,6.5"/></svg>
  <span id="toastMsg">Done!</span>
</div>

{/* MAIN SCRIPT */}

</>);
}
