/*************************************************************************
 * Import 100 dummyjson products + Topic map “Categories”                *
 *************************************************************************/
import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant ------------------------------------------------------------- */
const tenantIdentifier = 'starter-kit';
const tokenId          = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret      = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helper ------------------------------------------------------------- */
const slug = s =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* 1) fetch products (remote → local) -------------------------------- */
let products;
try {
  const { products: p } =
    await (await fetch('https://dummyjson.com/products?limit=100')).json();
  products = p;
  console.log('📡 fetched from dummyjson.com');
} catch {}

if (!products) {
  console.log('⚠️  remote fetch failed – using local dummy-products.json');
  const fs = await import('node:fs/promises');
  products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
}
if (!Array.isArray(products) || !products.length) {
  throw new Error('no products – aborting');
}

const categories = [...new Set(products.map(p => p.category))];

/* 2) build spec ----------------------------------------------------- */
const spec = {
  topicMaps: [
    {
      name          : { en: 'Categories' },
      path          : { en: '/categories' },
      pathIdentifier: { en: 'categories' },

      /* valid topic objects – no externalReference */
      topics: categories.map(c => ({
        name : { en: c },
        path : { en: `/categories/${slug(c)}` },   // absolute
      })),
    },
  ],

  items: [
    {
      name : 'Products',
      shape: 'default-folder',
      tree : { path: '/products' },
      published: true,
      externalReference: 'root-products',
    },

    ...products.map(p => ({
      name : p.title,
      shape: 'beta-storefront',
      tree : { path: `/products/${slug(p.title)}` },
      vatType  : 'No Tax',
      published: true,
      externalReference: `dummyjson-${p.id}`,

      /* tag with the topic path */
      topics: [ `/categories/${slug(p.category)}` ],

      components: {
        title      : p.title,
        description: { json:[
          { type:'paragraph', children:[{ text:p.description }] },
        ]},
        brand     : p.brand,
        thumbnail : [{ src:p.thumbnail }],
      },

      variants: [{
        name      : p.title,
        sku       : `dummy-${p.id}`,
        isDefault : true,
        price     : { default: p.price },
        stock     : p.stock,
        images    : p.images.map(src => ({ src })),
      }],
    })),
  ],
};

/* 3) bootstrap ------------------------------------------------------ */
const bs = new Bootstrapper();
bs.setTenantIdentifier(tenantIdentifier);
bs.setAccessToken(tokenId, tokenSecret);
bs.setSpec(spec);

console.log(`▶ importing ${products.length} products into ${categories.length} topics…`);
await bs.start();
await bs.kill();
console.log('🎉 import finished – products now tagged by topic');
