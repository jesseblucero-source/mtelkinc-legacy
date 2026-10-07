import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { archiveItems, countries } from "../../archive-content";
import { archiveTranscripts } from "../../archive-transcripts";

const editorialContext: Record<string, string[]> = {
  "cow-call-draws-elk": ["The October 1986 feature is valuable because it catches a company in motion. It does not look backward from a polished anniversary; it records production, field response, pricing, dealers, and the people involved while the early story was still unfolding.", "The article also makes clear that the call was never isolated from technique. Its meaning came from listening to elk, understanding the difference between vocalizations, and teaching hunters when and how to use those sounds."],
  "big-bull-elk-cow-talk": ["This photographed Sunday page places cow calling inside a broader regional outdoors conversation. The headline gives the technique unusual prominence beside wildlife reporting, hunting-season coverage, and the visual culture of the newspaper’s outdoors section.", "Because the supplied source is a photograph of the full page, the exhibit preserves its original context while keeping the byline marked for verification. The date and headline remain legible anchors for future research."],
  "founder-record": ["A company biographical sheet is different from independent reporting: it shows how MT E.L.K. described its own body of work. That distinction is important, and the archive presents the document as a company record rather than neutral biography.", "The sheet connects calls to books, videos, demonstrations, and collaborators. Read alongside press coverage, it helps map the range of work that had accumulated by 1998."],
  "more-show": ["The MORE show record moves the story from private field knowledge to public instruction. Laubach appears not only as a product inventor, but as a speaker and calling judge expected to explain technique to an audience.", "That public role matters because it reveals how expertise circulated before online video: through shows, seminars, books, demonstrations, personal relationships, and repeated conversations with hunters."],
  "retail-correspondence": ["Business letters rarely look dramatic, yet they preserve the infrastructure behind a growing product line. Booth planning, representation, deadlines, merchandising, and buyer feedback are the practical mechanics by which a Montana company reached shelves elsewhere.", "These documents also remind us that legacy is relational. A product travels because people answer letters, prepare displays, attend shows, explain its use, and maintain trust over time."],
};

export function generateStaticParams() { return archiveItems.map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = archiveItems.find((record) => record.id === id);
  if (!item) return {};
  return { title: `${item.title} | MT E.L.K. Archive`, description: item.summary, openGraph: { images: [item.image] } };
}

export default async function ArchiveExhibitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = archiveItems.find((record) => record.id === id);
  if (!item) notFound();
  const country = countries.find((entry) => entry.id === item.country);
  const related = archiveItems.filter((record) => record.id !== item.id && (record.people.some((person) => item.people.includes(person)) || record.tags.some((tag) => item.tags.includes(tag)))).slice(0, 3);
  const position = archiveItems.findIndex((record) => record.id === item.id) + 1;
  const context = editorialContext[item.id] ?? [`This exhibit fixes a point in the MT E.L.K. story through a surviving ${item.tags[0]?.toLowerCase() || "archival"} record. The publication, date, people, and product are indexed so the object can be understood in relation to the wider collection.`, `Read beside related records, the document shows how field knowledge moved between people, products, media, education, and business relationships. Details that remain uncertain are left visibly open rather than filled with assumption.`];
  const transcript = archiveTranscripts[item.id];

  return <main className="exhibitPage">
    <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE HISTORICAL ARCHIVE</small></span></a><a href="/archive">Archive explorer</a><span>EXHIBIT {String(position).padStart(3, "0")} / {String(archiveItems.length).padStart(3, "0")}</span></nav>
    <header className="exhibitHero"><div className="exhibitVisual"><img src={item.image} alt={`Original scan from ${item.title}`}/><span>{item.restored ? "RESTORED READING COPY" : "ORIGINAL SOURCE"} · {item.pages} {item.pages === 1 ? "PAGE" : "PAGES"}</span></div><div className="exhibitLead"><p className="kicker">{item.publication} · {item.date}</p><h1>{item.title}</h1><p>{item.summary}</p><div className="exhibitActions">{item.pdf ? <><a className="brassButton" href={item.pdf} target="_blank" rel="noreferrer">Open {item.restored ? "restored" : "original"} PDF ↗</a><a href="#document">Read the document ↓</a>{transcript && <a href="#transcript">Read transcript ↓</a>}</> : <a className="brassButton" href={item.image} target="_blank" rel="noreferrer">View source photograph ↗</a>}</div>{item.restored && <p className="restorationDisclosure"><b>PRESERVATION NOTE</b>This restored copy improves contrast, sharpness, and tonal balance. No missing content was invented.</p>}</div></header>
    <section className="curatorGrid"><div><p className="kicker">CURATOR’S NOTE</p><h2>WHY THIS<br/><i>MATTERS</i></h2></div><div><p className="curatorStatement">{item.importance}</p><dl className="exhibitIndex"><div><dt>AUTHOR</dt><dd>{item.author}</dd></div><div><dt>PRODUCT</dt><dd>{item.product}</dd></div><div><dt>PEOPLE</dt><dd>{item.people.join(", ") || "No people indexed"}</dd></div><div><dt>REGION</dt><dd>{country?.name}</dd></div><div><dt>TAGS</dt><dd>{item.tags.join(" · ")}</dd></div></dl></div></section>
    <section className="readingRecord"><div><p className="kicker">READING THE RECORD</p><h2>WHAT THE<br/><i>OBJECT REVEALS</i></h2></div><div>{context.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<blockquote>Every object answers one question and opens another. The archive grows by keeping both visible.</blockquote></div></section>
    {item.pdf && <section className="documentRoom" id="document"><div className="documentHead"><div><p className="kicker">{item.restored ? "PRESERVATION & ACCESS" : "THE ORIGINAL RECORD"}</p><h2>READ THE<br/><i>{item.restored ? "RESTORED COPY" : "DOCUMENT"}</i></h2></div><p>{item.restored ? "This enhanced reading copy recovers contrast from the faded scan while preserving page geometry and source marks." : "Presented as an artifact, not reduced to a download. Open the original in a new tab for full-screen reading or saving."}</p></div><div className="pdfStage"><iframe src={`${item.pdf}#view=FitH`} title={`${item.restored ? "Restored reading copy" : "Original PDF"}: ${item.title}`}/></div></section>}
    {transcript && <section className="transcriptRoom" id="transcript"><div className="transcriptHead"><div><p className="kicker">ACCESSIBLE ARTICLE TEXT</p><h2>READ THE<br/><i>TRANSCRIPT</i></h2></div><p>Extracted from the supplied scans and lightly corrected for spacing and obvious recognition errors. Consult the page image for the authoritative historical record.</p></div><article className="transcriptBox"><header><span>{item.publication} · {item.date}</span><h3>{transcript.title}</h3><p>{transcript.deck}</p><strong>{transcript.byline}</strong></header><div>{transcript.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article></section>}
    <section className="relatedRecords"><p className="kicker">FOLLOW THE THREAD</p><h2>RELATED<br/><i>RECORDS</i></h2><div>{related.map((record) => <a href={`/archive/${record.id}`} key={record.id}><img src={record.image} alt=""/><small>{record.date}</small><h3>{record.title}</h3><span>Enter exhibit ↗</span></a>)}</div></section>
    <footer className="storyFooter"><a href="/archive">← Return to the archive</a><span>MT E.L.K., INC. · MONTANA · EST. 1985</span><a href={`/countries/${item.country}`}>Explore {country?.name} →</a></footer>
  </main>;
}
