"use client";

import { useMemo, useState } from "react";
import { archiveItems, museumCategories } from "../archive-content";

export default function ArchiveIndexPage() {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const visible = useMemo(() => {
    const allowed = collection === "all" ? null : museumCategories.find((entry) => entry.id === collection)?.itemIds ?? [];
    const needle = query.trim().toLowerCase();
    return archiveItems.filter((item) => (!allowed || allowed.includes(item.id)) && (!needle || [item.title, item.publication, item.date, item.author, item.product, item.summary, ...item.tags, ...item.people].join(" ").toLowerCase().includes(needle)));
  }, [query, collection]);

  return <main className="archiveIndexPage">
    <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE HISTORICAL ARCHIVE</small></span></a><a href="/museum">Digital Museum</a><span>SEARCHABLE INDEX · {archiveItems.length} EXHIBITS</span></nav>
    <header className="archiveIndexHero"><p className="overline">PRIMARY SOURCES · CURATED CONTEXT · LIVING HISTORY</p><h1>ARCHIVE<br/><i>EXPLORER</i></h1><p>Search the complete indexed record by publication, person, product, date, place, or subject—then open the original document and its curatorial story.</p></header>
    <section className="archiveControls" aria-label="Archive search controls"><label><span>SEARCH THE RECORD</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Cow Talk, 1988, Don Laubach…" type="search"/></label><div><span>FILTER BY COLLECTION</span><select value={collection} onChange={(event) => setCollection(event.target.value)}><option value="all">All collections</option>{museumCategories.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></div><p aria-live="polite"><strong>{visible.length}</strong> {visible.length === 1 ? "record" : "records"} found</p></section>
    <section className="archiveIndexResults"><div className="archiveIndexHead"><p className="kicker">THE INDEX</p><h2>{query || collection !== "all" ? "MATCHING" : "ALL"}<br/><i>EXHIBITS</i></h2></div>{visible.length ? <div className="archiveIndexGrid">{visible.map((item, index) => <a href={`/archive/${item.id}`} key={item.id}><div className="archiveIndexImage"><img src={item.image} alt={`Archival source for ${item.title}`}/><b>{String(index + 1).padStart(3, "0")}</b></div><small>{item.publication} · {item.date}</small><h3>{item.title}</h3><p>{item.summary}</p><div>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><strong>Enter exhibit ↗</strong></a>)}</div> : <div className="archiveNoResults"><span>NO RECORDS MATCH THIS SEARCH</span><h3>Try a broader word or choose another collection.</h3><button onClick={() => { setQuery(""); setCollection("all"); }}>Clear search</button></div>}</section>
    <section className="archiveContribution"><p className="kicker">THE NEXT OBJECT</p><h2>HISTORY GROWS<br/>WHEN RECORDS <i>SURFACE.</i></h2><p>Have an article, photograph, catalog, advertisement, recording, dealer document, or firsthand account connected to MT E.L.K.?</p><a className="brassButton" href="mailto:Phillip@elkinc.com?subject=MT E.L.K. archive contribution">Contribute to the archive ↗</a></section>
    <footer className="storyFooter"><a href="/">← The Legacy of the Call</a><span>MT E.L.K., INC. · ARCHIVE EXPLORER</span><a href="/museum">Explore collections →</a></footer>
  </main>;
}
