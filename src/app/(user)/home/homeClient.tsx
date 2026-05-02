import Link from "next/link";
import Banner from "./components/Banner";
import HealthConditions from "./components/HealthConditions";
import Marquee from "./components/Marquee";
import HomeClientInner from "./HomeClientInner";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeClient(props: any) {
  return (
    <>
      <h1 className="visually-hidden">
        Online Pharmacy in Noida – Buy Medicines Online with Fast Delivery | TnC
        Pharmacy
      </h1>

      <Banner />
      <div className="container mt-3">
        <p className="text-muted small">
          TnC Pharmacy is a trusted online pharmacy in Noida Sector 29 offering
          genuine medicines, healthcare products, and fast medicine delivery
          across Noida and Delhi NCR. Order medicines online with pharmacist
          verification, affordable prices, and reliable doorstep delivery. Learn
          how to <Link href="/how-to-order">order medicines online</Link>, check
          our <Link href="/offers">latest offers</Link>, or{" "}
          <Link href="/contact-us">contact our pharmacy in Noida</Link> for
          assistance.
        </p>
      </div>
      <Marquee />
      <HealthConditions groupCare={props.initialGroupCare} />

      {/* 🔥 CLIENT PART */}
      <HomeClientInner {...props} />
    </>
  );
}
