"use client";

import { useMemo, useState } from "react";
import { ProductCategory, products } from "../products/catalog";

const categories: Array<"All" | ProductCategory> = ["All", "Calls", "Packages", "Replacement Parts", "Education"];

export default function StorePage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => products.filter((product) => (category === "All" || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main className="storePage">
    <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE OFFICIAL PRODUCT LINE</small></span></a><a href="/journal">Field Journal</a><span>{products.length} PRODUCTS · OFFICIAL STORE</span></nav>
    <header className="storeHero"><div><p className="overline">MONTANA KNOWLEDGE · FIELD-PROVEN TOOLS</p><h1>GEAR BUILT<br/>TO <i>COMMUNICATE.</i></h1><p>Calls, complete packages, replacement parts, books, and instruction—connected to four decades of listening, teaching, and field experience.</p><a className="brassButton" href="#shop">Shop the collection ↓</a></div><div className="storeHeroProduct"><span>FIELD ESSENTIAL · POWER BUGLE</span><img src="/products/751638462.jpg" alt="Power Bugle Pro Edition"/></div></header>
    <section className="storeTrust"><span>OFFICIAL MT E.L.K. PRODUCTS</span><span>SECURE PURCHASE ON ELKINC.COM</span><span>FIELD EDUCATION INCLUDED IN THE STORY</span></section>
    <section className="storeShop" id="shop"><div className="storeShopHead"><div><p className="kicker">THE PRODUCT LINE</p><h2>CHOOSE YOUR<br/><i>VOICE.</i></h2></div><p>Explore here, learn through the product field guide, then complete your purchase through the official MT E.L.K. store.</p></div><div className="storeFilters"><div>{categories.map((name) => <button className={category === name ? "active" : ""} onClick={() => setCategory(name)} key={name}>{name}</button>)}</div><label><span>SEARCH</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a call, book, DVD…"/></label></div><p className="storeCount" aria-live="polite">SHOWING {visible.length} OF {products.length} PRODUCTS</p><div className="storeGrid">{visible.map((product) => <article key={product.id}><a className="storeProductImage" href={`/products/${product.id}`}><img src={product.image} alt={product.name}/><span>View field guide ↗</span></a><small>{product.category}</small><h3><a href={`/products/${product.id}`}>{product.name}</a></h3><div><strong>{product.price}</strong><a href={product.storeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${product.name} on the official store`}>Buy now ↗</a></div></article>)}</div></section>
    <section className="storeHelp"><div><p className="kicker">NOT SURE WHERE TO START?</p><h2>THE RIGHT CALL<br/>STARTS WITH <i>THE HUNT.</i></h2></div><div><p>Browse calls for a focused tool, packages for a complete system, education for technique, or replacement parts to keep trusted equipment field-ready.</p><a href="mailto:Phillip@elkinc.com?subject=Help choosing an MT E.L.K. product">Ask Phillip for guidance ↗</a></div></section>
    <footer className="storyFooter"><a href="/">← The Legacy of the Call</a><span>MT E.L.K., INC. · OFFICIAL PRODUCT GUIDE</span><a href="/journal">Read the Field Journal →</a></footer>
  </main>;
}
