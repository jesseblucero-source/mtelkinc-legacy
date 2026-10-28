// Editorial catalog matching; no sales, customer identities, or popularity data.
export function selectSuggestions(data,page,cartIds=[]){
 const allowed=['CATEGORY','SEARCH','PRODUCT','CART'];if(!allowed.includes(page?.type))return [];
 const products=data.products,byId=new Map(products.map(p=>[p.id,p])),current=byId.get(Number(page.productId)),cart=new Set(cartIds.map(Number)),excluded=new Set([...cart,...data.excluded_products.map(Number)]);
 if(current)excluded.add(current.id);
 for(const id of [...cart,current?.id].filter(Boolean))for(const child of data.package_contents?.[id]||[])excluded.add(child);
 const bases=page.type==='CART'?[...cart].map(id=>byId.get(id)).filter(Boolean):current?[current]:[];
 // A package and its corresponding single call are alternatives, not add-ons to one another.
 for(const [call,bundle] of Object.entries(data.package_alternatives))if(cart.has(Number(call))||cart.has(bundle)||current?.id===bundle){excluded.add(Number(call));excluded.add(bundle);}
 if(bases.some(p=>p.kind==='package'))for(const product of products)if(product.kind==='accessory')excluded.add(product.id);
 const species=new Set(bases.flatMap(p=>p.categories.filter(c=>data.species.includes(c))));
 const category=data.categories.find(c=>c.id===Number(page.categoryId||page.mainCategoryId));if(category&&data.species.includes(category.slug))species.add(category.slug);
 const scores=new Map();
 function offer(id,score,reason){id=Number(id);const p=byId.get(id);if(!p||excluded.has(id)||p.unavailable)return;const old=scores.get(id);if(!old||old.score<score)scores.set(id,{...p,score,reason});}
 for(const base of bases){
  const callId=Object.entries(data.package_alternatives).find(([,id])=>id===base.id)?.[0]||String(base.id);
  for(const id of data.pairings[callId]||[]){const p=byId.get(id);if(p)offer(id,p.kind==='part'?150:p.kind==='media'?130:p.kind==='book'?120:105,p.kind==='part'?'model':p.kind==='media'?'learn':p.kind==='book'?'book':'accessory');}
 }
 if(current&&page.type==='PRODUCT'&&!cart.has(current.id))offer(data.package_alternatives[current.id],140,'package');
 for(const p of products){
  const matches=p.categories.some(c=>species.has(c));
  if(matches&&['media','book'].includes(p.kind))offer(p.id,p.kind==='media'?65:60,p.kind==='media'?'learn':'book');
  if(matches&&p.kind==='accessory')offer(p.id,55,'accessory');
  if(!bases.length&&category&&p.categories.includes(category.slug))offer(p.id,30,'related');
 }
 if(!bases.length&&!category)for(const [i,id] of data.default_products.entries())offer(id,40-i,'explore');
 // No unrelated fallback for a new/unknown product or an empty cart.
 if(page.type==='PRODUCT'&&!current)return [];
 if(page.type==='CART'&&!cart.size)return [];
 const ranked=[...scores.values()].sort((a,b)=>b.score-a.score||a.id-b.id),result=[],kinds=new Map();
 for(const p of ranked){if((kinds.get(p.kind)||0)>=1)continue;result.push(p);kinds.set(p.kind,(kinds.get(p.kind)||0)+1);if(result.length===4)break;}
 return result;
}
