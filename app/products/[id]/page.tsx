import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductCopy, products } from "../catalog";

export function generateStaticParams() { return products.map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = getProduct((await params).id);
  if (!product) return {};
  return { title: `${product.name} | MT ELK Inc.`, description: getProductCopy(product), openGraph: { images: [product.image] } };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = getProduct((await params).id);
  if (!product) notFound();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  return <main className="detailPage">
    <nav className="detailNav"><a href="/" className="brand"><img src="/mt-elk-logo.png" alt="MT ELK Inc."/><span>MT ELK <small>PRODUCT FIELD GUIDE</small></span></a><a href="/store">← All products</a></nav>
    <section className="detailHero"><div className="detailMedia"><span>{product.category}</span><img src={product.image} alt={product.name}/><small>Official product photography · Product ID {product.id}</small></div><div className="detailCopy"><p className="kicker">The MT ELK line</p><h1>{product.name}</h1><p className="detailPrice">{product.price} <span>USD</span></p><p className="detailDescription">{getProductCopy(product)}</p><div className="detailFacts"><div><b>01</b><span>Official MT ELK product</span></div><div><b>02</b><span>{product.category}</span></div><div><b>03</b><span>Ships from the official store</span></div></div><a className="button detailBuy" href={product.storeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Purchase ${product.name} from the official MT ELK store`}>Purchase on MT ELK <span>↗</span></a><a className="detailWholesale" href="/#contact">Retailer? Request wholesale pricing →</a><p className="detailNote">Purchase opens the exact item in a new tab on the official MT ELK Inc. store. Price shown is the supplied retail price and may change.</p></div></section>
    <section className="related"><p className="kicker">Continue exploring</p><h2>More from {product.category}</h2><div>{related.map((item)=><a href={`/products/${item.id}`} key={item.id}><img src={item.image} alt={item.name}/><span>{item.category}</span><h3>{item.name}</h3><b>{item.price}</b></a>)}</div></section>
    <footer className="detailFooter"><span>MT ELK Inc. · Livingston, Montana · Since 1985</span><a href="/">Return to wholesale Canada →</a></footer>
  </main>;
}
