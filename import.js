/*************************************************************************
 *  Import 100 dummyjson products + Topic map “Categories”               *
 *  - creates /categories topic-map, one topic per dummyjson category    *
 *  - creates /products folder, one product per slug                     *
 *  - tags each product with its topic                                   *
 *  Idempotent via externalReference.                                    *
 *************************************************************************/
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant ------------------------------------------------------------- */
const tenantIdentifier = 'starter-kit';            // change if needed
const tokenId          = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret      = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helper ------------------------------------------------------------- */
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* 1️⃣  fetch 100 products (remote → local fallback) ------------------ */
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
  throw new Error('no products – aborting');
}

const categories = [...new Set(products.map((p) => p.category))];

/* 2️⃣  build import spec --------------------------------------------- */
const spec = {
  /* 2-A  topic-map with embedded topics ---------------------------- */
  topicMaps: [
    {
      name          : { en: 'Categories' },
      path          : { en: '/categories' },
      pathIdentifier: { en: 'categories' },

      /* all category topics live INSIDE this map */
      topics: categories.map((c) => ({
        name          : { en: c },
        path          : { en: `/${slug(c)}` },      // relative to map
        pathIdentifier: { en: slug(c) },
        externalReference: `cat-${slug(c)}`,
      })),
    },
  ],

  /* 2-B  catalogue items ------------------------------------------ */
  items: [
    /* root /products folder */
    {
      name : 'Products',
      shape: 'default-folder',
      tree : { path: '/products' },
      published: true,
      externalReference: 'root-products',
    },

    /* every product */
    ...products.map((p) => ({
      name : p.title,
      shape: 'beta-storefront',
      tree : { path: `/products/${slug(p.title)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `dummyjson-${p.id}`,

      /* tag with full topic path (map path + relative) */
      topics: [ `/categories/${slug(p.category)}` ],

      components: {
        title      : p.title,
        description: { json:[
          {
            type:'paragraph',
            children:[{ text:p.description }],
          },
        ]},
        brand     : p.brand,
        thumbnail : [{ src:p.thumbnail }],
      },

      variants: [
        {
          name      : p.title,
          sku       : `dummy-${p.id}`,
          isDefault : true,
          price     : { default: p.price },
          stock     : p.stock,
          images    : p.images.map((src) => ({ src })),
        },
      ],
    })),
  ],
};

/* 3️⃣  bootstrap ----------------------------------------------------- */
const bs = new Bootstrapper();
bs.setTenantIdentifier(tenantIdentifier);
bs.setAccessToken(tokenId, tokenSecret);
bs.setSpec(spec);

console.log(
  `▶ importing ${products.length} products + ${categories.length} topics…`,
);
await bs.start();
await bs.kill();
console.log('🎉 import finished – products tagged by topic');
