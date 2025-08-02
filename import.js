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

/* ───────── fetch the 100 dummyjson products again ───────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── PASS A – tag existing root-level items ─────────────────────
   Matches by current path (/products/<slug>) *and* correct shape
   (beta-storefront) so Bootstrapper can update in-place.                */
const patchSpec = {
  items: products.map((p) => ({
    name: p.title,
    shape: 'beta-storefront',                      // ← match existing shape
    tree: { path: `/products/${slug(p.title)}` },  // ← match existing path
    externalReference: `dummyjson-${p.id}`,        // ← NEW idempotent key
    published: true,
  })),
};

const patch = new Bootstrapper();
patch.setAccessToken(tokenId, tokenSecret);
patch.setTenantIdentifier(tenantIdentifier);
patch.setSpec(patchSpec);

console.log('▶️  Pass A: adding externalReference to root-level items…');
await patch.start();
await patch.kill();
console.log('✅ Pass A done – every item now has externalReference\n');

/* ───────── derive unique category list for Pass B ───────────────────── */
const categories = [...new Set(products.map((p) => p.category))];

/* ───────── PASS B – create folders, move & publish products ─────────── */
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

    /* 2️⃣  products moved under their category folder */
    ...products.map((p) => {
      const cat  = slug(p.category);
      const prod = slug(p.title);

      return {
        name: p.title,
        shape: 'beta-storefront',                  // keep original shape
        tree: { path: `/products/${cat}/${prod}` },
        vatType: 'No Tax',
        published: true,

        externalReference: `dummyjson-${p.id}`,    // matches Pass A key

        /* optional: refresh main fields while we’re at it */
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
          price:      { default: p.price },        // NOK “default” price-variant
          stock:      p.stock,
          images:     p.images.map((src) => ({ src })),
          attributes: {},
        }],
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
  `${products.length} products moved + published under /products/<category>/<product>`
);
