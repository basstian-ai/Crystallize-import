/* ───────── imports ──────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';          // CommonJS → default
const { Bootstrapper } = utils;

/* ───────── tenant auth ──────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';          // ← your tenant slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── helper: URL-safe slug ─────────────────────────────────────── */
const slug = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/(^-|-$)/g, '');

/* ───────── fetch the dummyjson payload ──────────────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── PASS A — add externalReference in-place ──────────────────── */
const patchSpec = {
  /* no shapes, no categories — just touch the 100 products where they are */
  items: products.map((p) => ({
    name: p.title,
    shape: 'beta-storefront',
    tree: { path: `/products/${slug(p.title)}` },   // current location
    externalReference: `dummyjson-${p.id}`,         // NEW key
    published: true,                                // keep published
  })),
};

const patchBootstrapper = new Bootstrapper();
patchBootstrapper.setAccessToken(tokenId, tokenSecret);
patchBootstrapper.setTenantIdentifier(tenantIdentifier);
patchBootstrapper.setSpec(patchSpec);

console.log('▶️  Pass A: adding externalReference to existing items…');
await patchBootstrapper.start();
await patchBootstrapper.kill();
console.log('✅ Pass A done\n');

/* ───────── derive category list for pass B ──────────────────────────── */
const categories = [...new Set(products.map((p) => p.category))];

/* ───────── PASS B — create/move & publish ───────────────────────────── */
const moveSpec = {
  items: [
    /* 1️⃣  category folders */
    ...categories.map((c) => ({
      name: c,
      shape: 'category',
      tree: { path: `/products/${slug(c)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `cat-${slug(c)}`,
    })),

    /* 2️⃣  products now placed in the category folder */
    ...products.map((p) => {
      const cat  = slug(p.category);
      const prod = slug(p.title);

      return {
        name: p.title,
        shape: 'beta-storefront',
        tree: { path: `/products/${cat}/${prod}` },
        vatType: 'No Tax',
        published: true,

        externalReference: `dummyjson-${p.id}`,      // matches Pass A key

        components: {
          title:       p.title,
          description: { json: [
            { kind: 'block', type: 'paragraph', textContent: p.description }
          ]},
          brand:       p.brand,
          thumbnail:   [{ src: p.thumbnail }],
        },

        variants: [{
          name:       p.title,
          sku:        `dummy-${p.id}`,
          isDefault:  true,
          price:      { default: p.price },          // NOK “default” price-variant
          stock:      p.stock,
          images:     p.images.map((src) => ({ src })),
          attributes: {},
        }],
      };
    }),
  ],
};

const moveBootstrapper = new Bootstrapper();
moveBootstrapper.setAccessToken(tokenId, tokenSecret);
moveBootstrapper.setTenantIdentifier(tenantIdentifier);
moveBootstrapper.setSpec(moveSpec);

console.log('▶️  Pass B: creating categories and moving products…');
await moveBootstrapper.start();
await moveBootstrapper.kill();
console.log(`🎉 All done: ${categories.length} categories + ${products.length} products now live under /products/<category>/<product>\n`);