"use client";

import Slider from "react-slick";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";
import React from "react";

const CARE_GROUP_ICONS: Record<string, string> = {
  "Diabetic Care": "images/icons/icon-diabetes-care.svg",
  "Stomach Care": "images/icons/icon-stomach-care.svg",
  "Liver Care": "images/icons/icon-liver-care.svg",
  "Oral Care": "images/icons/icon-oral-care.svg",
  "Eye Care": "images/icons/icon-eye-care.svg",
  "Hair Care": "images/icons/icon-hair-care.svg",
  "Pain Relief": "images/icons/icon-pain-relief-care.svg",
  "Heart Care": "images/icons/icon-heart-care.svg",
  "First Aid Care": "images/icons/icon-default-care.svg",
  DEFAULT: "images/icons/icon-default-care.svg",
};
const BG_CLASSES = ["bg-1", "bg-2", "bg-3", "bg-4", "bg-5", "bg-6"];
const getIconPath = (groupName: string): string => {
  return CARE_GROUP_ICONS[groupName] || CARE_GROUP_ICONS.DEFAULT;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HealthConditions({ groupCare }: any) {
  const router = useRouter();
  const [slides, setSlides] = React.useState(5);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeout: any;

    const updateSlides = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const w = window.innerWidth;

        if (w <= 360) setSlides(1);
        else if (w <= 480) setSlides(2);
        else if (w <= 768) setSlides(2);
        else if (w <= 1024) setSlides(3);
        else if (w <= 1120) setSlides(4);
        else setSlides(5);
      }, 150);
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateSlides);
    };
  }, []);

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: slides,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    swipeToSlide: true,
  };
  return (
    <section className="category_sec">
      <div className="container">
        <h2 className="section_title text-start">
          Browse by Health Conditions
        </h2>
        <div className="slider-container">
          {groupCare.length > 0 ? (
            <Slider {...settings}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {groupCare.map((group: any, index: number) => (
                <div key={group.id}>
                  <div
                    className="category_item"
                    onClick={() =>
                      router.push(`/all-group-care/${encodeId(group.id)}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`category_img ${
                        BG_CLASSES[index % BG_CLASSES.length]
                      }`}
                    >
                      <Image
                        src={getIconPath(group.group_name)}
                        alt={group.group_name}
                        width={60}
                        height={60}
                        priority
                        sizes="(max-width: 768px) 50vw, 20vw"
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    </div>

                    <div>
                      <h2 className="category_title">{group.group_name}</h2>
                      <span className="category_link">
                        View Now <i className="bi bi-arrow-right-short"></i>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : null}
        </div>
      </div>
    </section>
  );
}
