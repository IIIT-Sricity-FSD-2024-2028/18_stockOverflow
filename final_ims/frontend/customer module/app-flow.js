(() => {
  function readSession() {
    try {
      return JSON.parse(localStorage.getItem('so_session') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function ensureConsumerSession() {
    const session = readSession();
    const role = String(session && session.role || '').toLowerCase();
    if (!session || (role !== 'consumer' && role !== 'customer')) {
      window.location.href = '../auth/login.html';
      return null;
    }
    return session;
  }

  const activeSession = ensureConsumerSession();
  if (!activeSession) {
    return;
  }

  const FILES = {
    products: 'productsearch.html',
    consumerProducts: 'consumer-landingpage.html',
    orders: 'orders.html',
    returns: 'return-management.html',
    restock: 'restockalert.html',
    feedback: 'feedback.html',
    detail: 'product-detail.html',
    pos: '../biller module/pos.html',
    sale: 'sale-confirmation.html'
  };

  const STORAGE_KEY = 'imsAppStateV1';

  const defaultState = {
    alerts: [],
    returns: [],
    feedback: [],
    lastOrderSummary: null
  };

  const loadState = () => {
    if (window.CommerceData && typeof window.CommerceData.getAppState === 'function') {
      return window.CommerceData.getAppState();
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaultState, ...parsed };
    } catch (_err) {
      return { ...defaultState };
    }
  };

  const saveState = (state) => {
    if (window.CommerceData && typeof window.CommerceData.saveAppState === 'function') {
      window.CommerceData.saveAppState(state);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const state = loadState();

  const go = (file) => {
    if (!file) return;
    window.location.href = file;
  };

  const goToProductDetail = (sku) => {
    if (!sku) {
      go(FILES.detail);
      return;
    }
    go(`${FILES.detail}?sku=${encodeURIComponent(sku)}`);
  };

  const currentPath = (window.location.pathname || '').toLowerCase();

  const toast = (() => {
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:9999',
      'background:#111827',
      'color:#fff',
      'padding:10px 14px',
      'border-radius:8px',
      'font-size:12px',
      'opacity:0',
      'transform:translateY(6px)',
      'transition:all .2s ease',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(el);
    let timer = null;
    return (message) => {
      el.textContent = message;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
      }, 1800);
    };
  })();

  const wireGlobalNav = () => {
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        const text = item.textContent.toLowerCase();
        if (text.includes('product')) go(FILES.products);
        if (text.includes('order')) go(FILES.orders);
        if (text.includes('return')) go(FILES.returns);
        if (text.includes('restock')) go(FILES.restock);
        if (text.includes('dashboard')) go(FILES.consumerProducts);
      });
    });

    document.querySelectorAll('.nav-link').forEach((item) => {
      item.addEventListener('click', () => {
        const text = item.textContent.toLowerCase();
        if (text.includes('product')) go(FILES.consumerProducts);
        if (text.includes('order')) go(FILES.orders);
      });
    });

    document.querySelectorAll('.logout-btn').forEach((button) => {
      button.addEventListener('click', () => {
        if (!window.confirm('Log out from session?')) return;
        localStorage.removeItem('so_session');
        toast('Logged out');
        setTimeout(() => {
          window.location.href = '../auth/login.html';
        }, 300);
      });
    });

    document.querySelectorAll('.avatar, .icon-btn, .icon-btn2').forEach((button) => {
      button.addEventListener('click', () => {
        if ((button.textContent || '').includes('🔔')) {
          go(FILES.restock);
          return;
        }
        toast('Feature opened');
      });
    });
  };

  const wireUploadZones = () => {
    const zones = Array.from(document.querySelectorAll('.upload-zone'));
    if (!zones.length) return;

    zones.forEach((zone, index) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.png,.jpg,.jpeg,.webp';
      input.style.display = 'none';
      input.id = `upload-input-${index}`;
      document.body.appendChild(input);

      const browseLink = zone.querySelector('a');
      const hint = zone.querySelector('.upload-hint');

      const openPicker = (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        input.click();
      };

      zone.addEventListener('click', openPicker);
      if (browseLink) {
        browseLink.addEventListener('click', openPicker);
      }

      input.addEventListener('change', () => {
        const files = Array.from(input.files || []);
        if (!files.length) return;

        const names = files.slice(0, 2).map((file) => file.name).join(', ');
        const extra = files.length > 2 ? ` +${files.length - 2} more` : '';
        if (hint) {
          hint.textContent = `${names}${extra}`;
        }
        toast(`${files.length} file${files.length > 1 ? 's' : ''} selected`);
      });
    });
  };

  const wireProductListing = () => {
    const cards = Array.from(document.querySelectorAll('.prod-card'));
    if (!cards.length) return;

    cards.forEach((card) => {
      const viewBtn = card.querySelector('.view-btn');
      const name = card.querySelector('.prod-name')?.textContent?.trim() || 'Product';
      if (viewBtn && !viewBtn.textContent.toLowerCase().includes('out of stock')) {
        viewBtn.addEventListener('click', (event) => {
          event.preventDefault();
          localStorage.setItem('imsSelectedProduct', name);
          goToProductDetail(viewBtn.dataset.sku || card.dataset.sku);
        });
      }
    });

    const search = document.querySelector('.search-box input');
    const category = document.querySelectorAll('.filter-select select')[0];
    const brand = document.querySelectorAll('.filter-select select')[1];
    const stock = document.querySelectorAll('.filter-select select')[2];

    const apply = () => {
      const q = (search?.value || '').toLowerCase().trim();
      const c = (category?.value || '').toLowerCase();
      const b = (brand?.value || '').toLowerCase();
      const s = (stock?.value || '').toLowerCase();

      cards.forEach((card) => {
        const name = card.querySelector('.prod-name')?.textContent.toLowerCase() || '';
        const meta = card.querySelector('.prod-cat')?.textContent.toLowerCase() || '';
        const status = card.querySelector('.stock-chip')?.textContent.toLowerCase() || '';

        const mQ = !q || name.includes(q) || meta.includes(q);
        const mC = c.includes('all') || !c || meta.includes(c);
        const mB = b.includes('all') || !b || meta.includes(b);
        const mS = s.includes('stock status') || !s || status.includes(s.replace(' stock', ''));

        card.style.display = mQ && mC && mB && mS ? '' : 'none';
      });
    };

    [search, category, brand, stock].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
  };

  const wireProductDetail = () => {
    const thumbs = Array.from(document.querySelectorAll('.thumb'));
    const main = document.querySelector('.img-main');
    const mainImg = document.querySelector('#product-main-img');
    if (thumbs.length && main) {
      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          thumbs.forEach((t) => t.classList.remove('active'));
          thumb.classList.add('active');

          const thumbImg = thumb.querySelector('img');
          const nextImgSrc = thumb.dataset.img || thumbImg?.getAttribute('src');
          if (mainImg && nextImgSrc) {
            main.innerHTML = '';
            main.appendChild(mainImg);
            mainImg.style.display = '';
            mainImg.src = nextImgSrc;
            return;
          }

          if (!mainImg) {
            main.textContent = thumb.textContent;
          }
        });
      });
    }

  };

  const wireConsumerLanding = () => {
    const ctaPrimary = document.querySelector('.cta-primary');
    const ctaSecondary = document.querySelector('.cta-secondary');
    if (ctaPrimary) ctaPrimary.addEventListener('click', () => go(FILES.products));
    if (ctaSecondary) ctaSecondary.addEventListener('click', () => go(FILES.orders));
  };

  const wireDelegatedActions = () => {
    document.addEventListener('click', (event) => {
      const viewBtn = event.target.closest('.view-btn');
      if (viewBtn) {
        event.preventDefault();
        const card = viewBtn.closest('.prod-card');
        const sku = viewBtn.dataset.sku || card?.dataset.sku;
        const name = card?.querySelector('.prod-name')?.textContent?.trim() || 'Product';
        localStorage.setItem('imsSelectedProduct', name);
        if (sku) {
          localStorage.setItem('imsSelectedSku', sku);
        }
        goToProductDetail(sku);
        return;
      }

      const reviewBtn = event.target.closest('.btn-review');
      if (reviewBtn) {
        event.preventDefault();
        const sku = reviewBtn.dataset.sku;
        const orderId = reviewBtn.dataset.orderId;
        if (sku) {
          localStorage.setItem('imsFeedbackSku', sku);
        }
        if (orderId) {
          localStorage.setItem('imsFeedbackOrderId', orderId);
        }
        go(sku ? `${FILES.feedback}?sku=${encodeURIComponent(sku)}` : FILES.feedback);
        return;
      }

      const returnBtn = event.target.closest('.btn-return');
      if (returnBtn) {
        event.preventDefault();
        const sku = returnBtn.dataset.sku;
        const orderId = returnBtn.dataset.orderId;
        const params = new URLSearchParams();
        if (sku) {
          params.set('sku', sku);
        }
        if (orderId) {
          params.set('orderId', orderId);
        }
        go(params.toString() ? `${FILES.returns}?${params.toString()}` : FILES.returns);
      }
    });
  };

  const wireOrders = () => {
    const search = document.querySelector('.orders-search input');
    const cards = Array.from(document.querySelectorAll('.order-card'));
    if (search && cards.length) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        cards.forEach((card) => {
          const name = card.querySelector('.order-name')?.textContent.toLowerCase() || '';
          card.style.display = !q || name.includes(q) ? '' : 'none';
        });
      });
    }

  };

  const wireFeedback = () => {
    const types = Array.from(document.querySelectorAll('.type-card'));
    types.forEach((type) => {
      type.addEventListener('click', () => {
        types.forEach((t) => t.classList.remove('selected'));
        type.classList.add('selected');
      });
    });

    const stars = Array.from(document.querySelectorAll('.star'));
    const ratingLabel = document.querySelector('.rating-label');
    const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    const setRating = (index) => {
      stars.forEach((star, i) => star.classList.toggle('active', i <= index));
      if (ratingLabel) ratingLabel.textContent = labels[index] || 'Great';
    };
    stars.forEach((star, index) => {
      star.addEventListener('click', () => setRating(index));
    });

    const textarea = document.querySelector('textarea.form-input');
    const counter = document.querySelector('.counter-row span:last-child');
    if (textarea && counter) {
      textarea.addEventListener('input', () => {
        const length = Math.min(textarea.value.length, 500);
        if (textarea.value.length > 500) textarea.value = textarea.value.slice(0, 500);
        counter.textContent = `${length} / 500`;
      });
    }

    const submit = document.querySelector('.submit-btn');
    if (submit) {
      submit.addEventListener('click', async (event) => {
        event.preventDefault();
        const comment = textarea?.value?.trim() || 'No comment';
        const activeType = document.querySelector('.type-card.selected .type-name')?.textContent?.trim() || 'General';
        const rating = document.querySelectorAll('.star.active').length || 4;
        const feedbackSku = new URLSearchParams(window.location.search).get('sku')
          || localStorage.getItem('imsFeedbackSku')
          || localStorage.getItem('imsSelectedSku')
          || null;
        const feedbackProductName = document.querySelector('#selectedProductName')?.textContent?.trim()
          || document.querySelector('.product-result-name')?.textContent?.trim()
          || localStorage.getItem('imsSelectedProduct')
          || 'Product';

        try {
          if (window.ImsApi && typeof window.ImsApi.submitFeedback === 'function' && feedbackSku) {
            const activeSession = readSession();
            await window.ImsApi.submitFeedback(feedbackSku, {
              productName: feedbackProductName,
              customer: activeSession && activeSession.name ? activeSession.name : 'Recent Buyer',
              type: activeType,
              rating,
              comment
            });
          } else if (window.CommerceData && typeof window.CommerceData.submitFeedback === 'function') {
            window.CommerceData.submitFeedback({
              sku: feedbackSku,
              productName: feedbackProductName,
              type: activeType,
              rating,
              comment
            });
          } else {
            state.feedback.unshift({
              sku: feedbackSku,
              productName: feedbackProductName,
              type: activeType,
              rating,
              comment,
              date: new Date().toISOString()
            });
            state.feedback = state.feedback.slice(0, 20);
            saveState(state);
          }

          toast('Feedback submitted');
          window.location.replace(FILES.orders);
        } catch (error) {
          toast(window.IMS_HTTP ? window.IMS_HTTP.getErrorMessage(error) : 'Unable to submit feedback');
        }
      });
    }
  };

  const wireRestock = () => {
    const useCustomRestockPage =
      document.body && document.body.dataset.customRestock === 'true';

    if (useCustomRestockPage) {
      const submit = document.querySelector('.set-alert-btn');
      if (submit) {
        submit.addEventListener('click', async () => {
          try {
            if (typeof window.handleRestockAlertSubmit === 'function') {
              await window.handleRestockAlertSubmit();
              toast('Restock alert created');
              return;
            }
          } catch (error) {
            toast(window.IMS_HTTP ? window.IMS_HTTP.getErrorMessage(error) : 'Unable to create restock alert');
            return;
          }
        });
      }
      return;
    }

    const qtyVal = document.querySelector('.qty-step-val');
    const stepBtns = Array.from(document.querySelectorAll('.qty-step-btn'));
    stepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = Number(qtyVal?.textContent || '0');
        const delta = btn.textContent.includes('+') ? 1 : -1;
        const next = Math.max(1, current + delta);
        if (qtyVal) qtyVal.textContent = String(next);
      });
    });

    const priorities = Array.from(document.querySelectorAll('.priority-btn'));
    priorities.forEach((btn) => {
      btn.addEventListener('click', () => {
        priorities.forEach((p) => p.classList.remove('active', 'high', 'medium', 'low'));
        btn.classList.add('active', btn.textContent.trim().toLowerCase());
      });
    });

    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.textContent.toLowerCase().trim();
        rows.forEach((row) => {
          const status = row.querySelector('td:nth-child(6)')?.textContent.toLowerCase() || '';
          row.style.display = key === 'all' || status.includes(key) ? '' : 'none';
        });
      });
    });

    document.querySelectorAll('.row-actions .btn-sm').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.textContent.includes('✕')) {
          const row = btn.closest('tr');
          if (row) row.remove();
          toast('Alert removed');
          return;
        }
        toast('Edit mode opened');
      });
    });

    const submit = document.querySelector('.set-alert-btn');
    if (submit) {
      submit.addEventListener('click', () => {
        const product = document.querySelector('.chip-name')?.textContent.trim() || 'Product';
        const qty = Number(qtyVal?.textContent || '1');
        const priority = document.querySelector('.priority-btn.active')?.textContent?.trim() || 'Medium';
        if (window.CommerceData && typeof window.CommerceData.addAlert === 'function') {
          window.CommerceData.addAlert({ product: product, qty: qty, priority: priority, status: 'Notified' });
        } else {
          state.alerts.unshift({ product, qty, priority, date: new Date().toISOString() });
          state.alerts = state.alerts.slice(0, 30);
          saveState(state);
        }
        toast('Restock alert created');
      });
    }
  };

  const wireReturns = () => {
    const fetch = document.querySelector('.fetch-btn');
    if (fetch) {
      fetch.addEventListener('click', async () => {
        try {
          if (typeof window.loadReturnItemsForOrder === 'function') {
            await window.loadReturnItemsForOrder(
              document.getElementById('orderInput')?.value?.trim() || '',
            );
          }
          toast('Order details fetched');
        } catch (error) {
          toast(window.IMS_HTTP ? window.IMS_HTTP.getErrorMessage(error) : 'Unable to fetch order details');
        }
      });
    }

    const submit = document.querySelector('.submit-btn');
    if (submit) {
      submit.addEventListener('click', async (event) => {
        event.preventDefault();
        const reason = document.querySelectorAll('.form-select')[0]?.value || 'Defective';
        const condition = document.querySelectorAll('.form-select')[1]?.value || 'Opened but Unused';
        const refundMethod = document.querySelectorAll('.form-select')[2]?.value || 'Original Payment Method';
        const notes = document.querySelector('textarea.form-input')?.value?.trim() || '';
        const orderId = document.getElementById('orderInput')?.value?.trim() || '';
        const checked = Array.from(document.querySelectorAll('.item-check-row input:checked'));
        if (!checked.length) {
          toast('Select at least one item');
          return;
        }

        try {
          if (window.ImsApi && typeof window.ImsApi.createReturn === 'function') {
            for (const checkbox of checked) {
              const selectedOrderId =
                checkbox.getAttribute('data-order-id') ||
                orderId ||
                '';
              await window.ImsApi.createReturn({
                orderId: selectedOrderId,
                retailerId: checkbox.getAttribute('data-retailer-id') || undefined,
                storeId: checkbox.getAttribute('data-store-id') || undefined,
                store: checkbox.getAttribute('data-store') || undefined,
                sku: checkbox.getAttribute('data-sku') || '',
                productName: checkbox.getAttribute('data-name') || '',
                product: checkbox.getAttribute('data-name') || '',
                productImg: checkbox.getAttribute('data-img') || '',
                emoji: checkbox.getAttribute('data-emoji') || '',
                amount: Number(checkbox.getAttribute('data-amount')) || undefined,
                reason: reason,
                condition: condition,
                refundMethod: refundMethod,
                notes: notes
              });
            }
          } else if (window.CommerceData && typeof window.CommerceData.addReturn === 'function') {
            checked.forEach((checkbox) => {
              window.CommerceData.addReturn({
                sku: checkbox.getAttribute('data-sku') || '',
                productName: checkbox.getAttribute('data-name') || '',
                reason: reason
              });
            });
          } else {
            state.returns.unshift({
              items: checked.length,
              reason,
              date: new Date().toISOString()
            });
            state.returns = state.returns.slice(0, 30);
            saveState(state);
          }

          toast('Return request submitted');
          if (typeof window.loadReturnHistory === 'function') {
            await window.loadReturnHistory();
          }
          if (typeof window.loadReturnItemsForOrder === 'function') {
            await window.loadReturnItemsForOrder(orderId);
          }
          if (!window.location.pathname.includes(FILES.returns)) {
            window.location.replace(FILES.orders);
          }
        } catch (error) {
          toast(window.IMS_HTTP ? window.IMS_HTTP.getErrorMessage(error) : 'Unable to submit return');
        }
      });
    }

    document.querySelectorAll('.row-btns .btn-sm').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.textContent.includes('✓')) {
          const statusCell = btn.closest('tr')?.querySelector('td:nth-child(6) .badge');
          if (statusCell) {
            statusCell.textContent = 'Approved';
            statusCell.className = 'badge badge-approved';
            toast('Return approved');
          }
          return;
        }
        toast('Return details opened');
      });
    });

    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => toast('Export started'));
    }
  };

  const wireSaleConfirmation = () => {
    const buttons = Array.from(document.querySelectorAll('.receipt-btn'));
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('print')) {
          window.print();
          return;
        }
        if (text.includes('email')) {
          toast('Receipt emailed');
          return;
        }
        if (text.includes('whatsapp')) {
          toast('Receipt shared on WhatsApp');
          return;
        }
        if (text.includes('new sale')) {
          go(FILES.pos);
        }
      });
    });

    const total = document.querySelector('.total-row.grand span:last-child')?.textContent?.trim();
    if (total) {
      state.lastOrderSummary = {
        total,
        date: new Date().toISOString(),
        source: 'sale-confirmation'
      };
      saveState(state);
    }
  };

  wireGlobalNav();
  wireUploadZones();

  wireDelegatedActions();
  if (currentPath.includes(FILES.consumerProducts)) wireConsumerLanding();
  if (currentPath.includes(FILES.products)) wireProductListing();
  if (currentPath.includes(FILES.detail)) wireProductDetail();
  if (currentPath.includes(FILES.orders)) wireOrders();
  if (currentPath.includes(FILES.feedback)) wireFeedback();
  if (currentPath.includes(FILES.restock)) wireRestock();
  if (currentPath.includes(FILES.returns)) wireReturns();
  if (currentPath.includes(FILES.sale)) wireSaleConfirmation();
})();
