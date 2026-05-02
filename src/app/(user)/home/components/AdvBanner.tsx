import Image from "next/image";

export default function AdvBanner() {
  return (
    <section className="adv-full">
      <div className="container">
        <div className="adv_img">
          <Image
            src="/images/adv-banner-4.jpg"
            alt="Medical Service Banner"
            fill
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
