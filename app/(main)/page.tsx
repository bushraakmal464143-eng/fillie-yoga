import BookApp from "@/components/BookApp";
import CommunityBand from "@/components/CommunityBand";
import Hero from "@/components/Hero";
import HomePractice from "@/components/HomePractice";
import Sunset from "@/components/Sunset";
import WorldSection from "@/components/WorldSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HomePractice />
      <CommunityBand />
      <Sunset />
      <WorldSection />
      <BookApp />
    </>
  );
}
