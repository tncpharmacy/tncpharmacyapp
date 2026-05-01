import Image from "next/image";

const whyData = [
  {
    icon: "/images/icons/icon-discount.svg",
    title: "100% Genuine Medicines",
    desc: "Up to 70% off on Generic Medicines",
  },
  {
    icon: "/images/icons/icon-pharmacist-verified.svg",
    title: "Pharmacist Verified Orders",
    desc: "Sourced From TnC Trusted Brand",
  },
  {
    icon: "/images/icons/icon-shipping.svg",
    title: "Free & Fast Shipping",
    desc: "Orders All Over",
  },
  {
    icon: "/images/icons/icon-secure.svg",
    title: "Secure Payment Options",
    desc: "UPI or Cash on Delivery",
  },
];

export default function WhySection() {
  return (
    <section className="why_section">
      <div className="container">
        <div className="row">
          {whyData.map((item, index) => (
            <div className="col-6 col-sm-3" key={index}>
              <div className="why_box">
                <div className="why_icon">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={40}
                    height={40}
                  />
                </div>

                <div className="why_text">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
