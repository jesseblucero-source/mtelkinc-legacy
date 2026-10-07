"use client";

import { useState } from "react";
import { products } from "./products/catalog";
import { archiveItems, countries, museumCategories, parallelTimeline, people, timeline } from "./archive-content";

const productStories = [
  { name: "Power Bugle", id: "751638462", era: "Archive era to verify", line: "A flagship voice in the continuing record." },
  { name: "Royal Bugle", id: "751638698", era: "Archive era to verify", line: "Historical packaging and advertisements invited." },
  { name: "Cow Talk", id: "751639142", era: "Archive era to verify", line: "A product story connected to instruction and field use." },
  { name: "Deer Talk", id: "751638443", era: "Archive era to verify", line: "One call within a broader game-calling system." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <main id="top">
    <nav className="museumNav" aria-label="Primary navigation">
      <a className="wordmark" href="#top"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE LEGACY OF THE CALL</small></span></a>
      <button className="navToggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>INDEX</button>
      <div className={menuOpen ? "quietNav open" : "quietNav"}>
        {[['History','#history'],['Museum','/museum'],['Journal','/journal'],['Archive','/archive'],['About','#about'],['Store','/store']].map(([label,href]) => <a className={label === 'Store' ? 'navStore' : ''} key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </div>
      <span className="edition">DIGITAL ARCHIVE · 001</span>
    </nav>

    <header className="legacyHero">
      <div className="heroAtmosphere"/><div className="heroGrain"/>
      <div className="heroTitle"><p className="overline">MONTANA · EST. 1985 · USA</p><p className="heroBrand">MT E.L.K., INC.</p><h1>THE LEGACY<br/>OF THE <em>CALL</em></h1><p className="heroDeck">Founded in Montana in 1985. Carried Forward by T. Phillip Bowers. Heard Around the World.</p><div className="heroActions"><a className="brassButton" href="#history">Explore the story</a><a href="/museum">Enter the museum <span>↗</span></a><a href="/archive">Search the archive <span>↗</span></a></div></div>
      <div className="heroCoordinates"><span>45.6614° N</span><span>110.5600° W</span></div>
      <a className="scrollCue" href="#countries"><span/>SCROLL TO BEGIN</a>
    </header>

    <section className="countryPortal" id="countries">
      <div className="chapterIntro"><p className="kicker">CHAPTER I · GLOBAL RECORD</p><h2>FROM MONTANA<br/>TO THE <i>WORLD</i></h2><p>What began in Montana eventually reached hunters, distributors, retailers, guides, outdoor communities, and sporting traditions far beyond the American West.</p></div>
      <div className="countryCards">{countries.map((c, index) => <a className="countryCard" href={`/countries/${c.id}`} key={c.id} style={{backgroundImage:`linear-gradient(90deg,rgba(8,10,8,.9),rgba(8,10,8,.15)),url('${c.image}')`}}><span>0{index+1}</span><div><small>{c.code} · {c.note}</small><strong>{c.name}</strong><em>{c.chapter}</em></div><b>↗</b></a>)}</div>
    </section>

    <section className="origin" id="history"><div className="originImage"><span>THE ABSAROKA RANGE · MONTANA</span></div><div className="originStory"><p className="kicker">CHAPTER II · ORIGIN</p><span className="bigYear">1985</span><h2>IT STARTED<br/>IN MONTANA</h2><p className="dropcap">Founded in Montana in 1985, MT E.L.K., Inc. grew from a deep understanding of animal communication, calling techniques, and hunting experience.</p><p>Innovative calling systems, instructional materials, videos, demonstrations, and field knowledge made the company part of a broader evolution in modern game calling.</p><aside>Every deeper historical claim on this site is designed to be tied to a verified article, photograph, catalog, interview, or document as the archive grows.</aside></div></section>

    <section className="evidenceChapter"><div className="evidenceLead"><p className="kicker">THE EARLY RECORD · 1986</p><h2>WHEN AN IDEA<br/>LEFT THE <i>FIELD</i></h2><p>Two newspaper features published within days of each other capture MT E.L.K. at a consequential moment: a practical Montana hunting idea becoming a product, a teaching method, and a story traveling through the outdoor press.</p><a href="/archive/cow-call-draws-elk">ENTER THE 1986 EXHIBIT ↗</a></div><div className="evidenceFacts"><article><span>01</span><h3>The sound came first.</h3><p>The surviving coverage centers on cow and calf vocalizations—not noise for its own sake, but communication observed, practiced, and translated into a call hunters could learn to use.</p></article><article><span>02</span><h3>The field tested the idea.</h3><p>Early reporting collected hunter experiences and placed the call inside actual bow and rifle seasons. Those accounts helped turn a local invention into a subject for wider discussion.</p></article><article><span>03</span><h3>Education traveled with it.</h3><p>Books, seminars, demonstrations, recordings, and video soon surrounded the calls. The archive shows that instruction was not an accessory; it was part of the system.</p></article><article><span>04</span><h3>The record became a network.</h3><p>Writers, filmmakers, guides, retailers, dealers, and hunters carried the story into new publications and places. Each surviving object now reconnects part of that network.</p></article></div></section>

    <section className="historyTimeline"><div className="sectionTitle"><p className="kicker">A LIVING CHRONOLOGY</p><h2>THE RECORD,<br/><i>STILL UNFOLDING.</i></h2></div><div className="timeline">{timeline.map((item,index)=><article key={item.year}><span>0{index+1}</span><time>{item.year}</time><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</div></section>

    <section className="voices"><div className="voicesLead"><p className="kicker">CHAPTER III · PEOPLE</p><h2>THE VOICES<br/>BEHIND THE<br/><i>LEGACY</i></h2><p>Products can be copied. Knowledge has to be passed down.</p></div><div className="peopleList">{people.map((person,index)=><article key={person.name}><span>0{index+1}</span><div><small>{person.role}</small><h3>{person.name}</h3><p>{person.copy}</p></div><b>RECORD ↗</b></article>)}</div></section>

    <section className="phillipProfile" id="phillip"><div className="phillipPortrait"><div className="portraitNote">MODERN PORTRAIT<br/>ARCHIVE PLACEMENT</div></div><div className="phillipCopy"><p className="kicker">CHAPTER IV · STEWARDSHIP</p><h2>THE KEEPER<br/>OF THE <i>CALL</i></h2><h3>T. PHILLIP BOWERS</h3><blockquote>“A legacy survives when someone chooses to carry it forward.”</blockquote><p>As owner, Phillip carries the responsibility of preserving MT E.L.K.’s products, knowledge, relationships, traditions, and history—while introducing the company to new generations and new places.</p><p>This documentary chapter is built to grow around verified interviews, field stories, mentors, milestones, photographs, and source documents.</p><div className="profileRoles"><span>OWNER</span><span>STEWARD</span><span>STORYTELLER</span></div></div></section>

    <section className="dualChronology"><div className="dualHead"><p className="kicker">TWO STORIES · ONE FUTURE</p><h2>THE COMPANY<br/><i>& THE MAN</i></h2></div><div className="dualLabels"><span>THE COMPANY</span><span>THE MAN</span></div><div className="dualRows">{parallelTimeline.map((row,index)=><article key={index}><div><time>{row.company[0]}</time><h3>{row.company[1]}</h3></div><span className="dualMark">{index+1}</span><div><time>{row.man[0]}</time><h3>{row.man[1]}</h3></div></article>)}</div></section>

    <section className="archive" id="archives"><div className="archiveHead"><div><p className="kicker">CHAPTER V · THE PAPER TRAIL</p><h2>FROM THE<br/><i>ARCHIVES</i></h2></div><p>Every article becomes an exhibit—connected to its people, products, country, era, and place in the larger story.</p></div><div className="archiveRail">{archiveItems.map((item,index)=><article className="archiveCard" key={item.id}><div className="archiveImage"><img src={item.image} alt={`Original scan from ${item.title}`} loading="lazy"/><span>EXHIBIT {String(index+1).padStart(3,'0')}</span></div><div className="archiveMeta"><small>{item.publication} · {item.date}</small><h3>{item.title}</h3><p>{item.summary}</p><div className="tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="archiveActions"><a href={`/archive/${item.id}`}>Enter full exhibit ↗</a>{item.pdf && <a href={item.pdf} target="_blank" rel="noreferrer">View original article ↗</a>}</div></div></article>)}</div></section>

    <section className="whyMatters"><div className="paperExhibit"><span>ARCHIVE<br/>DOCUMENT<br/>PLACEMENT</span><b>MT<br/>E.L.K.</b><small>Source scan / future exhibit</small></div><div><p className="kicker">CURATOR’S NOTE</p><h2>WHY THIS<br/><i>MATTERS</i></h2><p>A historical object matters when we understand what it proves: the period it documents, the person it records, the product it places in the field, and the path by which knowledge traveled.</p><dl><div><dt>PERIOD</dt><dd>To be verified from source</dd></div><div><dt>PRODUCT</dt><dd>Linked to the historical catalog</dd></div><div><dt>PEOPLE</dt><dd>Indexed across every exhibit</dd></div><div><dt>SIGNIFICANCE</dt><dd>Editorial context, not just a download</dd></div></dl></div></section>

    <section className="productHistory"><div className="productIntro"><p className="kicker">CHAPTER VI · OBJECTS</p><h2>THE CALLS THAT<br/>BECAME PART OF<br/><i>THE STORY</i></h2><p>THE TOOLS EVOLVED. THE PURPOSE DIDN’T.</p></div><div className="productStories">{productStories.map((story,index)=>{const product=products.find(p=>p.id===story.id);return <a href={`/products/${story.id}`} key={story.id}><span>0{index+1}</span><div className="productImage"><small>THEN · ARCHIVE PENDING</small><img src={product?.image} alt={story.name} loading="lazy"/><b>NOW</b></div><div><small>{story.era}</small><h3>{story.name}</h3><p>{story.line}</p></div></a>})}</div></section>

    <section className="worldMap"><div className="mapCopy"><p className="kicker">CHAPTER VII · DISTANCE</p><h2>A MONTANA<br/>SOUND TRAVELED<br/><i>A LONG WAY</i></h2><p>Six chapters. One point of origin. A global record waiting to be fully assembled.</p></div><div className="mapField" aria-label="Stylized global reach map"><span className="originDot">MONTANA</span>{countries.slice(1).map((c,index)=><span className={`route route${index+1}`} key={c.id}><i/><b>{c.name}</b></span>)}</div></section>

    <section className="countryChapters">{countries.map((c,index)=><article id={c.id} key={c.id}><div className="countryPhoto" style={{backgroundImage:`linear-gradient(0deg,rgba(8,10,8,.84),transparent 70%),url('${c.image}')`}}><span>{String(index+1).padStart(2,'0')} / 06</span><small>{c.code}</small></div><div><p className="kicker">INTERNATIONAL RECORD</p><h2>{c.name}</h2><h3>{c.chapter}</h3><p>{c.id==='united-states' ? 'The documented origin: Montana, field knowledge, product development, education, publications, hunters, guides, retailers, and the relationships from which the wider story grew.' : 'This chapter is ready for verified articles, advertisements, dealers, guides, photographs, translated materials, events, and firsthand accounts from this region.'}</p><a href={`/countries/${c.id}`}>ENTER THE FULL CHAPTER ↗</a></div></article>)}</section>

    <section className="thenNow"><div className="thenPanel"><small>THEN · DATE TO VERIFY</small><img src="/dealer-guide-1.jpg" alt="Historic material placeholder" loading="lazy"/><span>ARCHIVAL MATERIAL</span></div><div className="nowPanel"><small>NOW · THE LIVING COMPANY</small><img src="/products/751638462.jpg" alt="Modern Power Bugle" loading="lazy"/><span>CONTINUING PRODUCT</span></div><div className="thenCopy"><p className="kicker">CHAPTER VIII · CONTINUITY</p><h2>THEN<br/><i>& NOW</i></h2><p>Old package to current product. Print instruction to digital education. Historic relationship to modern expansion.</p></div></section>

    <section className="education" id="field-classroom">
      <div className="educationCopy">
        <p className="kicker">CHAPTER IX · FIELD CLASSROOM</p>
        <h2>LEARN THE<br/>LANGUAGE OF<br/><i>MULE DEER</i></h2>
        <p>Knowledge has always been part of the product. This field lesson demonstrates how Deer Talk — the “Deer Stopper” call — can reproduce the social sounds that make a mule deer pause, look, and reveal its position.</p>
        <p className="educationNote">Watch the technique, hear the call, then explore the instrument behind the lesson.</p>
        <div className="educationActions"><a className="brassButton" href="/products/751638443">EXPLORE DEER TALK ↗</a><a href="/store">VISIT THE FIELD STORE →</a></div>
      </div>
      <div className="deerTalkFeature">
        <div className="deerTalkVideo">
          <iframe width="996" height="747" src="https://www.youtube.com/embed/zsuF0blJAYw" title={'How To: Call Mule Deer featuring "Deer Talk" the "Deer Stopper" Call (2)'} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"></iframe>
        </div>
        <div className="deerTalkCaption"><span>FIELD LESSON · MULE DEER</span><div><h3>How to Call Mule Deer</h3><p>Featuring Deer Talk — “The Deer Stopper” Call</p></div><a href="https://www.youtube.com/watch?v=zsuF0blJAYw" target="_blank" rel="noreferrer">WATCH ON YOUTUBE ↗</a></div>
      </div>
    </section>

    <section className="commerceBridge"><div><p className="kicker">THE LIVING PRODUCT LINE</p><h2>FROM THE ARCHIVE<br/>TO <i>THE FIELD.</i></h2><p>The history explains where the calls came from. The store carries that knowledge forward with calls, complete packages, replacement parts, books, and field education.</p><div><a className="brassButton" href="/store">Shop all products ↗</a><a href="/journal">Read the Field Journal →</a></div></div><div className="commerceProducts">{products.filter(product => ['751638462','751639142','751638443'].includes(product.id)).map(product => <a href={`/products/${product.id}`} key={product.id}><img src={product.image} alt={product.name}/><small>{product.category}</small><h3>{product.name}</h3><strong>{product.price}</strong></a>)}</div></section>

    <section className="about" id="about"><div><p className="kicker">CHAPTER X · THE COMPANY</p><h2>ABOUT<br/>MT E.L.K., INC.</h2></div><div><p className="dropcap">Founded in Montana in 1985, MT E.L.K., Inc. grew from a deep understanding of animal communication, calling techniques, and hunting experience.</p><p>Through innovative calling systems, instructional materials, videos, demonstrations, and decades of field knowledge, the company became part of a broader evolution in modern game calling.</p><p>Over time, MT E.L.K. products and knowledge traveled beyond Montana and into hunting communities across the United States and internationally.</p><p>Today, under the ownership of T. Phillip Bowers, the company continues to preserve that history while introducing its products, knowledge, and traditions to another generation.</p></div></section>

    <section className="phillipToday"><div className="todayPhoto"/><div><p className="kicker">CHAPTER XI · TODAY</p><h2>CARRYING THE<br/>STORY <i>FORWARD</i></h2><p>Leadership. Product preservation. Dealer development. International expansion. Education. Relationships. Future generations.</p><ul>{["What does MT E.L.K. mean to you?","Who taught you the most?","Which hunt changed your life?","What stories should never be forgotten?"].map((q,i)=><li key={q}><span>0{i+1}</span>{q}</li>)}</ul></div></section>

    <section className="digitalMuseum"><div><p className="kicker">THE DIGITAL MUSEUM</p><h2>EXPLORE THE<br/>MT E.L.K. <i>ARCHIVE</i></h2><p className="museumInvitation">Enter ten curated collections built from the original articles, advertisements, correspondence, photographs, and product records preserved in the archive.</p><a className="museumAllLink" href="/museum">Enter the museum ↗</a></div><ol>{museumCategories.map((category,i)=><li key={category.id}><a href={`/museum/${category.id}`}><span>{String(i+1).padStart(2,'0')}</span><span className="museumCategoryName">{category.name}<small>{category.itemIds.length ? `${category.itemIds.length} indexed ${category.itemIds.length === 1 ? "record" : "records"}` : "Research open"}</small></span><b>↗</b></a></li>)}</ol></section>

    <section className="journalBridge"><div><p className="kicker">THE FIELD JOURNAL</p><h2>HISTORY, FIELDCRAFT<br/>& THE <i>CALL.</i></h2></div><div><p>Stories drawn from the archive, practical product knowledge, and the people carrying Montana calling tradition forward.</p><a className="brassButton" href="/journal">Read the latest stories ↗</a></div></section>

    <section className="finale" id="contact"><div><p>1985 · MONTANA · TODAY</p><h2>THE STORY IS STILL<br/>BEING <i>WRITTEN.</i></h2><blockquote>The history of MT E.L.K. is not simply a collection of products. It is a collection of people, hunts, lessons, relationships, innovations, mistakes, victories, stories, and generations of knowledge passed from one hunter to another.</blockquote><strong>AND THE CALL CONTINUES.</strong><div><a className="brassButton" href="#archives">Explore the archives</a><a href="#phillip">About T. Phillip Bowers</a><a href="https://elkinc.com" target="_blank" rel="noreferrer">Visit MT E.L.K. ↗</a></div></div></section>

    <footer><div className="footerMark"><img src="/mt-elk-logo.png" alt="MT E.L.K., Inc."/><span>THE LEGACY OF THE CALL<small>MONTANA · EST. 1985</small></span></div><p>Have an article, photograph, catalog, or story for the archive?</p><a href="mailto:Phillip@elkinc.com">Phillip@elkinc.com ↗</a><small>© {new Date().getFullYear()} MT E.L.K., INC. · A LIVING HISTORICAL ARCHIVE</small></footer>

  </main>;
}
