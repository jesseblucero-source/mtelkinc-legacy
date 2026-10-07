import type { Metadata } from "next";
import "./globals.css";
import MotionDirector from "./motion-director";

export const metadata: Metadata = {
  metadataBase: new URL("https://mt-elk-wholesale-canada.jesseblucero-west.chatgpt.site"),
  title: "MT E.L.K., Inc. | The Legacy of the Call",
  description: "The official digital museum and historical archive of MT E.L.K., Inc.—founded in Montana in 1985 and carried forward by T. Phillip Bowers.",
  keywords: ["MT E.L.K. Inc.", "MT ELK Inc.", "Montana elk calls", "elk calling history", "T. Phillip Bowers", "Power Bugle", "Cow Talk", "Royal Bugle", "hunting call history"],
  icons: { icon: "/mt-elk-logo.png", shortcut: "/mt-elk-logo.png" },
  openGraph: { title: "MT E.L.K., Inc. — The Legacy of the Call", description: "Founded in Montana. Carried Forward by T. Phillip Bowers. Heard Around the World.", type: "website", locale: "en_US", images: [{ url: "/og-legacy.png", width: 1536, height: 1024, alt: "MT E.L.K., Inc. — The Legacy of the Call" }] },
  twitter: { card: "summary_large_image", title: "MT E.L.K., Inc. — The Legacy of the Call", description: "The official digital museum and historical archive.", images: ["/og-legacy.png"] },
  alternates: { canonical: "/" },
};

const schema = {
  "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "name": "MT E.L.K., Inc.", "foundingDate": "1985", "url": "https://mtelkinc.com/", "telephone": "+1-406-517-8923", "email": "Phillip@elkinc.com", "address": { "@type": "PostalAddress", "postOfficeBoxNumber": "473", "addressLocality": "Livingston", "addressRegion": "MT", "postalCode": "59047", "addressCountry": "US" } },
    { "@type": "Person", "name": "T. Phillip Bowers", "jobTitle": "Owner", "worksFor": { "@type": "Organization", "name": "MT E.L.K., Inc." } },
    { "@type": "WebSite", "name": "MT E.L.K., Inc. — The Legacy of the Call", "url": "https://mtelkinc.com/" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-US"><head><script dangerouslySetInnerHTML={{__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PLD8DMVD');`}} /></head><body><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PLD8DMVD" height="0" width="0" style={{display:"none",visibility:"hidden"}} title="Google Tag Manager" /></noscript><MotionDirector />{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}} /></body></html>;
}
