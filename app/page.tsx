const features = [
  {
    icon: "🏠",
    title: "Room Management",
    description:
      "Manage hostel rooms, occupancy, availability and student allocations efficiently.",
  },
  {
    icon: "💳",
    title: "Fee Management",
    description:
      "Track hostel fees, payment status, pending payments and transaction history.",
  },
  {
    icon: "📝",
    title: "Complaint Management",
    description:
      "Students can submit complaints and track their resolution status online.",
  },
  {
    icon: "📋",
    title: "Leave Management",
    description:
      "Submit, approve and monitor student leave applications digitally.",
  },
  {
    icon: "📢",
    title: "Notice Board",
    description:
      "Share important hostel announcements and notices with students instantly.",
  },
  {
    icon: "📊",
    title: "Reports & Dashboard",
    description:
      "Get useful hostel statistics and reports from a centralized dashboard.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl">
              🏠
            </div>

            <div>
              <h1 className="text-lg font-bold">HostelHub</h1>
              <p className="text-xs text-slate-400">
                Hostel Management System
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm text-white">
              Home
            </a>
            <a
              href="#features"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              About
            </a>

            <a
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Smart &amp; Simple Hostel Administration
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Manage Your Hostel
            <span className="block text-blue-500">Smarter &amp; Faster</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A centralized platform for managing students, rooms, fees,
            complaints, leave applications, notices and everyday hostel
            operations.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/login"
              className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold transition hover:bg-blue-500"
            >
              Student Login →
            </a>

            <a
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold transition hover:bg-white/10"
            >
              Admin Login
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
              Features
            </p>

            <h3 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything in one place
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Our system brings the most important hostel activities together
              into one easy-to-use platform.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  {feature.icon}
                </div>

                <h4 className="text-lg font-bold">{feature.title}</h4>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
            About the System
          </p>

          <h3 className="mt-3 text-3xl font-bold">
            A better way to manage hostel operations
          </h3>

          <p className="mt-6 leading-8 text-slate-400">
            The Smart Hostel Management System is designed to reduce manual
            paperwork, minimize errors, improve transparency and make
            communication between students and hostel administration easier.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© 2026 HostelHub, Hostel Management System</p>
          

          <p>Amity University Kolkata</p>
        </div>
      </footer>
    </main>
  );
}