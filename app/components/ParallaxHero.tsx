"use client";

import { useRef, useCallback } from "react";

export default function ParallaxHero() {
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
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image — 3D tilt on cursor */}
      <img
        ref={imgRef}
        src="/hero-hostel.jpg?v=2"
        alt="Modern hostel building"
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

      {/* Floating orbs on top of image */}
      <div className="orb orb-blue w-[400px] h-[400px] -top-20 -left-20 opacity-40" />
      <div className="orb orb-indigo w-[300px] h-[300px] bottom-0 right-0 opacity-30" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 w-full">
        <div className="max-w-3xl">

          {/* Badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/20 px-5 py-2 text-sm text-blue-200 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Smart &amp; Simple Hostel Administration
          </div>

          {/* Heading */}
          <h2 className="animate-fade-in-up animate-delay-1 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] drop-shadow-lg">
            Manage Your Hostel{" "}
            <span className="gradient-text-hero block mt-1">
              Smarter &amp; Faster
            </span>
          </h2>

          {/* Description */}
          <p className="animate-fade-in-up animate-delay-2 mt-6 max-w-xl text-lg leading-8 text-slate-200 drop-shadow-md">
            A centralized platform for managing students, rooms, fees,
            complaints, leave applications, notices and everyday hostel
            operations.
          </p>

          {/* Login Options */}
          <div className="animate-fade-in-up animate-delay-3 mt-10 flex flex-wrap gap-4">
            <a
              href="/login?role=STUDENT"
              className="btn-gradient rounded-2xl px-8 py-4 text-base font-semibold shadow-xl"
            >
              🎓 Student Login →
            </a>

            <a
              href="/login?role=ADMIN"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/50 shadow-xl"
            >
              👨‍💼 Admin Login
            </a>

            <a
              href="/login?role=SUPERADMIN"
              className="rounded-2xl border border-indigo-400/40 bg-indigo-500/20 px-8 py-4 text-base font-semibold text-indigo-200 backdrop-blur-md transition hover:bg-indigo-500/30 hover:border-indigo-400/60 shadow-xl"
            >
              👑 Super Admin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
