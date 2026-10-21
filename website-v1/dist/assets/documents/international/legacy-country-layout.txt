import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { archiveItems, countries } from "../../archive-content";

const details: Record<string, { eyebrow: string; intro: string; focus: string[] }> = {
  "united-states": { eyebrow: "THE DOCUMENTED ORIGIN", intro: "Montana is where product invention, animal communication, field practice, publishing, education, retail relationships, and the people behind MT E.L.K. enter the surviving record.", focus: ["Montana origins", "Calls and product development", "Outdoor press", "Books and instructional video", "Retail and trade relationships"] },
  canada: { eyebrow: "THE NORTHERN CHAPTER", intro: "A regional chapter designed to connect historic product adoption with modern dealers, outfitters, guides, articles, photographs, and firsthand accounts across Canada.", focus: ["Dealer histories", "Outfitter stories", "Canadian publications", "Product adoption", "Modern expansion"] },
  germany: { eyebrow: "THE TRANSATLANTIC CHAPTER", intro: "A living research file for the articles, advertisements, translated materials, dealers, events, and relationships that can document MT E.L.K. in Germany.", focus: ["German-language media", "Distributor relationships", "Events and trade", "Product records", "Hunting traditions"] },
  spain: { eyebrow: "THE EUROPEAN CHAPTER", intro: "Montana calling innovation meets a distinct European hunting tradition. This chapter is ready for verified photographs, publications, guides, events, and product stories.", focus: ["Spanish publications", "Guides and relationships", "Historic photographs", "Product stories", "Events and traditions"] },
  argentina: { eyebrow: "THE SOUTHERN CHAPTER", intro: "A future record of outfitters, guides, hunting operations, product use, articles, dealer history, and the relationships that carried the story south.", focus: ["Outfitter records", "Guide stories", "Dealer history", "Articles and photographs", "International relationships"] },
  "central-asia": { eyebrow: "THE MOUNTAIN & STEPPE CHAPTER", intro: "A new regional research chapter for the people, hunting cultures, distribution relationships, photographs, and documents connecting MT E.L.K. with Central Asia.", focus: ["Regional relationships", "Mountain hunting culture", "Product journeys", "Translated materials", "Photographs and oral histories"] },
};

export function generateStaticParams() { return countries.map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const country = countries.find((entry) => entry.id === id);
  if (!country) return {};
  return { title: `${country.name} | MT E.L.K. Global Archive`, description: `${country.chapter}. Explore the ${country.name} chapter of the MT E.L.K. historical archive.`, openGraph: { images: [country.image] } };
}

export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const country = countries.find((entry) => entry.id === id);
  if (!country) notFound();
  const detail = details[country.id];
  const records = archiveItems.filter((record) => record.country === country.id);
  const index = countries.findIndex((entry) => entry.id === country.id);
  const next = countries[(index + 1) % countries.length];
  return <main className="regionPage">
    <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE GLOBAL RECORD</small></span></a><a href="/#countries">All regions</a><span>CHAPTER {String(index + 1).padStart(2, "0")} / {String(countries.length).padStart(2, "0")}</span></nav>
    <header className="regionHero" style={{backgroundImage:`linear-gradient(90deg,rgba(5,7,5,.94),rgba(5,7,5,.2)),url('${country.image}')`}}><div><p className="overline">{country.code} · {detail.eyebrow}</p><h1>{country.name}</h1><h2>{country.chapter}</h2><p>{detail.intro}</p><a className="brassButton" href="#chapter">Enter the chapter ↓</a></div><span className="regionCode">{country.code}</span></header>
    <section className="regionResearch" id="chapter"><div><p className="kicker">THE LIVING FILE</p><h2>WHAT WE’RE<br/><i>LOOKING FOR</i></h2><p>History grows when records surface. This chapter distinguishes verified evidence from open research and invites the people who hold the next piece of the story.</p></div><ol>{detail.focus.map((focus, i) => <li key={focus}><span>{String(i + 1).padStart(2, "0")}</span>{focus}<b>{records.length ? "INDEXED" : "RESEARCH OPEN"}</b></li>)}</ol></section>
    <section className="regionArchive"><div className="regionArchiveHead"><div><p className="kicker">REGIONAL EVIDENCE</p><h2>{records.length ? "FROM THE" : "THE RECORD"}<br/><i>{records.length ? "ARCHIVE" : "AWAITS"}</i></h2></div><p>{records.length ? `${records.length} verified exhibits are currently indexed to this chapter.` : "No source document is being presented as fact here yet. Articles, catalogs, photographs, dealer records, and firsthand accounts can open this chapter."}</p></div>{records.length ? <div className="regionRecordGrid">{records.map((record) => <a href={`/archive/${record.id}`} key={record.id}><img src={record.image} alt=""/><small>{record.publication} · {record.date}</small><h3>{record.title}</h3><p>{record.summary}</p><span>View exhibit ↗</span></a>)}</div> : <div className="emptyArchive"><span>ARCHIVE STATUS · OPEN</span><p>Do you hold a document, photograph, catalog, advertisement, or story connected to {country.name}?</p><a href="mailto:Phillip@elkinc.com?subject=MT E.L.K. archive contribution">CONTRIBUTE TO THIS CHAPTER ↗</a></div>}</section>
    <section className="regionNext" style={{backgroundImage:`linear-gradient(90deg,rgba(6,8,6,.94),rgba(6,8,6,.35)),url('${next.image}')`}}><p>NEXT GLOBAL CHAPTER</p><h2>{next.name}</h2><a href={`/countries/${next.id}`}>Continue the journey ↗</a></section>
    <footer className="storyFooter"><a href="/">← The Legacy of the Call</a><span>MT E.L.K., INC. · GLOBAL ARCHIVE</span><a href="/#archives">Browse all records →</a></footer>
  </main>;
}
