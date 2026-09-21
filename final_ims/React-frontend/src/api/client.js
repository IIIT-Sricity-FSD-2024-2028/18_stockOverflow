// API Client for Stock Overflow with automatic multi-tenancy scoping
const API_BASE = '/api';

const COLLECTION_PATHS = [
  '/products',
  '/customers',
  '/billers',
  '/returns',
  '/stock-adjustments',
  '/transactions',
  '/purchase-orders',
  '/stores',
];

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('so_session') || 'null');
  } catch {
    return null;
  }
}

export async function request(path, options = {}) {
  const session = getSession();
  let scopedPath = path;

  // Append retailerId & storeId to collection paths if not already in URL query
  const isCollection = COLLECTION_PATHS.some((prefix) => path.startsWith(prefix) || path.startsWith(`/api${prefix}`));
  if (isCollection && session) {
    const hasQuery = scopedPath.includes('?');
    const urlParams = new URLSearchParams(hasQuery ? scopedPath.split('?')[1] : '');
    const basePath = hasQuery ? scopedPath.split('?')[0] : scopedPath;

    const retailerId = session.retailerId || session.profileId || session.id;
    const storeId = session.currentStoreId || session.storeId;

    if (retailerId && !urlParams.has('retailerId')) {
      urlParams.set('retailerId', retailerId);
    }
    if (storeId && !urlParams.has('storeId')) {
      urlParams.set('storeId', storeId);
    }

    const queryString = urlParams.toString();
    scopedPath = queryString ? `${basePath}?${queryString}` : basePath;
  }

  // Inject retailerId & storeId to JSON payload if missing
  let body = options.body;
  if (
    options.method &&
    ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase()) &&
    typeof body === 'string' &&
    session
  ) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (!parsed.retailerId && (session.retailerId || session.profileId || session.id)) {
          parsed.retailerId = session.retailerId || session.profileId || session.id;
        }
        if (!parsed.storeId && (session.currentStoreId || session.storeId)) {
          parsed.storeId = session.currentStoreId || session.storeId;
        }
        body = JSON.stringify(parsed);
      }
    } catch {
      // Body wasn't JSON, leave untouched
    }
  }

  const url = scopedPath.startsWith('/api') ? scopedPath : `${API_BASE}${scopedPath}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMsg =
      data && typeof data === 'object'
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || data.error || 'Request failed'
        : String(data || 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

