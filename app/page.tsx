import ParallaxHero from "./components/ParallaxHero";
import ParallaxAbout from "./components/ParallaxAbout";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 21V6.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75V21m3-18h5.25a.75.75 0 0 1 .75.75v17.25M9 9h.008M9 12h.008M9 15h.008M15 9h.008M15 12h.008M15 15h.008" />
      </svg>
    ),
    title: "Room Management",
    description:
      "Manage hostel rooms, occupancy, availability and student allocations efficiently.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "group-hover:border-blue-500/40",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
    title: "Fee Management",
    description:
      "Track hostel fees, payment status, pending payments and transaction history.",
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "group-hover:border-emerald-500/40",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
    title: "Complaint Management",
    description:
      "Students can submit complaints and track their resolution status online.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "group-hover:border-amber-500/40",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M2.25 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h15a2.25 2.25 0 0 1 2.25 2.25v11.25m-19.5 0A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0h19.5" />
      </svg>
    ),
    title: "Leave Management",
    description:
      "Submit, approve and monitor student leave applications digitally.",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "group-hover:border-violet-500/40",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.527.527 0 0 1-.611-.056 16.153 16.153 0 0 1-4.332-5.958.527.527 0 0 1 0-.397 16.15 16.15 0 0 1 4.332-5.958.527.527 0 0 1 .611-.056l.657.38c.523.302.71.962.463 1.511a12.27 12.27 0 0 0-.985 2.783m0 0a20.613 20.613 0 0 0 0 4.08m7.494-10.743A15.7 15.7 0 0 1 20.25 12a15.7 15.7 0 0 1-2.416 3.663m0 0a.527.527 0 0 1-.764.07 12.106 12.106 0 0 0-4.136-2.278.524.524 0 0 1-.317-.659" />
      </svg>
    ),
    title: "Notice Board",
    description:
      "Share important hostel announcements and notices with students instantly.",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "group-hover:border-rose-500/40",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "Reports & Dashboard",
    description:
      "Get useful hostel statistics and reports from a centralized dashboard.",
    color: "from-cyan-500/20 to-teal-500/20",
    borderColor: "group-hover:border-cyan-500/40",
  },
];

const stats = [
  { label: "Students Managed", value: "500+" },
  { label: "Rooms Available", value: "150+" },
  { label: "Digital Complaints", value: "1K+" },
  { label: "Uptime", value: "99.9%" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-hidden">

      {/* ──── Navbar ──── */}

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-2xl border border-white/10 bg-[#030712]/40 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold shadow-lg shadow-blue-500/20">
              H
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">HostelHub</h1>
              <p className="text-[11px] text-slate-400 tracking-wide">
                Management System
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-medium text-white transition hover:text-blue-400">
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              About
            </a>

            <a
              href="/login"
              className="btn-gradient rounded-xl px-6 py-2.5 text-sm"
            >
              Login →
            </a>
          </div>

          {/* Mobile Login */}
          <a
            href="/login"
            className="btn-gradient rounded-xl px-5 py-2.5 text-sm md:hidden"
          >
            Login
          </a>
        </div>
      </nav>

      {/* ──── Hero ──── */}
      <ParallaxHero />

      {/* ──── Stats Row ──── */}

      <section className="relative z-10 px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card rounded-2xl p-1">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-fade-in-up px-6 py-6 text-center`}
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <p className="text-2xl font-bold gradient-text md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 md:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features ──── */}

      <section id="features" className="relative px-6 py-20 md:py-24">
        <div className="section-divider absolute top-0 left-6 right-6" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Features
            </p>

            <h3 className="animate-fade-in-up animate-delay-1 mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Everything in{" "}
              <span className="gradient-text">one place</span>
            </h3>

            <p className="animate-fade-in-up animate-delay-2 mx-auto mt-4 max-w-2xl text-slate-400">
              Our system brings the most important hostel activities together
              into one easy-to-use platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group glass-card-hover animate-fade-in-up rounded-2xl p-7`}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-blue-400 transition group-hover:scale-110`}>
                  {feature.icon}
                </div>

                <h4 className="text-lg font-bold">{feature.title}</h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="mt-4 text-xs font-medium text-slate-500 transition group-hover:text-blue-400">
                  Learn more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── About ──── */}

      <ParallaxAbout />

      {/* ──── Footer ──── */}

      <footer className="relative px-6 py-10">
        <div className="section-divider absolute top-0 left-6 right-6" />

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              H
            </div>
            <p>© 2026 HostelHub, Hostel Management System</p>
          </div>
          <p className="text-slate-600">Amity University Kolkata</p>
        </div>
      </footer>
    </main>
  );
}
