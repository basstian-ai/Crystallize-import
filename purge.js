/*********************************************************************
 * purge.js – delete all items that sit directly under ROOT_PATH     *
 *             (keeps the folder itself).                            *
 *********************************************************************/
import fetch from 'node-fetch';      // Node <18; delete line if >=18

const TENANT = 'starter-kit';        // <-- change if needed
const TOKEN_ID = process.env.CRYSTALLIZE_TOKEN_ID;
const TOKEN_SECRET = process.env.CRYSTALLIZE_TOKEN_SECRET;
const LANG = 'en';
const ROOT_PATH = '/';               // <- root of catalogue

/* ---- call Catalogue API (read-only) ------------------------------ */
const cat = async (q,v={}) =>
  (await (await fetch(
    `https://api.crystallize.com/${TENANT}/catalogue`,
    {method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({query:q,variables:v})}
  )).json()).data;

/* ---- call PIM API (needs token) ---------------------------------- */
const pim = async (q,v={}) =>
  (await (await fetch(
    'https://pim.crystallize.com/graphql',
    {method:'POST',
     headers:{
       'Content-Type':'application/json',
       'X-Crystallize-Access-Token-Id':TOKEN_ID,
       'X-Crystallize-Access-Token-Secret':TOKEN_SECRET},
     body:JSON.stringify({query:q,variables:v})}
  )).json()).data;

/* ---- 1) list direct children of ROOT_PATH ------------------------ */
const CHILDREN_Q = `
  query($p:String!,$l:String!){
    catalogue(path:$p,language:$l){ children{ id path } }
  }`;
const res = await cat(CHILDREN_Q,{p:ROOT_PATH,l:LANG});

if (!res.catalogue){
  console.log(`No item at ${ROOT_PATH} – nothing to purge.`); process.exit(0);
}
if (!res.catalogue.children.length){
  console.log('Nothing to delete.'); process.exit(0);
}

/* ---- 2) delete each child id ------------------------------------- */
const DEL = `mutation($id:ID!){ item{ delete(id:$id) } }`;

for (const {id,path} of res.catalogue.children){
  // keep the products folder itself (optional)
  if (path === '/products') continue;

  await pim(DEL,{id});
  console.log('🗑️  deleted', path);
}
console.log('\n✅ Purged children of', ROOT_PATH);
