/***********************************************************************
 * purge.js  –  delete every child (product folders + items) directly  *
 *               under /products.  Leaves the /products root folder.   *
 **********************************************************************/

// ── tenant settings ────────────────────────────────────────────────
const TENANT        = 'starter-kit';               //  ← your tenant slug
const TOKEN_ID      = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET  = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG          = 'en';

// ── tiny helper to call the PIM API (for deletes) ───────────────────
async function pim(query, variables = {}) {
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
}

// ── 1) list children of /products via the public Catalogue API ──────
const catRes = await fetch(
  `https://api.crystallize.com/${TENANT}/catalogue`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      query: `
        query ($path:String!, $lang:String!){
          catalogue(path:$path, language:$lang){
            children { id path }
          }
        }`,
      variables: { path:'/products', lang:LANG },
    })
  });
const { data:{ catalogue } } = await catRes.json();

if (!catalogue.children.length) {
  console.log('Nothing to delete under /products.');
  process.exit(0);
}

// ── 2) delete each child ID via the PIM API ‐────────────────────────
const DEL_MUTATION = `mutation ($id:ID!){ item{ delete(id:$id) } }`;

for (const { id, path } of catalogue.children) {
  await pim(DEL_MUTATION, { id });
  console.log('🗑️  deleted', path);
}

console.log('\n✅  Purged everything directly under /products');