/*********************************************************************
 * delete everything *inside* /products but keep the /products folder
 *********************************************************************/

const TOKEN_ID     = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG         = 'en';

/* tiny fetch wrapper */
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

/* 1️⃣  ask for all direct children of /products */
const GET_CHILDREN = `
  query ($path:String!, $lang:String!){
    tree {
      get(path:$path, language:$lang){
        children { id name shapeIdentifier }
      }
    }
  }`;

const { tree:{ get:{ children } } } =
  await pim(GET_CHILDREN, { path:'/products', lang:LANG });

if (!children.length) { console.log('Nothing to delete.'); process.exit(0); }

/* 2️⃣  delete them one by one */
const DEL = `mutation($id:ID!){ item { delete(id:$id) } }`;

for (const child of children) {
  await pim(DEL, { id: child.id });
  console.log(`🗑️  deleted ${child.name} (${child.shapeIdentifier})`);
}

console.log('\n✅ All children of /products removed.');