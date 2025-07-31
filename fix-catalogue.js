/* ── access-token secrets ───────────────────────────────────────────── */
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';

/* ── helper: signed call to the **PIM** endpoint (tenant is in token) ─ */
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
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`HTTP ${r.status} — ${t}`); }
  if (j.errors) throw new Error(JSON.stringify(j.errors, null, 2));
  return j.data;
}

/* ── slug util ──────────────────────────────────────────────────────── */
const slug = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'');

/* ── fetch dummyjson once ───────────────────────────────────────────── */
const { products } = await (await fetch('https://dummyjson.com/products?limit=100')).json();

/* ── GraphQL snippets (note the **item** query) ─────────────────────── */
const GQ_LOOKUP = `query($path:String!,$lang:String!){
  item(path:$path,language:$lang){id externalReference}
}`;

const GQ_UPDATE = `mutation($id:ID!,$ref:String!){
  itemUpdate(id:$id,input:{externalReference:$ref}){id}
}`;

const GQ_MOVE = `mutation($id:ID!,$parent:ID!,$name:String!,$lang:String!){
  itemMove(id:$id,parentId:$parent,language:$lang,name:$name){id}
}`;

const GQ_FOLDER = `mutation($name:String!,$parent:ID!,$lang:String!){
  folderCreate(input:{name:$name,shapeIdentifier:"category",parentId:$parent},
               language:$lang){id}
}`;

/* ── find the /products root once ───────────────────────────────────── */
const { item: prodRoot } = await pim(GQ_LOOKUP, { path:'/products', lang: LANG });
if (!prodRoot) throw new Error('No /products folder found in tenant');
const PRODUCTS_FOLDER_ID = prodRoot.id;

/* ── main loop ──────────────────────────────────────────────────────── */
const madeFolder = new Map();        // catSlug ➜ folderId

for (const p of products) {
  const prodSlug = slug(p.title);
  const catSlug  = slug(p.category);

  /* 1️⃣ locate current root-level item */
  const { item } = await pim(GQ_LOOKUP, { path:`/products/${prodSlug}`, lang: LANG });
  if (!item) { console.warn(`⚠️  /products/${prodSlug} missing → skipped`); continue; }

  /* 2️⃣ add externalReference if absent */
  const ref = `dummyjson-${p.id}`;
  if (!item.externalReference) {
    await pim(GQ_UPDATE, { id:item.id, ref });
    console.log(`✓ externalReference set for ${prodSlug}`);
  }

  /* 3️⃣ ensure /products/<category> folder exists */
  let catId = madeFolder.get(catSlug);
  if (!catId) {
    const { item: cat } = await pim(GQ_LOOKUP, { path:`/products/${catSlug}`, lang: LANG });
    if (cat) { catId = cat.id; }
    else {
      const { folderCreate } =
        await pim(GQ_FOLDER, { name:p.category, parent: PRODUCTS_FOLDER_ID, lang: LANG });
      catId = folderCreate.id;
      console.log(`+ created /products/${catSlug}`);
    }
    madeFolder.set(catSlug, catId);
  }

  /* 4️⃣ move + publish product into its category folder */
  await pim(GQ_MOVE, {
    id: item.id, parent: catId, name: p.title, lang: LANG,
  });
  console.log(`→ moved  ${prodSlug}  →  /products/${catSlug}/${prodSlug}`);
}

console.log('\n🎉  All 100 products now have externalReference and live in their category folders.');