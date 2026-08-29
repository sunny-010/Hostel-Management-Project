export default function MaintenancePage() {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/10 text-4xl">
            🛠️
          </div>
  
          <p className="mt-8 text-sm font-medium tracking-widest text-blue-400">
            HOSTELHUB
          </p>
  
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            System Under Maintenance
          </h1>
  
          <p className="mx-auto mt-5 max-w-md text-slate-400">
            HostelHub is temporarily unavailable while
            system maintenance is being performed.
            Please try again later.
          </p>
  
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              Maintenance Mode Active
            </div>
          </div>
  
          <p className="mt-8 text-xs text-slate-600">
            Hostel Management System
          </p>
        </div>
      </main>
    );
  }