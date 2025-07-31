/* ───────── imports ──────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';          // CommonJS → default
const { Bootstrapper } = utils;

/* ───────── tenant auth ──────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';                     // your slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── util: make URL-safe slugs ────────────────────────────────── */
const slug = (s) =>
  s.toLowerCase()
   .trim()
   .replace(/[^a-z0-9]+/g, '-')   // spaces & punctuation → dash
   .replace(/(^-|-$)/g, '');      // cut leading/trailing dashes

/* ───────── fetch the 100 dummy products again ──────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── derive unique category list ─────────────────────────────── */
const categories = [...new Set(products.map(p => p.category))];

/* ───────── build the spec ──────────────────────────────────────────── */
const spec = {
  /* 1️⃣ category folders (shape = "category") */
  items: [
    ...categories.map((c) => ({
      name: c,
      shape: 'category',                         // existing folder shape
      tree: { path: `/products/${slug(c)}` },    // /products/category-slug
      vatType: 'No Tax',
      published: true,                           // publish the folder
      externalReference: `cat-${slug(c)}`,       // idempotency key
    })),

    /* 2️⃣ products, now placed in their category folder */
    ...products.map((p) => {
      const catSlug   = slug(p.category);
      const productSlug = slug(p.title);

      return {
        name: p.title,
        shape: 'beta-storefront',                // your existing product shape
        tree: { path: `/products/${catSlug}/${productSlug}` },
        vatType: 'No Tax',
        published: true,                         // publish product

        /* idempotency key lets Bootstrapper update instead of duplicating */
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
          name:      p.title,
          sku:       `dummy-${p.id}`,
          isDefault: true,
          price:     { default: p.price },       // single NOK price-variant
          stock:     p.stock,
          images:    p.images.map((src) => ({ src })),
          attributes: {},
        }],
      };
    }),
  ],
};

/* ───────── run the bootstrapper ─────────────────────────────────────── */
const bootstrapper = new Bootstrapper();
bootstrapper.setAccessToken(tokenId, tokenSecret);
bootstrapper.setTenantIdentifier(tenantIdentifier);
bootstrapper.setSpec(spec);

/* forceUpdate=true → existing items are updated, moved & published       */
bootstrapper.setOptions({ forceUpdate: true });

await bootstrapper.start();
await bootstrapper.kill();

console.log(`✅ Created ${categories.length} category folders and placed ${products.length} products inside them (all published).`);