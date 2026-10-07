import type { Metadata } from "next";
import { archiveItems } from "../archive-content";

export const metadata: Metadata = { title: "Field Journal | MT E.L.K., Inc.", description: "Stories of calling history, field knowledge, archival discoveries, and the living MT E.L.K. product tradition." };

const stories = [
  { label:"ARCHIVE STORY", title:"When Cow Talk Entered the Newspaper Record", copy:"Two October 1986 newspaper pages capture a Montana field idea becoming a product, teaching method, and regional outdoor story.", item:"cow-call-draws-elk", read:"6 MIN READ" },
  { label:"FIELD KNOWLEDGE", title:"Why Cow and Calf Sounds Changed the Conversation", copy:"The archive shows instruction traveling with the tool—from observation and practice to articles, seminars, books, and video.", item:"cow-talk-for-elk", read:"5 MIN READ" },
  { label:"OBJECT HISTORY", title:"The Complete Calling System in One Advertisement", copy:"A surviving color advertisement connects product design, pricing, packaging, video education, and the language used to reach hunters.", item:"talk-to-the-elk", read:"4 MIN READ" },
  { label:"PEOPLE", title:"Don Laubach: Founder, Inventor, Teacher", copy:"A 1998 company record inventories the calls, books, films, collaborations, demonstrations, and teaching work behind the name.", item:"founder-record", read:"7 MIN READ" },
  { label:"EDUCATION", title:"Before Online Video, Knowledge Traveled This Way", copy:"Shows, demonstrations, books, recordings, and instructional films formed a network for passing field knowledge from person to person.", item:"prime-time", read:"5 MIN READ" },
  { label:"BUSINESS HISTORY", title:"The Retail Relationships Behind the Product Line", copy:"Letters and trade records reveal the quiet work of booths, buyers, representation, deadlines, and trust behind distribution.", item:"retail-correspondence", read:"4 MIN READ" },
];

export default function JournalPage() { const posts = stories.map((story) => ({...story, record:archiveItems.find((item) => item.id === story.item)!})); return <main className="journalPage">
  <nav className="storyNav"><a className="storyMark" href="/"><img src="/mt-elk-logo.png" alt=""/><span>MT E.L.K.<small>THE FIELD JOURNAL</small></span></a><a href="/store">Shop products</a><span>HISTORY · FIELDCRAFT · PEOPLE</span></nav>
  <header className="journalHero"><div><p className="overline">STORIES FROM THE ARCHIVE & THE FIELD</p><h1>THE FIELD<br/><i>JOURNAL</i></h1><p>Long-form stories where verified history, practical knowledge, product heritage, and the people behind MT E.L.K. meet.</p></div><a href={`/archive/${posts[0].item}`}><img src={posts[0].record.image} alt=""/><small>FEATURED · {posts[0].read}</small><h2>{posts[0].title}</h2><span>Read the story ↗</span></a></header>
  <section className="journalFeed"><div className="journalFeedHead"><p className="kicker">LATEST STORIES</p><h2>FOLLOW THE<br/><i>THREAD.</i></h2></div><div>{posts.slice(1).map((post, index) => <a href={`/archive/${post.item}`} key={post.item}><div><img src={post.record.image} alt=""/><b>{String(index + 2).padStart(2,"0")}</b></div><small>{post.label} · {post.read}</small><h3>{post.title}</h3><p>{post.copy}</p><span>Continue reading ↗</span></a>)}</div></section>
  <section className="journalPath"><div><p className="kicker">FROM KNOWLEDGE TO PRACTICE</p><h2>READ THE HISTORY.<br/>CHOOSE THE <i>TOOLS.</i></h2></div><div><p>The journal provides context. The museum preserves evidence. The store carries the living product line forward.</p><a className="brassButton" href="/store">Explore the store ↗</a><a href="/museum">Enter the museum →</a></div></section>
  <footer className="storyFooter"><a href="/">← The Legacy of the Call</a><span>MT E.L.K., INC. · FIELD JOURNAL</span><a href="/store">Shop official products →</a></footer>
 </main>; }
