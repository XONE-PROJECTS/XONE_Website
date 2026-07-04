"use client";

import { EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import { ProjectCard } from "@/components/marketing/project-card";
import { projects, type Project } from "@/features/projects/data/projects";
import "@/features/projects/styles/projects-swiper.css";

type ProjectsCarouselProps = {
  items?: readonly Project[];
};

export function ProjectsCarousel({ items = projects }: ProjectsCarouselProps) {
  const canLoop = items.length > 2;

  return (
    <section
      aria-labelledby="projects-carousel-heading"
      className="projects-coverflow-shell"
    >
      <h2 id="projects-carousel-heading" className="sr-only">
        Project portfolio carousel
      </h2>
      <Swiper
        modules={[EffectCoverflow, Pagination]}
        effect="coverflow"
        centeredSlides
        slidesPerView="auto"
        slideToClickedSlide
        watchSlidesProgress
        speed={550}
        loop={canLoop}
        spaceBetween={12}
        coverflowEffect={{
          rotate: 0,
          stretch: -18,
          depth: 130,
          modifier: 1.1,
          slideShadows: false,
        }}
        pagination={{
          el: ".projects-coverflow-pagination",
          clickable: true,
        }}
        breakpoints={{
          640: {
            spaceBetween: 18,
            coverflowEffect: {
              stretch: -28,
              depth: 150,
              modifier: 1.15,
            },
          },
          1024: {
            spaceBetween: 24,
            coverflowEffect: {
              stretch: -36,
              depth: 170,
              modifier: 1.2,
            },
          },
        }}
        className="projects-coverflow-swiper"
      >
        {items.map((project) => (
          <SwiperSlide key={project.id} className="!flex !h-auto">
            <ProjectCard
              project={project}
              variant="full"
              carousel
              className="project-carousel-shell w-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="projects-coverflow-pagination" />
    </section>
  );
}
