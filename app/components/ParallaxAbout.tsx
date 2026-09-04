"use client";

import { useRef, useCallback } from "react";

export default function ParallaxAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!imgRef.current || !sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();

    // Normalized -1 to 1 from center of section
    const xRatio = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yRatio = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // 3D rotation — rotateY for left/right, rotateX for up/down (inverted)
    const rotateY = xRatio * 12;   // max 12 degrees
    const rotateX = yRatio * -12;  // max 12 degrees (inverted for natural feel)

    // Subtle translate for depth parallax
    const moveX = xRatio * -15;
    const moveY = yRatio * -15;

    imgRef.current.style.transform =
      `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px) scale(1.12)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!imgRef.current) return;
    imgRef.current.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) translate(0px, 0px) scale(1.12)";
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="section-divider absolute top-0 left-6 right-6 z-20" />
      
      {/* Background Image — 3D tilt on cursor */}
      <img
        ref={imgRef}
        src="/about-students.jpg?v=2"
        alt="Students in hostel common room"
        className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
        style={{
          transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate(0px, 0px) scale(1.12)",
          transition: "transform 0.2s ease-out",
          transformOrigin: "center center",
        }}
      />

      {/* Dark overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Subtle background orb */}
      <div className="orb orb-indigo w-[400px] h-[400px] top-1/2 -left-40 -translate-y-1/2 opacity-30 z-10" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 w-full">
        <div className="max-w-3xl">
          <p className="animate-slide-in-right text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 drop-shadow-md">
            About the System
          </p>

          <h3 className="animate-slide-in-right mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
            A better way to manage{" "}
            <span className="gradient-text-hero block mt-1">hostel operations</span>
          </h3>

          <p className="animate-slide-in-right mt-6 max-w-xl text-lg leading-8 text-slate-200 drop-shadow-md">
            The Smart Hostel Management System is designed to reduce manual
            paperwork, minimize errors, improve transparency and make
            communication between students and hostel administration easier.
          </p>

          <div className="animate-slide-in-right mt-10 grid grid-cols-2 gap-6 sm:max-w-xl">
            {[
              { icon: "✓", text: "Digital Records" },
              { icon: "✓", text: "Instant Notices" },
              { icon: "✓", text: "Easy Fee Tracking" },
              { icon: "✓", text: "Quick Complaints" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-4 text-base font-medium text-white drop-shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm text-blue-300 font-bold backdrop-blur-sm border border-blue-400/30">
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
