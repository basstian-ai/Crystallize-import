/* ─── credentials ─────────────────────────────────────────────────── */
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';                         // default language in your tenant

/* ─── simple GraphQL caller for the PIM API ────────────────────────── */
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
  catch { throw new Error(`HTTP ${res.status} — ${text}`); }

  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

/* ─── utils ───────────────────────────────────────────────────────── */
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ─── download the 100 dummyjson products once ─────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ─── GraphQL fragments (PIM v2024-10) ─────────────────────────────── */
const GQL_GET_ITEM = `
  query ($path:String!, $lang:String!){
    item { get(path:$path, language:$lang) { id externalReference } }
  }`;

const GQL_SET_REF = `
  mutation ($id:ID!, $ref:String!){
    item { update(id:$id, input:{ externalReference:$ref }) { id } }
  }`;

const GQL_MOVE = `
  mutation ($id:ID!, $parent:ID!, $name:String!, $lang:String!){
    item { move(id:$id, parentId:$parent, language:$lang, name:$name) { id } }
  }`;

const GQL_CREATE_FOLDER = `
  mutation ($name:String!, $parent:ID!, $lang:String!){
    tree {
      createFolder(
        input:{ name:$name, parentId:$parent, shapeIdentifier:"category" },
        language:$lang
      ) { id }
    }
  }`;

/* ─── find the /products root folder id (once) ─────────────────────── */
const { item: root } = await pim(GQL_GET_ITEM, { path:'/products', lang: LANG });
if (!root) throw new Error('Cannot find /products folder in tenant');
const PRODUCTS_FOLDER_ID = root.id;

/* ─── iterate over the 100 products ────────────────────────────────── */
const folderCache = new Map();   // categorySlug ➜ folderId

for (const p of products) {
  const prodSlug = slug(p.title);
  const catSlug  = slug(p.category);

  /* 1️⃣  locate the existing product at /products/<slug> */
  const { item: prod } =
    await pim(GQL_GET_ITEM, { path:`/products/${prodSlug}`, lang: LANG });

  if (!prod) {
    console.warn(`⚠️  /products/${prodSlug} not found – skipping`);
    continue;
  }

  /* 2️⃣  set externalReference if still null */
  const ref = `dummyjson-${p.id}`;
  if (!prod.externalReference) {
    await pim(GQL_SET_REF, { id: prod.id, ref });
    console.log(`✓ externalReference set for ${prodSlug}`);
  }

  /* 3️⃣  make sure /products/<category> exists */
  let catId = folderCache.get(catSlug);
  if (!catId) {
    const { item: cat } =
      await pim(GQL_GET_ITEM, { path:`/products/${catSlug}`, lang: LANG });

    if (cat) {
      catId = cat.id;
    } else {
      const { tree: { createFolder } } =
        await pim(GQL_CREATE_FOLDER, {
          name  : p.category,
          parent: PRODUCTS_FOLDER_ID,
          lang  : LANG,
        });
      catId = createFolder.id;
      console.log(`+ created folder /products/${catSlug}`);
    }
    folderCache.set(catSlug, catId);
  }

  /* 4️⃣  move + publish the product */
  await pim(GQL_MOVE, {
    id    : prod.id,
    parent: catId,
    name  : p.title,
    lang  : LANG,
  });
  console.log(`→ moved  ${prodSlug}  →  /products/${catSlug}/${prodSlug}`);
}

console.log('\n🎉  All products now have externalReference and sit in their category folders.');