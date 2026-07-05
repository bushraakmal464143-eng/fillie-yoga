import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import Nav from "@/components/Nav";
import RevealObserver from "@/components/RevealObserver";
import { AppProvider } from "@/components/providers/AppProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SOCIAL } from "@/lib/social";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Om At Home",
  url: "https://omathome.com",
  sameAs: [SOCIAL.instagram, SOCIAL.facebook, SOCIAL.youtube, SOCIAL.tiktok],
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AppProvider>
        <AuthProvider>
          <HashScroll />
          <Nav />
          {children}
          <Footer />
          <RevealObserver />
        </AuthProvider>
      </AppProvider>
    </>
  );
}
