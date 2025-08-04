/* ------------------------------------------------------------------ */
/*  one-shot import  –  topics instead of folder categories           */
/* ------------------------------------------------------------------ */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant creds ------------------------------------------------------ */
const tenantIdentifier = 'starter-kit';         // change if needed
const tokenId          = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret      = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helpers ----------------------------------------------------------- */
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* 1) fetch 10 products (remote → local fallback) ------------------- */
let products;
try {
  const { products: p } =
    await (await fetch('https://dummyjson.com/products?limit=10')).json();
  products = p;
  console.log('📡  fetched 10 products from dummyjson.com');
} catch { /* ignore */ }

if (!products) {
  console.log('⚠️  remote fetch failed – using local dummy-products.json');
  const fs = await import('node:fs/promises');
  products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
}

if (!Array.isArray(products) || !products.length) {
  throw new Error('❌ no products array – aborting import');
}

const categories = [...new Set(products.map((p) => p.category))];

/* 2) build import spec --------------------------------------------- */
const spec = { items: [] };

/* 2-A  root /products folder (simple folder shape) ------------------ */
spec.items.push({
  name : 'Products',
  shape: 'default-folder',
  tree : { path: '/products' },
  published: true,
  externalReference: 'root-products',
});

/* 2-B  topic-map root /categories (shape = topic) ------------------- */
spec.items.push({
  name : 'Categories',
  shape: 'topic',
  tree : { path: '/categories' },
  published: true,
  externalReference: 'root-categories',
});

/* 2-C  topics under /categories ------------------------------------ */
for (const c of categories) {
  spec.items.push({
    name : c,
    shape: 'topic',
    tree : { path: `/categories/${slug(c)}` },
    published: true,
    externalReference: `cat-${slug(c)}`,
  });
}

/* 2-D  products at /products/<slug> with topic refs ---------------- */
for (const p of products) {
  const prodSlug = slug(p.title);
  const topicRef = `/categories/${slug(p.category)}`;

  spec.items.push({
    name : p.title,
    shape: 'beta-storefront',
    tree : { path: `/products/${prodSlug}` },
    vatType: 'No Tax',
    published: true,
    externalReference: `dummyjson-${p.id}`,

    /* assign the topic */
    topics: [ topicRef ],

    /* components */
    components: {
      title      : p.title,
      description: { json:[
        {
          kind:'block',
          type:'paragraph',
          textContent: p.description,
        },
      ]},
      brand     : p.brand,
      thumbnail : [{ src: p.thumbnail }],
    },

    variants: [{
      name      : p.title,
      sku       : `dummy-${p.id}`,
      isDefault : true,
      price     : { default: p.price },     // NOK default price-variant
      stock     : p.stock,
      images    : p.images.map((src) => ({ src })),
      attributes: {},
    }],
  });
}

/* 3) bootstrap ------------------------------------------------------ */
const bs = new Bootstrapper();
bs.setTenantIdentifier(tenantIdentifier);
bs.setAccessToken(tokenId, tokenSecret);
bs.setSpec(spec);

console.log(
  `▶ importing ${products.length} products into ${categories.length} topics…`
);
await bs.start();
await bs.kill();
console.log('🎉 import complete – topics ready');
