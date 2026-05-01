import Image from "next/image";

export default function OfferSection() {
  return (
    <section className="offer_sec">
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <div className="pd_offer">
              <Image
                src="/images/banner-h3-01.jpg"
                alt=""
                width={400}
                height={220}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
              <div className="caption">
                <span className="t1">- Upto 20% Off</span>
                <h2 className="t2">Complete Women’s Health & Hygiene Care</h2>
                <div>
                  {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="pd_offer">
              <Image
                src="/images/banner-h3-02.jpg"
                alt=""
                width={400}
                height={220}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
              <div className="caption">
                <span className="t1">- Upto 20% Off</span>
                <h2 className="t2">100% Natural & Ayurvedic Wellness</h2>
                <div>
                  {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="pd_offer">
              <Image
                src="/images/banner-h3-03.jpg"
                alt=""
                width={400}
                height={220}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
              <div className="caption">
                <span className="t1">- Upto 20% Off</span>
                <h2 className="t2">
                  Genuine & Trusted Medicines at Best Prices
                </h2>
                <div>
                  {/* <button className="btn-2">
                      Shop Now <i className="bi bi-chevron-right"></i>
                    </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
