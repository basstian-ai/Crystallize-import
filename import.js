/* one-shot import — /products → categories → 100 products ------------- */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant creds ------------------------------------------------------- */
const tenantIdentifier = 'starter-kit';           // change if needed
const tokenId          = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret      = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helpers ------------------------------------------------------------ */
const slug = s => s.toLowerCase().trim()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');

/* 1️⃣  get the 100 products (remote → local fallback) ---------------- */
let products;
try {
  const { products: p } =
    await (await fetch('https://dummyjson.com/products?limit=100')).json();
  products = p;
  console.log('📡  fetched 100 products from dummyjson.com');
} catch { /* ignore network errors */ }

if (!products) {
  console.log('⚠️  remote fetch failed – using local dummy-products.json');
  const fs = await import('node:fs/promises');
  products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
}
if (!Array.isArray(products) || !products.length) {
  throw new Error('❌ no products array – aborting import');
}

const categories = [...new Set(products.map(p => p.category))];

/* 2️⃣  build spec ---------------------------------------------------- */
const spec = { items: [] };

/*  root folder /products  */
spec.items.push({
  name : 'Products',
  shape: 'default-folder',                      // simple folder shape
  tree : { path: '/products' },
  published: true,
});
//---------------------------------------------------------------
// move-spec: relocate existing categories + products
//---------------------------------------------------------------
const moveItems = [];

// categories → set parentId to root-products
for (const c of categories) {
  moveItems.push({
    name : c,                     // optional
    shape: 'category',
    externalReference: `cat-${slug(c)}`,
    tree : { parentId: 'root-products' },   // tell Bootstrapper to move
    published: true,
  });
}

// products → set parentId to the *category* reference
for (const p of products) {
  moveItems.push({
    name : p.title,               // optional
    shape: 'beta-storefront',
    externalReference: `dummyjson-${p.id}`,
    tree : { parentId: `cat-${slug(p.category)}` },
    published: true,
  });
}

spec.items.push(...moveItems);     // append to the spec you already built

/*  category folders (path-based)  */
for (const c of categories) {
  spec.items.push({
    name : c,
    shape: 'category',
    tree : { path: `/products/${slug(c)}` },
    published: true,
    externalReference: `cat-${slug(c)}`,
  });
}

/*  products (path-based)  */
for (const p of products) {
  const catSlug  = slug(p.category);
  const prodSlug = slug(p.title);

  spec.items.push({
    name : p.title,
    shape: 'beta-storefront',
    tree : { path: `/products/${catSlug}/${prodSlug}` },
    vatType: 'No Tax',
    published: true,
    externalReference: `dummyjson-${p.id}`,

    components: {
      title      : p.title,
      description: { json:[
        {
          kind       : 'block',
          type       : 'paragraph',
          textContent: p.description
        }
      ]},
      brand     : p.brand,
      thumbnail : [{ src: p.thumbnail }],
    },

    variants: [{
      name      : p.title,
      sku       : `dummy-${p.id}`,
      isDefault : true,
      price     : { default: p.price },   // “default” NOK price-variant
      stock     : p.stock,
      images    : p.images.map(src => ({ src })),
      attributes: {},
    }],
  });
}

/* 3️⃣  bootstrap ----------------------------------------------------- */
const bs = new Bootstrapper();
bs.setTenantIdentifier(tenantIdentifier);
bs.setAccessToken(tokenId, tokenSecret);
bs.setSpec(spec);

console.log(`▶ importing ${products.length} products into ${categories.length} categories…`);
await bs.start();
await bs.kill();
console.log('🎉 import complete – catalogue ready');
