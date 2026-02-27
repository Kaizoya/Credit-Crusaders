import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-fintech-gradient px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-200">CreditWise</p>
              <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">Do more with your credit score</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-400">
                Track your score, understand your report, and get personalized insights that help you improve.
              </p>
            </div>
            <div className="hidden gap-3 md:flex">
              <Link
                to="/login"
                className="rounded-xl border border-stroke bg-panel/70 px-5 py-2 text-sm font-semibold text-white transition hover:border-blueGlow"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="rounded-xl bg-blueGlow px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blueGlow/30"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl p-6 shadow-glass">
            <h2 className="text-2xl font-semibold text-white">Your credit dashboard, simplified</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>View your latest score and risk band instantly.</li>
              <li>See what impacts your score and what to improve next.</li>
              <li>Track your progress month by month.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/sign-up"
                className="rounded-xl bg-blueGlow px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blueGlow/30"
              >
                Get your score
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-stroke bg-panel/70 px-5 py-2 text-sm font-semibold text-white transition hover:border-blueGlow"
              >
                View demo dashboard
              </Link>
            </div>
          </div>
          <div className="glass rounded-3xl p-6 shadow-glass">
            <h3 className="text-lg font-semibold text-white">What you can do</h3>
            <div className="mt-4 grid gap-3">
              {[
                "Credit score & report",
                "Score improvement insights",
                "Monthly history tracking",
                "Risk alerts & reminders",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-stroke bg-panel/60 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Credit report",
              body: "Fetch your bureau report by PAN and see your key risk factors at a glance.",
            },
            {
              title: "Score simulator",
              body: "Model how actions like paying down utilization can improve your score.",
            },
            {
              title: "Alerts",
              body: "Stay on top of important changes that impact your credit health.",
            },
          ].map((card) => (
            <div key={card.title} className="glass rounded-2xl p-5 shadow-glass">
              <h4 className="text-lg font-semibold text-white">{card.title}</h4>
              <p className="mt-2 text-sm text-slate-400">{card.body}</p>
            </div>
          ))}
        </section>

        <section className="glass rounded-3xl p-6 shadow-glass">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Get started in minutes</h3>
              <p className="mt-2 text-sm text-slate-400">Sign up, fetch your report, and head straight to your dashboard.</p>
            </div>
            <Link
              to="/sign-up"
              className="rounded-xl bg-blueGlow px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blueGlow/30"
            >
              Sign up free
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Landing;
