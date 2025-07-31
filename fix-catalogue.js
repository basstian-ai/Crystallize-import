/* ───────── tenant settings ────────────────────────────────────────── */
const TENANT       = 'starter-kit';          //  <- exact slug after the @ in the UI
const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;

/*  optional one-time sanity check  */
console.log('DEBUG endpoint :', `https://api.crystallize.com/${TENANT}/pim`);
console.log('DEBUG token id :', Boolean(TOKEN_ID));
console.log('DEBUG token sec:', Boolean(TOKEN_SECRET));

/* ───────── helper: call PIM GraphQL (v2023-10) ────────────────────── */
async function pimFetch(query, variables = {}) {
  const res = await fetch(
    `https://api.crystallize.com/${TENANT}/pim`,
    {
      method : 'POST',
      headers: {
        'Content-Type'                       : 'application/json',
        'X-Crystallize-Access-Token-Id'      : TOKEN_ID,
        'X-Crystallize-Access-Token-Secret'  : TOKEN_SECRET,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`HTTP ${res.status} – ${text}`); }

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

/* ───────── utils ──────────────────────────────────────────────────── */
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ───────── 100 dummy products ─────────────────────────────────────── */
const { products } = await (await fetch('https://dummyjson.com/products?limit=100')).json();

/* ───────── GraphQL snippets ───────────────────────────────────────── */
const GQL_LOOKUP = `query($path:String!){ catalogue(path:$path,language:"en"){id externalReference} }`;

const GQL_UPDATE_REF = `
mutation($id:ID!,$ref:String!){
  itemUpdate(id:$id,input:{externalReference:$ref}){id}
}`;

const GQL_MOVE = `
mutation($id:ID!,$parent:ID!,$name:String!){
  itemMove(id:$id,parentId:$parent,language:"en",name:$name){id}
}`;

const GQL_FOLDER_CREATE = `
mutation($input:FolderCreateInput!){
  folderCreate(input:$input,language:"en"){ id }
}`;

/* ───────── ensure /products folder ID ─────────────────────────────── */
const { catalogue: prodRoot } = await pimFetch(GQL_LOOKUP, { path: '/products' });
if (!prodRoot) throw new Error("Can't find /products folder in tenant");
const PRODUCTS_FOLDER_ID = prodRoot.id;

/* ───────── main loop ──────────────────────────────────────────────── */
const madeFolder = new Set();

for (const p of products) {
  const productSlug  = slug(p.title);
  const categorySlug = slug(p.category);

  /* 1️⃣   locate current item (root-level) */
  const currentPath = `/products/${productSlug}`;
  const { catalogue: item } = await pimFetch(GQL_LOOKUP, { path: currentPath });
  if (!item) {
    console.warn(`Skip – no item at ${currentPath}`);
    continue;
  }

  /* 2️⃣   add externalReference if missing */
  const extRef = `dummyjson-${p.id}`;
  if (!item.externalReference) {
    await pimFetch(GQL_UPDATE_REF, { id: item.id, ref: extRef });
    console.log(`✓ set externalReference for ${currentPath}`);
  }

  /* 3️⃣   ensure category folder exists (once per category) */
  const catPath = `/products/${categorySlug}`;
  if (!madeFolder.has(categorySlug)) {
    madeFolder.add(categorySlug);
    const { catalogue: cat } = await pimFetch(GQL_LOOKUP, { path: catPath });
    if (!cat) {
      const { folderCreate } = await pimFetch(GQL_FOLDER_CREATE, {
        input: {
          name   : p.category,
          shape  : 'category',
          parentId: PRODUCTS_FOLDER_ID,
        },
      });
      console.log(`+ created folder ${catPath}`);
    }
  }

  /* 4️⃣   move item under the category folder */
  const { catalogue: catFolder } = await pimFetch(GQL_LOOKUP, { path: catPath });
  await pimFetch(GQL_MOVE, {
    id    : item.id,
    parent: catFolder.id,
    name  : p.title,
  });
  console.log(`→ moved  ${productSlug}  →  ${catPath}/${productSlug}`);
}

console.log('\n🎉 100 products now carry externalReference and sit in their category folders.');