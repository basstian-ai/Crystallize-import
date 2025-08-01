/* ------------------------------------------------------------------ */
/*  fresh one-pass import  –  100 products into their categories      */
/* ------------------------------------------------------------------ */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* ─── tenant creds ───────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';       //  change if needed
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ─── helper: safe slug ------------------------------------------- */
const slug = s => s.toLowerCase().trim()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');

/* ─── 1) try remote dummyjson, else local file -------------------- */
let products;
try {
  const res = await (await fetch(
    'https://dummyjson.com/products?limit=100'
  )).json();
  if (Array.isArray(res.products)) {
    products = res.products;
    console.log('📡  fetched 100 products from dummyjson.com');
  }
} catch { /* ignore network/json errors */ }

if (!products) {
  console.log('⚠️  remote fetch failed – using local dummy-products.json');
  const fs = await import('node:fs/promises');
  products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
}

if (!Array.isArray(products) || !products.length) {
  throw new Error('No products array available – aborting import.');
}

/* ─── 2) derive unique category list ------------------------------ */
const categories = [...new Set(products.map(p => p.category))];

/* ─── 3) build minimal spec -------------------------------------- */
const spec = {
  items: [
    /* folders */
    ...categories.map(c => ({
      name  : c,
      shape : 'category',
      tree  : { path: `/products/${slug(c)}` },
      published: true,
      externalReference: `cat-${slug(c)}`,
    })),

    /* products */
    ...products.map(p => ({
      name : p.title,
      shape: 'beta-storefront',
      tree : { path: `/products/${slug(p.category)}/${slug(p.title)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `dummyjson-${p.id}`,

      components: {
        title      : p.title,
        description: { json:[
          { type:'paragraph', children:[{ text:p.description }]}
        ]},
        brand     : p.brand,
        thumbnail : [{ src: p.thumbnail }],
      },

      variants: [{
        name      : p.title,
        sku       : `dummy-${p.id}`,
        isDefault : true,
        price     : { default: p.price },   // NOK price variant
        stock     : p.stock,
        images    : p.images.map(src=>({src})),
        attributes: {},
      }],
    })),
  ],
};

/* ─── 4) bootstrap in one pass ----------------------------------- */
const bs = new Bootstrapper();
bs.setAccessToken(tokenId, tokenSecret);
bs.setTenantIdentifier(tenantIdentifier);
bs.setSpec(spec);

console.log(`▶ importing ${products.length} products into ${categories.length} categories…`);
await bs.start();
await bs.kill();
console.log('🎉 import complete – catalogue ready');
