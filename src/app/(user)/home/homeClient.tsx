import Banner from "./components/Banner";
import HealthConditions from "./components/HealthConditions";
import Marquee from "./components/Marquee";
import HomeClientInner from "./HomeClientInner";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeClient(props: any) {
  return (
    <>
      <h1 className="visually-hidden">
        Online Pharmacy & Medicine Delivery in India
      </h1>

      <Banner />
      <Marquee />
      <HealthConditions groupCare={props.initialGroupCare} />

      {/* 🔥 CLIENT PART */}
      <HomeClientInner {...props} />
    </>
  );
}
