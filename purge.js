// purge.js — delete every product and folder under /products
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';

const pim = async (q, v={}) => {
  const r = await fetch('https://pim.crystallize.com/graphql', {
    method : 'POST',
    headers: {
      'Content-Type'                      : 'application/json',
      'X-Crystallize-Access-Token-Id'     : TOKEN_ID,
      'X-Crystallize-Access-Token-Secret' : TOKEN_SECRET
    },
    body: JSON.stringify({ query:q, variables:v })
  });
  const { data, errors } = await r.json();
  if (errors) throw new Error(JSON.stringify(errors, null, 2));
  return data;
};

// 1) search every child of /products (depth 1)
const SEARCH = `
  query ($path:String!,$lang:String!){
    itemSearch(
      filter:{ parent:{ eq:$path } },
      language:$lang,
      first:250
    ){
      edges{ node{ id path } }
    }
  }`;

const { itemSearch:{ edges } } =
  await pim(SEARCH, { path:'/products', lang:LANG });

if (!edges.length) { console.log('Nothing to delete.'); process.exit(0); }

// 2) delete each ID
const DEL = `mutation ($id:ID!){ item{ delete(id:$id) } }`;

for (const { node:{ id, path } } of edges) {
  await pim(DEL, { id });
  console.log('🗑️  deleted', path);
}

console.log('\n✅ Purged everything directly under /products');