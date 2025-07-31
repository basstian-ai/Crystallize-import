/* --- imports ----------------------------------------------------------- */
import utils from '@crystallize/import-utilities';   // CJS → 1 default export
const { Bootstrapper } = utils;                      // pull what we need

/* --- auth & tenant ----------------------------------------------------- */
const tenantIdentifier = 'your-tenant-slug';         // the URL slug, not the UUID
const tokenId     = process.env.CRYSTALLIZE_TOKEN_ID;
const tokenSecret = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* --- fetch the dummy data --------------------------------------------- */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* --- build a minimal spec --------------------------------------------- */
const spec = {
  shapes: [{
    name: 'Product',
    identifier: 'product',
    type: 'product',
    components: [
      { id: 'description', name: 'Description', type: 'richText' },
      { id: 'brand',       name: 'Brand',        type: 'singleLine' },
      { id: 'category',    name: 'Category',     type: 'singleLine' },
      { id: 'images',      name: 'Images',       type: 'images' }
    ]
  }],
  items: products.map(p => ({
    name: p.title,
    shape: 'product',
    vatType: 'No Tax',
    components: {
      description: { json: [{ type:'paragraph', children:[{ text:p.description }]}] },
      brand:  p.brand,
      category: p.category,
      images:  p.images.map(src => ({ src }))
    },
    variants: [{
      name: p.title,
      sku:  `dummy-${p.id}`,
      isDefault: true,
      price: { eur: p.price },
      stock: p.stock,
      images: p.images.map(src => ({ src }))
    }]
  }))
};

/* --- bootstrap the tenant --------------------------------------------- */
const bootstrapper = new Bootstrapper();
bootstrapper.setAccessToken(tokenId, tokenSecret);
bootstrapper.setTenantIdentifier(tenantIdentifier);
bootstrapper.setSpec(spec);

await bootstrapper.start();   // performs the import
await bootstrapper.kill();    // closes open handles (important in long-running procs)

console.log('✅ Imported', products.length, 'products');