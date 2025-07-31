/* ───────── imports ──────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';          // CommonJS package → default export
const { Bootstrapper } = utils;

/* ───────── tenant auth ──────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';   //  <<— replace with your tenant slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── helper: make URL-safe slugs ──────────────────────────────── */
const slug = (s) =>
  s.toLowerCase()
   .trim()
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/(^-|-$)/g, '');

/* ───────── fetch the 100 dummyjson products ─────────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── derive unique category list ──────────────────────────────── */
const categories = [...new Set(products.map((p) => p.category))];

/* ───────── build the spec object ────────────────────────────────────── */
const spec = {
  items: [
    /* 1️⃣  Category folders (shape = "category") */
    ...categories.map((c) => ({
      name: c,
      shape: 'category',
      tree: { path: `/products/${slug(c)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `cat-${slug(c)}`,   // key for idempotent updates
    })),

    /* 2️⃣  Products placed in their category folder */
    ...products.map((p) => {
      const cat  = slug(p.category);
      const prod = slug(p.title);

      return {
        name: p.title,
        shape: 'beta-storefront',
        tree: { path: `/products/${cat}/${prod}` },
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
          price:      { default: p.price },   // your tenant’s only price variant (NOK)
          stock:      p.stock,
          images:     p.images.map((src) => ({ src })),
          attributes: {},
        }],
      };
    }),
  ],
};

/* ───────── bootstrap the tenant ─────────────────────────────────────── */
const bootstrapper = new Bootstrapper();
bootstrapper.setAccessToken(tokenId, tokenSecret);
bootstrapper.setTenantIdentifier(tenantIdentifier);
bootstrapper.setSpec(spec);

/* NOTE: no setOptions() required in current import-utilities */
await bootstrapper.start();   // performs create / update / move / publish
await bootstrapper.kill();    // close open handles (good practice)

console.log(
  `✅ Categories: ${categories.length}, Products: ${products.length} — all synced & published`
);