import BookApp from "@/components/BookApp";
import CommunityBand from "@/components/CommunityBand";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HomePractice from "@/components/HomePractice";
import Sunset from "@/components/Sunset";
import WellnessOfferings from "@/components/WellnessOfferings";
import WorldSection from "@/components/WorldSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HomePractice />
      <CommunityBand />
      <WellnessOfferings />
      <Sunset />
      <WorldSection />
      <BookApp />
    </>
  );
}
