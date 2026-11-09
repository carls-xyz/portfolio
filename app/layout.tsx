import "@fontsource-variable/space-grotesk";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Ile from "@/components/layout/Ile";
import ReglagesVerre from "@/components/layout/ReglagesVerre";
import { URL_SITE } from "@/lib/partage";
import { SCRIPT_THEME } from "@/components/layout/scriptTheme";

export const metadata = {
  title: {
    // Every tab reads just "carls-xyz"; pages keep their own titles on the page itself
    default: "carls-xyz",
    template: "carls-xyz",
  },
  description: "Portfolio de développeur web",
  // Absolute URLs for the share images (app/opengraph-image.tsx and per project)
  metadataBase: new URL(URL_SITE),
  openGraph: {
    siteName: "carls-xyz",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets data-theme before React hydrates, hence the warning opt-out
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <Ile />
        <ReglagesVerre />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}