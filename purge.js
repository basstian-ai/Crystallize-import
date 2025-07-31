// purge.js  –  delete every child of /products
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';

const pim = async (query, variables={}) => {
  const r = await fetch('https://pim.crystallize.com/graphql', {
    method : 'POST',
    headers: {
      'Content-Type'                      : 'application/json',
      'X-Crystallize-Access-Token-Id'     : TOKEN_ID,
      'X-Crystallize-Access-Token-Secret' : TOKEN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const { data, errors } = await r.json();
  if (errors) throw new Error(JSON.stringify(errors, null, 2));
  return data;
};

// 1) grab every direct child of /products (depth=1) using catalogue
const SEARCH = `
  query ($path:String!, $lang:String!){
    catalogue(path: $path, language: $lang) {
      children { id path }
    }
  }`;

const { catalogue: { children } } = await pim(SEARCH, { path:'/products', lang:LANG });

if (!children.length) { console.log('Nothing to delete.'); process.exit(0); }

// 2) delete by id (mutation remains the same)
const DEL = `mutation ($id:ID!){ item { delete(id: $id) } }`;

for (const { id, path } of children) {
  await pim(DEL, { id });
  console.log('🗑️ deleted', path);
}

console.log('\n✅ Purged everything under /products');
