import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { archiveItems, museumCategories } from "../../archive-content";

export function generateStaticParams() { return museumCategories.map(({ id }) => ({ category: id })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: id } = await params;
  const category = museumCategories.find((entry) => entry.id === id);
  if (!category) return {};
  const first = archiveItems.find((item) => category.itemIds.includes(item.id));
  return { title: `${category.name} | MT E.L.K. Digital Museum`, description: category.description, openGraph: first ? { images: [first.image] } : undefined };
}

export default async function MuseumCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: id } = await params;
  const category = museumCategories.find((entry) => entry.id === id);
  if (!category) notFound();
  const records = category.itemIds.map((itemId) => archiveItems.find((item) => item.id === itemId)).filter((item): item is (typeof archiveItems)[number] => Boolean(item));
  const position = museumCategories.findIndex((entry) => entry.id === category.id);
  const next = museumCategories[(position + 1) % museumCategories.length];
  const heroImage = records[0]?.image ?? "/dealer-guide-1.jpg";
  return <main className="collectionCategoryPage">
    <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE DIGITAL MUSEUM</small></span></a><a href="/museum">Museum index</a><span>COLLECTION {String(position + 1).padStart(2, "0")} / {String(museumCategories.length).padStart(2, "0")}</span></nav>
    <header className="collectionHero" style={{backgroundImage:`linear-gradient(90deg,rgba(6,8,6,.96),rgba(6,8,6,.35)),url('${heroImage}')`}}><div><p className="overline">COLLECTION {String(position + 1).padStart(2, "0")} · {category.eyebrow}</p><h1>{category.name}</h1><p>{category.description}</p><a className="brassButton" href="#records">{records.length ? `View ${records.length} ${records.length === 1 ? "record" : "records"} ↓` : "Open the research file ↓"}</a></div><span className="collectionNumber">{String(position + 1).padStart(2, "0")}</span></header>
    <section className="collectionIntro"><div><p className="kicker">CURATORIAL FRAME</p><h2>A STORY TOLD<br/><i>THROUGH OBJECTS</i></h2></div><div><p>Every item here is drawn from the supplied MT E.L.K. archive. Records are grouped by what they reveal, so one article may connect product history, field instruction, publishing, and the people behind the company.</p><p>This is a living collection. Source details are stated precisely; dates, authorship, and international links that still require evidence remain marked for verification.</p></div></section>
    <section className="collectionRecords" id="records"><div className="collectionRecordsHead"><div><p className="kicker">THE COLLECTION</p><h2>{records.length ? "INDEXED" : "RESEARCH"}<br/><i>{records.length ? "EVIDENCE" : "OPEN"}</i></h2></div><p>{records.length ? `${records.length} archival ${records.length === 1 ? "object is" : "objects are"} connected to this collection. Open any record for its source document, metadata, curator’s note, and related exhibits.` : "No supplied source is being presented as evidence for this collection yet. The page remains open for records that can be verified and preserved."}</p></div>{records.length ? <div className="collectionRecordGrid">{records.map((record, index) => <a href={`/archive/${record.id}`} key={record.id}><div><img src={record.image} alt={`Archival source for ${record.title}`}/><b>{String(index + 1).padStart(3, "0")}</b></div><small>{record.publication} · {record.date}</small><h3>{record.title}</h3><p>{record.summary}</p><ul>{record.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul><span>Enter full exhibit ↗</span></a>)}</div> : <div className="collectionEmpty"><span>COLLECTION STATUS · RESEARCH OPEN</span><h3>Help place the next object in the record.</h3><p>Photographs, articles, catalogs, advertisements, recordings, dealer documents, and firsthand accounts can open this collection without asking history to guess.</p><a className="brassButton" href={`mailto:Phillip@elkinc.com?subject=${encodeURIComponent(`MT E.L.K. ${category.name} archive contribution`)}`}>Contribute to the archive ↗</a></div>}</section>
    <section className="collectionNext" style={{backgroundImage:`linear-gradient(90deg,rgba(5,7,5,.95),rgba(5,7,5,.35)),url('${archiveItems.find((item) => next.itemIds.includes(item.id))?.image ?? "/field-elk.webp"}')`}}><p>NEXT MUSEUM COLLECTION</p><h2>{next.name}</h2><a href={`/museum/${next.id}`}>Continue exploring ↗</a></section>
    <footer className="storyFooter"><a href="/museum">← Museum index</a><span>MT E.L.K., INC. · DIGITAL MUSEUM</span><a href="/#archives">Browse every exhibit →</a></footer>
  </main>;
}
