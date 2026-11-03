import "@fontsource-variable/space-grotesk";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Ile from "@/components/layout/Ile";
import { SCRIPT_THEME } from "@/components/layout/scriptTheme";

export const metadata = {
  title: {
    // Every tab reads just "carls-xyz"; pages keep their own titles on the page itself
    default: "carls-xyz",
    template: "carls-xyz",
  },
  description: "Portfolio de Charles Bauchet",
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
        <div id="contenu">{children}</div>
        <Footer />
      </body>
    </html>
  );
}