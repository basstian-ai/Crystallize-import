/* fresh import – /products → categories → 100 products --------------- */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant creds ------------------------------------------------------ */
const tenantIdentifier = 'starter-kit';          // change if needed
const tokenId          = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret      = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helper ------------------------------------------------------------ */
const slug = s => s.toLowerCase().trim()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');

/* 1️⃣  get the dummy data (remote → local fallback) ----------------- */
let products;
try {
  const { products: p } =
    await (await fetch('https://dummyjson.com/products?limit=100')).json();
  products = p;
  console.log('📡  fetched 100 products from dummyjson.com');
} catch { /* ignore */ }

if (!products) {
  console.log('⚠️  remote fetch failed – using local dummy-products.json');
  const fs = await import('node:fs/promises');
  products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
}

if (!Array.isArray(products) || !products.length) {
  throw new Error('❌ no products – aborting import');
}

const categories = [...new Set(products.map(p => p.category))];

/* 2️⃣  build spec --------------------------------------------------- */
const items = [];

/* /products root folder (only once) */
items.push({
  name : 'Products',
  shape: 'folder',                     // use a simple folder shape
  tree : { path: '/products' },
  published: true,
  externalReference: 'root-products',
});

/* category folders */
for (const c of categories) {
  items.push({
    name : c,
    shape: 'category',
    tree : { parentId: 'root-products', name: slug(c) },
    published: true,
    externalReference: `cat-${slug(c)}`,
  });
}

/* products */
for (const p of products) {
  items.push({
    name : p.title,
    shape: 'beta-storefront',
    tree : {
      parentId: `cat-${slug(p.category)}`,
      name    : slug(p.title),
    },
    vatType   : 'No Tax',
    published : true,
    externalReference: `dummyjson-${p.id}`,

    components: {
      title      : p.title,
      description: { json:[
        { type:'paragraph',
          children:[{ text: p.description }] }
      ]},
      brand     : p.brand,
      thumbnail : [{ src: p.thumbnail }],
    },

    variants: [{
      name      : p.title,
      sku       : `dummy-${p.id}`,
      isDefault : true,
      price     : { default: p.price },   // NOK default price-variant
      stock     : p.stock,
      images    : p.images.map(src=>({src})),
      attributes: {},
    }],
  });
}

/* 3️⃣  run bootstrapper -------------------------------------------- */
const bs = new Bootstrapper();
bs.setTenantIdentifier(tenantIdentifier);
bs.setAccessToken(tokenId, tokenSecret);
bs.setSpec({ items });

console.log(`▶ importing ${products.length} products into ${categories.length} categories…`);
await bs.start();
await bs.kill();
console.log('🎉 import complete – catalogue ready');
