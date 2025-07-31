/* ─── tenant secrets ───────────────────────────────────────────── */
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ─── tiny helper ───────────────────────────────────────────────── */
const slug = s =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ─── low-level fetch wrapper for the PIM API ───────────────────── */
async function pim(query, variables = {}) {
  const res = await fetch('https://pim.crystallize.com/graphql', {
    method : 'POST',
    headers: {
      'Content-Type'                      : 'application/json',
      'X-Crystallize-Access-Token-Id'     : TOKEN_ID,
      'X-Crystallize-Access-Token-Secret' : TOKEN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`HTTP ${res.status} – ${text}`); }

  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

/* ─── preload dummyjson data ────────────────────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* GraphQL snippets ------------------------------------------------ */
const GQ_LOOKUP = `query($path:String!){ catalogue(path:$path,language:"en"){id externalReference} }`;
const GQ_UPDATE = `mutation($id:ID!,$ref:String!){ itemUpdate(id:$id,input:{externalReference:$ref}){id} }`;
const GQ_MOVE   = `mutation($id:ID!,$parent:ID!,$name:String!){ itemMove(id:$id,parentId:$parent,language:"en",name:$name){id} }`;
const GQ_FOLDER = `mutation($name:String!,$parent:ID!){ folderCreate(
  input:{ name:$name, shape:"category", parentId:$parent }, language:"en"){id} }`;

/* ─── get the ID of the /products root folder ───────────────────── */
const { catalogue: prodRoot } = await pim(GQ_LOOKUP, { path: '/products' });
if (!prodRoot) throw new Error("Can't find a /products folder in the tenant");
const PRODUCTS_FOLDER_ID = prodRoot.id;

/* ─── main loop --------------------------------------------------- */
const foldersDone = new Map();                         // categorySlug ➜ folderId

for (const p of products) {
  const prodSlug = slug(p.title);
  const catSlug  = slug(p.category);

  /* 1️⃣ locate the existing root-level item */
  const { catalogue: item } =
    await pim(GQ_LOOKUP, { path: `/products/${prodSlug}` });
  if (!item) {
    console.warn(`⚠️  Missing product at /products/${prodSlug} – skipped`);
    continue;
  }

  /* 2️⃣ set externalReference if not present */
  const ref = `dummyjson-${p.id}`;
  if (!item.externalReference) {
    await pim(GQ_UPDATE, { id: item.id, ref });
    console.log(`✓ set externalReference for ${prodSlug}`);
  }

  /* 3️⃣ ensure the category folder exists (once per category) */
  let catId = foldersDone.get(catSlug);
  if (!catId) {
    const catPath = `/products/${catSlug}`;
    const { catalogue: cat } = await pim(GQ_LOOKUP, { path: catPath });

    if (cat) catId = cat.id;
    else {
      const { folderCreate } =
        await pim(GQ_FOLDER, { name: p.category, parent: PRODUCTS_FOLDER_ID });
      catId = folderCreate.id;
      console.log(`+ created folder ${catPath}`);
    }
    foldersDone.set(catSlug, catId);
  }

  /* 4️⃣ move + publish the product */
  await pim(GQ_MOVE, {
    id    : item.id,
    parent: catId,
    name  : p.title,
  });
  console.log(`→ moved  ${prodSlug}  →  /products/${catSlug}/${prodSlug}`);
}

console.log('\n🎉  All products now carry externalReference and sit in their category folders.');