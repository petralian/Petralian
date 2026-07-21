import dynamic from "next/dynamic";

const SubscribeBox = dynamic(() => import("@/components/SubscribeBox"));

export default function HomeNewsletter() {
  return (
    <section className="home-newsletter" aria-label="Newsletter signup">
      <SubscribeBox />
    </section>
  );
}
