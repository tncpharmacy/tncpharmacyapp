"use client";

import Image from "next/image";
import { Carousel } from "react-bootstrap";

export default function Banner() {
  return (
    <Carousel
      fade
      controls={true}
      indicators={true}
      interval={3000}
      pause={false}
    >
      <Carousel.Item>
        <Image
          src="/images/main-banner-1.jpg"
          className="d-block w-100"
          alt="..."
          width={1200}
          height={350}
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="hero-banner">
          <div className="container">
            <div className="mySlides fadeInLeft">
              <h2 className="title">Happiness is the Highest form of Health</h2>
              <span className="subtitle">#StayHealthy</span>
            </div>
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <Image
          src="/images/main-banner-2.jpg"
          className="d-block w-100"
          alt="..."
          width={1200}
          height={350}
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="hero-banner">
          <div className="container">
            <div className="mySlides fadeInLeft">
              <h2 className="title">Move with grace, health finds its place</h2>
              <span className="subtitle">#StayHealthy</span>
            </div>
          </div>
        </div>
      </Carousel.Item>
      <Carousel.Item>
        <Image
          src="/images/main-banner-3.jpg"
          className="d-block w-100"
          alt="..."
          width={1200}
          height={350}
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="hero-banner">
          <div className="container">
            <div className="mySlides fadeInLeft">
              <h2 className="title">Health is the Foundation of Happiness</h2>
              <span className="subtitle">#StayHealthy</span>
            </div>
          </div>
        </div>
      </Carousel.Item>
    </Carousel>
  );
}
