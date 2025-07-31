/* ───────── imports ──────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* ───────── tenant auth ──────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';          //  ← your tenant slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── helper: URL-safe slugs ───────────────────────────────────── */
const slug = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/(^-|-$)/g, '');

/* ───────── fetch dummyjson data ─────────────────────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── PASS A – attach externalReference in place ───────────────── */
const patchSpec = {
  items: products.map((p) => ({
    name: p.title,
    shape: 'product',                           // ← matches the old items
    tree: { path: `/products/${slug(p.title)}` },
    externalReference: `dummyjson-${p.id}`,
    published: true,
  })),
};

const patch = new Bootstrapper();
patch.setAccessToken(tokenId, tokenSecret);
patch.setTenantIdentifier(tenantIdentifier);
patch.setSpec(patchSpec);

console.log('▶️  Pass A: tagging existing root-level products…');
await patch.start();
await patch.kill();
console.log('✅ Pass A done – externalReference added\n');

/* ───────── get the category list for pass B ─────────────────────────── */
const categories = [...new Set(products.map((p) => p.category))];

/* ───────── PASS B – create folders & move products ──────────────────── */
const moveSpec = {
  items: [
    /* 1️⃣  category folders (shape = "category") */
    ...categories.map((c) => ({
      name: c,
      shape: 'category',
      tree: { path: `/products/${slug(c)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `cat-${slug(c)}`,
    })),

    /* 2️⃣  products now placed under their category folder */
    ...products.map((p) => {
      const cat  = slug(p.category);
      const prod = slug(p.title);

      return {
        name: p.title,
        shape: 'product',                        // keep original shape
        tree: { path: `/products/${cat}/${prod}` },
        vatType: 'No Tax',
        published: true,

        externalReference: `dummyjson-${p.id}`,  // matches Pass A key
      };
    }),
  ],
};

const move = new Bootstrapper();
move.setAccessToken(tokenId, tokenSecret);
move.setTenantIdentifier(tenantIdentifier);
move.setSpec(moveSpec);

console.log('▶️  Pass B: creating categories and moving products…');
await move.start();
await move.kill();

console.log(
  `🎉 All done – ${categories.length} categories created and ` +
  `${products.length} products moved & published under /products/<category>/<product>`
);