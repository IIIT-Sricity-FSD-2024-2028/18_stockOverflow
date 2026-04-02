(function () {
  var STORAGE_KEY = 'imsRetailerProductsV1';
  const masterProducts = [
    {
      sku: 'PT001',
      name: 'Lenovo IdeaPad 3',
      category: 'Computers',
      brand: 'Lenovo',
      priceUSD: 600,
      unit: 'Pc',
      qty: 100,
      max: 300,
      creator: 'James Kirwin',
      creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4',
      productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2',
      emoji: '💻',
      soldThisMonth: 22,
      trend: 'up'
    },
    {
      sku: 'PT002',
      name: 'Beats Pro',
      category: 'Electronics',
      brand: 'Beats',
      priceUSD: 160,
      unit: 'Pc',
      qty: 140,
      max: 300,
      creator: 'Francis Chang',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417',
      productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7',
      emoji: '🎧',
      soldThisMonth: 38,
      trend: 'up'
    },
    {
      sku: 'PT003',
      name: 'Nike Jordan',
      category: 'Shoe',
      brand: 'Nike',
      priceUSD: 110,
      unit: 'Pc',
      qty: 300,
      max: 500,
      creator: 'Antonio Engle',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d5518c84-4bc4-4659-9958-20d59962e84b',
      productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d',
      emoji: '👟',
      soldThisMonth: 54,
      trend: 'up'
    },
    {
      sku: 'PT004',
      name: 'Apple Series 5 Watch',
      category: 'Electronics',
      brand: 'Apple',
      priceUSD: 120,
      unit: 'Pc',
      qty: 450,
      max: 500,
      creator: 'Leo Kelly',
      creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb',
      productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547',
      emoji: '⌚',
      soldThisMonth: 17,
      trend: 'down'
    },
    {
      sku: 'PT005',
      name: 'Amazon Echo Dot',
      category: 'Electronics',
      brand: 'Amazon',
      priceUSD: 80,
      unit: 'Pc',
      qty: 320,
      max: 500,
      creator: 'Annette Walker',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268',
      productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85',
      emoji: '🔊',
      soldThisMonth: 29,
      trend: 'up'
    },
    {
      sku: 'PT006',
      name: 'Sanford Chair Sofa',
      category: 'Furniture',
      brand: 'Modern Wave',
      priceUSD: 320,
      unit: 'Pc',
      qty: 650,
      max: 800,
      creator: 'John Weaver',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca',
      productImg: 'https://www.figma.com/api/mcp/asset/97dece36-1822-41e2-ac5d-abf55c224abd',
      emoji: '🛋️',
      soldThisMonth: 8,
      trend: 'down'
    },
    {
      sku: 'PT007',
      name: 'Red Premium Satchel',
      category: 'Bags',
      brand: 'Dior',
      priceUSD: 60,
      unit: 'Pc',
      qty: 700,
      max: 800,
      creator: 'Gary Hennessy',
      creatorImg: 'https://www.figma.com/api/mcp/asset/38d4ff50-b365-4010-89a3-c4c7970201ca',
      productImg: 'https://www.figma.com/api/mcp/asset/97044a6f-0f4a-486c-ac45-ad0f2c5a0c62',
      emoji: '👜',
      soldThisMonth: 41,
      trend: 'up'
    },
    {
      sku: 'PT008',
      name: 'iPhone 14 Pro',
      category: 'Phone',
      brand: 'Apple',
      priceUSD: 540,
      unit: 'Pc',
      qty: 630,
      max: 800,
      creator: 'Eleanor Panek',
      creatorImg: 'https://www.figma.com/api/mcp/asset/0ea47749-df36-4768-bff0-50654a1e9123',
      productImg: 'https://www.figma.com/api/mcp/asset/37ec56a8-ac9e-4371-a973-68a8a931703c',
      emoji: '📱',
      soldThisMonth: 63,
      trend: 'up'
    },
    {
      sku: 'PT009',
      name: 'Gaming Chair',
      category: 'Furniture',
      brand: 'Arlime',
      priceUSD: 200,
      unit: 'Pc',
      qty: 410,
      max: 500,
      creator: 'William Levy',
      creatorImg: 'https://www.figma.com/api/mcp/asset/c443dd72-8038-47b5-9154-94f8138db7d3',
      productImg: 'https://www.figma.com/api/mcp/asset/8d113917-5b4a-4693-94f4-98177c4d6cc6',
      emoji: '🪑',
      soldThisMonth: 12,
      trend: 'down'
    },
    {
      sku: 'PT010',
      name: 'Borealis Backpack',
      category: 'Bags',
      brand: 'The North Face',
      priceUSD: 45,
      unit: 'Pc',
      qty: 550,
      max: 800,
      creator: 'Charlotte Klotz',
      creatorImg: 'https://www.figma.com/api/mcp/asset/7aa74334-d316-48b9-9833-a00521f5ebc1',
      productImg: 'https://www.figma.com/api/mcp/asset/3cca4ac4-77e6-416c-9fc3-97d627b98218',
      emoji: '🎒',
      soldThisMonth: 33,
      trend: 'up'
    },
    {
      sku: 'PT011',
      name: 'Sony WH-1000XM6',
      category: 'Electronics',
      brand: 'Sony',
      priceUSD: 349,
      unit: 'Pc',
      qty: 8,
      max: 300,
      creator: 'James Kirwin',
      creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4',
      productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7',
      emoji: '🎧',
      soldThisMonth: 55,
      trend: 'up'
    },
    {
      sku: 'PT012',
      name: 'MacBook Air M4',
      category: 'Computers',
      brand: 'Apple',
      priceUSD: 1099,
      unit: 'Pc',
      qty: 0,
      max: 200,
      creator: 'Francis Chang',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417',
      productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2',
      emoji: '💻',
      soldThisMonth: 19,
      trend: 'up'
    },
    {
      sku: 'PT013',
      name: "Levi's 512 Jeans",
      category: 'Fashion',
      brand: "Levi's",
      priceUSD: 79,
      unit: 'Pc',
      qty: 480,
      max: 600,
      creator: 'Leo Kelly',
      creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb',
      productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d',
      emoji: '👖',
      soldThisMonth: 28,
      trend: 'up'
    },
    {
      sku: 'PT014',
      name: 'Dyson V16 Vacuum',
      category: 'Appliances',
      brand: 'Dyson',
      priceUSD: 599,
      unit: 'Pc',
      qty: 5,
      max: 150,
      creator: 'Annette Walker',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268',
      productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547',
      emoji: '🧹',
      soldThisMonth: 7,
      trend: 'down'
    },
    {
      sku: 'PT015',
      name: 'Nike Air Max 2025',
      category: 'Shoe',
      brand: 'Nike',
      priceUSD: 189,
      unit: 'Pc',
      qty: 210,
      max: 400,
      creator: 'John Weaver',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca',
      productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85',
      emoji: '👟',
      soldThisMonth: 47,
      trend: 'up'
    }
  ];

  function loadPersistedProducts() {
    try {
      if (window.DB) {
        var parsed = window.DB.getInventory();
        if (!Array.isArray(parsed) || parsed.length === 0) {
          return null;
        }
        return parsed;
      } else {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      }
    } catch (error) {
      return null;
    }
  }

  function mergeProducts(baseProducts, persistedProducts) {
    if (!Array.isArray(persistedProducts) || persistedProducts.length === 0) {
      return baseProducts.map(function (product) {
        return Object.assign({}, product);
      });
    }

    var mergedBySku = {};
    var baseBySku = {};

    baseProducts.forEach(function (product) {
      baseBySku[product.sku] = product;
      mergedBySku[product.sku] = Object.assign({}, product);
    });

    persistedProducts.forEach(function (product) {
      var base = mergedBySku[product.sku] || {};
      mergedBySku[product.sku] = Object.assign({}, base, product);
    });

    var ordered = [];
    baseProducts.forEach(function (product) {
      ordered.push(mergedBySku[product.sku]);
    });

    persistedProducts.forEach(function (product) {
      if (!baseBySku[product.sku]) {
        ordered.push(mergedBySku[product.sku]);
      }
    });

    return ordered;
  }

  function buildListProducts(products) {
    return products.map(function (p) {
      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: '$' + p.priceUSD,
        unit: p.unit,
        qty: p.qty,
        creator: p.creator,
        creatorImg: p.creatorImg,
        productImg: p.productImg
      };
    });
  }

  function buildInventoryProducts(products) {
    return products.map(function (p) {
      return {
        sku: p.sku,
        name: p.name,
        cat: p.category,
        qty: p.qty,
        max: p.max,
        price: p.priceUSD,
        emoji: p.emoji,
        soldThisMonth: p.soldThisMonth,
        trend: p.trend
      };
    });
  }

  function buildSampleProductNames(products) {
    return products.map(function (p) {
      return p.name;
    });
  }

  function cloneProducts(products) {
    return products.map(function (p) {
      return Object.assign({}, p);
    });
  }

  function persistProducts(products) {
    try {
      if (window.DB) {
        window.DB.saveInventory(products);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyResolvedProducts(products) {
    resolvedMasterProducts = cloneProducts(products);
    listProducts = buildListProducts(resolvedMasterProducts);
    inventoryProducts = buildInventoryProducts(resolvedMasterProducts);
    sampleProductNames = buildSampleProductNames(resolvedMasterProducts);
  }

  function getMasterProducts() {
    return cloneProducts(resolvedMasterProducts);
  }

  function generateNextSku() {
    var maxSkuNum = 0;
    resolvedMasterProducts.forEach(function (p) {
      var match = /^PT(\d+)$/.exec(String(p.sku || '').toUpperCase());
      if (match) {
        var num = parseInt(match[1], 10);
        if (num > maxSkuNum) {
          maxSkuNum = num;
        }
      }
    });

    var next = maxSkuNum + 1;
    return 'PT' + String(next).padStart(3, '0');
  }

  function upsertProduct(product) {
    if (!product || !product.sku) {
      return null;
    }

    var current = getMasterProducts();
    var idx = current.findIndex(function (p) {
      return p.sku === product.sku;
    });

    if (idx >= 0) {
      current[idx] = Object.assign({}, current[idx], product);
    } else {
      current.push(Object.assign({}, product));
    }

    if (!persistProducts(current)) {
      return null;
    }

    applyResolvedProducts(current);
    return Object.assign({}, idx >= 0 ? current[idx] : product);
  }

  function deleteProductBySku(sku) {
    if (!sku) {
      return false;
    }

    var current = getMasterProducts();
    var next = current.filter(function (p) {
      return p.sku !== sku;
    });

    if (next.length === current.length) {
      return false;
    }

    if (!persistProducts(next)) {
      return false;
    }

    applyResolvedProducts(next);
    return true;
  }

  var persistedProducts = loadPersistedProducts();
  var resolvedMasterProducts = mergeProducts(masterProducts, persistedProducts);
  var listProducts = buildListProducts(resolvedMasterProducts);
  var inventoryProducts = buildInventoryProducts(resolvedMasterProducts);
  var sampleProductNames = buildSampleProductNames(resolvedMasterProducts);

  window.RetailerProductsData = {
    storageKey: STORAGE_KEY,
    masterProducts: resolvedMasterProducts,
    listProducts: listProducts,
    inventoryProducts: inventoryProducts,
    sampleProductNames: sampleProductNames,
    getMasterProducts: getMasterProducts,
    generateNextSku: generateNextSku,
    upsertProduct: upsertProduct,
    deleteProductBySku: deleteProductBySku
  };

  Object.defineProperties(window.RetailerProductsData, {
    masterProducts: {
      get: function () {
        return resolvedMasterProducts;
      }
    },
    listProducts: {
      get: function () {
        return listProducts;
      }
    },
    inventoryProducts: {
      get: function () {
        return inventoryProducts;
      }
    },
    sampleProductNames: {
      get: function () {
        return sampleProductNames;
      }
    }
  });
})();
