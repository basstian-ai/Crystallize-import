/* ───────── tenant settings ─────────────────────────────────────────── */
const TENANT        = 'starter-kit';  // ← your slug
const TOKEN_ID      = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET  = process.env.CRYSTALLIZE_TOKEN_SECRET;

/* ───────── helper: sign a GraphQL call ─────────────────────────────── */
const pimFetch = async (query, variables = {}) => {
  const res = await fetch(
    `https://api.crystallize.com/${TENANT}/pim/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type'             : 'application/json',
        'X-Crystallize-Access-Token': `${TOKEN_ID}:${TOKEN_SECRET}`,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const { data, errors } = await res.json();
  if (errors) throw new Error(JSON.stringify(errors, null, 2));
  return data;
};

/* ───────── helper: slugify for paths ───────────────────────────────── */
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ───────── fetch the 100 dummy products (again) ────────────────────── */
const { products } = await (await fetch(
  'https://dummyjson.com/products?limit=100'
)).json();

/* ───────── step 1 — look up current items by path ──────────────────── */
const lookupQuery = /* GraphQL */ `
  query ($path: String!) {
    catalogue(path: $path, language: "en") {
      id
      externalReference
    }
  }
`;

/* ───────── step 2 — create missing category folders ────────────────── */
const createFolderMutation = /* GraphQL */ `
  mutation CreateFolder($input: FolderCreateInput!, $language: String!) {
    folderCreate(input: $input, language: $language) { id }
  }
`;

const seenCategories = new Set();

/* ───────── step 3 — itemUpdate + itemMove mutations ────────────────── */
const updateMutation = /* GraphQL */ `
  mutation UpdateItem($id: ID!, $ref: String!) {
    itemUpdate(id: $id, input: { externalReference: $ref }) { id }
  }
`;

const moveMutation = /* GraphQL */ `
  mutation MoveItem($id: ID!, $parentId: ID!, $name: String!, $language: String!) {
    itemMove(id: $id, parentId: $parentId, language: $language, name: $name) { id }
  }
`;

/* ───────── main loop ──────────────────────────────────────────────── */
for (const p of products) {
  const productSlug = slug(p.title);
  const categorySlug = slug(p.category);

  /* ── 1a) make sure the category folder exists (once) ─────────────── */
  if (!seenCategories.has(categorySlug)) {
    seenCategories.add(categorySlug);
    const catPath = `/products/${categorySlug}`;
    const cat = await pimFetch(lookupQuery, { path: catPath });

    if (!cat.catalogue) {
      console.log(`Creating folder ${catPath}`);
      await pimFetch(createFolderMutation, {
        language: 'en',
        input: {
          name  : p.category,
          shape : 'category',
          tenantId: null,               // not needed when using slug
          tree  : { parentId: null, name: 'products', path: `/products` }
        }
      });
    }
  }

  /* ── 1b) look up the existing product item by its *current* path ─── */
  const currentPath = `/products/${productSlug}`;
  const { catalogue: item } = await pimFetch(lookupQuery, { path: currentPath });

  if (!item) {
    console.warn(`Item not found at ${currentPath}; skipping`);
    continue;
  }

  /* ── 2) add externalReference if it's still null ─────────────────── */
  const externalRef = `dummyjson-${p.id}`;
  if (!item.externalReference) {
    await pimFetch(updateMutation, { id: item.id, ref: externalRef });
    console.log(`Set externalReference for ${currentPath}`);
  }

  /* ── 3) move under /products/<category>/<slug> ───────────────────── */
  const newParentPath = `/products/${categorySlug}`;
  const { catalogue: parent } = await pimFetch(lookupQuery, { path: newParentPath });
  if (!parent) {
    console.warn(`Parent folder missing at ${newParentPath}; skipping move`);
    continue;
  }

  await pimFetch(moveMutation, {
    id      : item.id,
    parentId: parent.id,
    name    : p.title,
    language: 'en',
  });

  console.log(`Moved → ${newParentPath}/${productSlug}`);
}

console.log('🎉 All products now carry externalReference and sit in their category folders.');