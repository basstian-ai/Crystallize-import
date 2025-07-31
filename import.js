/* ─── imports ─────────────────────────────────────────────────────────── */
import utils from '@crystallize/import-utilities';          // CJS → default export
const { Bootstrapper } = utils;

/* ─── auth & tenant ───────────────────────────────────────────────────── */
const tenantIdentifier = 'starter-kit';                     // your slug
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;       // repo secret
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;   // repo secret

/* ─── tiny helper to make URL-safe paths ──────────────────────────────── */
const slug = (s) =>
  s.toLowerCase()
   .replace(/[^a-z0-9]+/g, '-')   // spaces & punctuation → dash
   .replace(/(^-|-$)/g, '');      // trim leading / trailing dash

/* ─── fetch 100 dummyjson products ────────────────────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ─── build the spec: ONLY items, shape already exists ────────────────── */
const spec = {
  items: products.map((p) => ({
    name: p.title,
    shape: 'beta-storefront',
    vatType: 'No Tax',

    /* put it in /products/<slug> */
    tree: { path: `/products/${slug(p.title)}` },

    /* shape components */
    components: {
      title:        p.title,
      description:  { json: [
        { kind: 'block', type: 'paragraph', textContent: p.description }
      ]},
      brand:        p.brand,
      thumbnail:    [{ src: p.thumbnail }],
    },

    /* one variant that satisfies the variant-components of the shape */
    variants: [{
      name:       p.title,
      sku:        `dummy-${p.id}`,
      isDefault:  true,
      price:      { default: p.price },   // “default” price-variant = NOK
      stock:      p.stock,
      images:     p.images.map((src) => ({ src })),
      attributes: {},                     // empty → still fulfils the field
    }],
  })),
};

/* ─── bootstrap the tenant ────────────────────────────────────────────── */
const bootstrapper = new Bootstrapper();
bootstrapper.setAccessToken(tokenId, tokenSecret);
bootstrapper.setTenantIdentifier(tenantIdentifier);
bootstrapper.setSpec(spec);

await bootstrapper.start();   // runs all mutations
await bootstrapper.kill();    // close handles

console.log(`✅ Imported ${products.length} products into /products`);