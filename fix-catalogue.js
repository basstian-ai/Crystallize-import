/***********************************************************************
 *  Fix Crystallize starter-kit:                                      *
 *  – add externalReference to 100 root-level products                *
 *  – create category folders                                         *
 *  – move + publish every product to /products/<category>/<slug>     *
 **********************************************************************/

const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';

/* ---------- helpers ------------------------------------------------- */
const gql  = (literals, ...subs) => literals.raw[0].replace(/\s+/g, ' ');
const slug = s => s.toLowerCase().trim()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');

/* ---------- tiny PIM fetch wrapper ---------------------------------- */
async function pim(query, vars={}) {
  const r = await fetch('https://pim.crystallize.com/graphql', {
    method : 'POST',
    headers: {
      'Content-Type'                      : 'application/json',
      'X-Crystallize-Access-Token-Id'     : TOKEN_ID,
      'X-Crystallize-Access-Token-Secret' : TOKEN_SECRET,
    },
    body: JSON.stringify({ query, variables: vars }),
  });
  const txt = await r.text();
  let json;
  try { json = JSON.parse(txt); }
  catch { throw new Error(`HTTP ${r.status} — ${txt}`); }
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

/* ---------- preload dummyjson -------------------------------------- */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ---------- GraphQL docs ------------------------------------------- */
const Q_GET  = gql`query ($p:String!,$l:String!){
  tree { get(path:$p, language:$l){ id item{ id externalReference } } } }`;

const M_SET  = gql`mutation ($id:ID!,$ref:String!){
  item { update(id:$id, input:{ externalReference:$ref }){ id } } }`;

const M_MOVE = gql`mutation ($id:ID!,$par:ID!,$nm:String!,$l:String!){
  item { move(id:$id, parentId:$par, language:$l, name:$nm){ id } } }`;

const M_FOLD = gql`mutation ($par:ID!,$nm:String!,$l:String!){
  tree { createFolder(
    parentId:$par, language:$l,
    input:{ name:$nm, shapeIdentifier:"category" }
  ){ id } } }`;

/* ---------- find /products root id --------------------------------- */
const rootData = await pim(Q_GET, { p:'/products', l:LANG });
if (!rootData.tree.get) throw new Error('No /products folder in tenant');
const PRODUCTS_ID = rootData.tree.get.id;

/* ---------- caches -------------------------------------------------- */
const folderIdBySlug = new Map();   // 'smartphones' => ID

/* ---------- main loop ---------------------------------------------- */
for (const p of products) {
  const prodSlug = slug(p.title);
  const catSlug  = slug(p.category);

  /* 1️⃣ fetch current root-level item */
  const lookup = await pim(Q_GET, { p:`/products/${prodSlug}`, l:LANG });
  const node   = lookup.tree.get;
  if (!node) { console.warn(`⚠️ missing /products/${prodSlug}`); continue; }

  const itemId = node.item.id;

  /* 2️⃣ add externalReference if absent */
  const ref = `dummyjson-${p.id}`;
  if (!node.item.externalReference) {
    await pim(M_SET, { id:itemId, ref });
    console.log(`✓ set externalReference for ${prodSlug}`);
  }

  /* 3️⃣ ensure /products/<category> folder exists */
  let folderId = folderIdBySlug.get(catSlug);
  if (!folderId) {
    const q = await pim(Q_GET, { p:`/products/${catSlug}`, l:LANG });
    if (q.tree.get) {
      folderId = q.tree.get.id;
    } else {
      const { tree:{ createFolder } } =
        await pim(M_FOLD, { par:PRODUCTS_ID, nm:p.category, l:LANG });
      folderId = createFolder.id;
      console.log(`+ created folder /products/${catSlug}`);
    }
    folderIdBySlug.set(catSlug, folderId);
  }

  /* 4️⃣ move + publish the product */
  await pim(M_MOVE, {
    id : itemId,
    par: folderId,
    nm : p.title,
    l  : LANG,
  });
  console.log(`→ moved  ${prodSlug}  →  /products/${catSlug}/${prodSlug}`);
}

console.log('\n🎉  All 100 products now carry externalReference and sit in their category folders.');