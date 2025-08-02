/* ───────── imports ──────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* ───────── tenant auth ──────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';              //  ← your tenant slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── helper: slugify for paths ────────────────────────────────── */
const slug = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/(^-|-$)/g, '');

/* ───────── fetch the 100 dummyjson products again ───────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── derive unique category list ──────────────────────────────── */
const categories = [...new Set(products.map((p) => p.category))];
const items = [];

/* 0️⃣ root /products folder */
items.push({
  name : 'Products',
  shape: 'folder',
  tree : { path: '/products' },
  published: true,
  externalReference: 'root-products-folder',
});

/* 1️⃣ category folders */
for (const c of categories){
  items.push({
    name : c,
    shape: 'category',
    tree : { parentId: 'root-products-folder', name: slug(c) },
    published: true,
    externalReference: `cat-${slug(c)}`,
  });
}

/* 2️⃣ products */
for (const p of products){
  const catRef = `cat-${slug(p.category)}`;
  items.push({
    name : p.title,
    shape: 'beta-storefront',
    tree : { parentId: catRef, name: slug(p.title) },
    vatType: 'No Tax',
    published: true,
    externalReference: `dummyjson-${p.id}`,
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
      price:      { default: p.price },
      stock:      p.stock,
      images:     p.images.map((src) => ({ src })),
      attributes: {},
    }],
  });
}

const bs = new Bootstrapper();
bs.setAccessToken(tokenId, tokenSecret);
bs.setTenantIdentifier(tenantIdentifier);
bs.setSpec({ items });

console.log(`▶ importing ${products.length} products into ${categories.length} categories…`);
await bs.start();
console.log('🎉 import complete – catalogue ready');
