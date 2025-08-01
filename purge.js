/***********************************************************************
 * purge.js – delete every child (folders + products) directly under   *
 *            /products.  Leaves the /products root folder intact.     *
 **********************************************************************/

// ─── tenant + auth ────────────────────────────────────────────────
const TENANT        = 'starter-kit';                // ← your slug (after the @)
const TOKEN_ID      = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET  = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG          = 'en';

// ─── helper: call Catalogue API (read-only, no token) ─────────────
async function cat(query, variables = {}) {
  const r = await fetch(`https://api.crystallize.com/${TENANT}/catalogue`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ query, variables }),
  });
  const { data, errors } = await r.json();
  if (errors) throw new Error(JSON.stringify(errors, null, 2));
  return data;
}

// ─── helper: call PIM API (for deletes) ───────────────────────────
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

// ─── 1) list children of /products via Catalogue API ──────────────
const CHILDREN_Q = `
  query ($path:String!, $lang:String!) {
    catalogue(path:$path, language:$lang) {
      children { id path }
    }
  }`;

const { catalogue } = await cat(CHILDREN_Q, { path:'/products', lang:LANG });

if (!catalogue.children.length) {
  console.log('Nothing to delete under /products.');
  process.exit(0);
}

// ─── 2) delete each child by ID via PIM API ───────────────────────
const DEL_MUT = `mutation ($id:ID!){ item{ delete(id:$id) } }`;

for (const { id, path } of catalogue.children) {
  await pim(DEL_MUT, { id });
  console.log('🗑️  deleted', path);
}

console.log('\n✅  Purged everything directly under /products');
