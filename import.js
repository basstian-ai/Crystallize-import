import utils from '@crystallize/import-utilities';
const { Bootstrapper } = utils;

/* tenant ------------------------------------------------------------- */
const tenantIdentifier = 'starter-kit';
const tokenId = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* helper ------------------------------------------------------------- */
const slug = s =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* 1) fetch products (remote → local) -------------------------------- */
let products;
try {
  const { products: p } = await (await fetch('https://dummyjson.com/products?limit=10')).json();
  products = p;
  console.log('📡 fetched from dummyjson.com');
} catch (error) {
  console.error('Fetch error:', error);
}

if (!products) {
  console.log('⚠️ remote fetch failed – using local dummy-products.json');
  try {
    const fs = await import('node:fs/promises');
    products = JSON.parse(await fs.readFile('./dummy-products.json', 'utf8'));
  } catch (error) {
    console.error('Local file read error:', error);
  }
}
if (!Array.isArray(products) || !products.length) {
  throw new Error('no products – aborting');
}

const categories = [...new Set(products.map(p => p.category))];

/* 2) build topic map spec ------------------------------------------- */
const topicMapSpec = {
  topicMaps: [
    {
      name: { en: 'Categories' },
      path: { en: '/categories' },
      pathIdentifier: { en: 'categories' },
      topics: categories.map(c => ({
        name: { en: c },
        path: { en: `/${slug(c)}` }, // relative path
      })),
    },
  ],
};

/* 3) bootstrap topic map -------------------------------------------- */
const bsTopicMap = new Bootstrapper();
bsTopicMap.setTenantIdentifier(tenantIdentifier);
bsTopicMap.setAccessToken(tokenId, tokenSecret);
bsTopicMap.setSpec(topicMapSpec);

console.log(`▶ importing topic map with ${categories.length} topics…`);
try {
  await bsTopicMap.start();
  console.log('Topic map import completed');
} catch (error) {
  console.error('Topic map import failed:', error);
}
await bsTopicMap.kill();

/* 4) build items spec ----------------------------------------------- */
const itemsSpec = {
  items: [
    {
      name: 'Products',
      shape: 'default-folder',
      tree: { path: '/products' },
      published: true,
      externalReference: 'root-products',
    },
    ...products.map(p => ({
      name: p.title,
      shape: 'beta-storefront',
      tree: { path: `/products/${slug(p.title)}` },
      vatType: 'No Tax',
      published: true,
      externalReference: `dummyjson-${p.id}`,
      topics: [ `/categories/${slug(p.category)}` ],
      components: {
        title: p.title,
        description: {
          json: [
            { type: 'paragraph', children: [{ text: p.description }] },
          ],
        },
        brand: p.brand,
        thumbnail: [{ src: p.thumbnail }],
      },
      variants: [
        {
          name: p.title,
          sku: `dummy-${p.id}`,
          isDefault: true,
          price: { default: p.price },
          stock: p.stock,
          images: p.images.map(src => ({ src })),
        },
      ],
    })),
  ],
};

/* 5) bootstrap items ----------------------------------------------- */
const bsItems = new Bootstrapper();
bsItems.setTenantIdentifier(tenantIdentifier);
bsItems.setAccessToken(tokenId, tokenSecret);
bsItems.setSpec(itemsSpec);

console.log(`▶ importing ${products.length} products…`);
try {
  await bsItems.start();
  console.log('Items import completed');
} catch (error) {
  console.error('Items import failed:', error);
}
await bsItems.kill();

console.log('🎉 import finished – products should be tagged by topic');