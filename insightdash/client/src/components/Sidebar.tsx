import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  UploadCloud,
  ShieldCheck,
  DollarSign,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    to: "/",
    icon: BarChart3,
  },
  {
    label: "Cloud Billing Import",
    to: "#upload",
    icon: UploadCloud,
  },
  {
    label: "Infrastructure Analytics",
    to: "#datasets",
    icon: ShieldCheck,
  },
  {
    label: "Cost Intelligence",
    to: "#insights",
    icon: DollarSign,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-6">
        <div className="rounded-3xl bg-slate-950/95 border border-slate-800 p-6 shadow-xl text-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-800 p-3">
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Platform
              </p>
              <h2 className="text-lg font-semibold">Cloud Cost Intelligence</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Navigate imports, analytics, and alerts from a clean SaaS dashboard.
          </p>
        </div>

        <nav className="space-y-2 rounded-3xl bg-slate-900/95 border border-slate-800 p-4 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === "/" && location.pathname === "/";
            const linkClasses = isActive
              ? "flex items-center gap-3 rounded-2xl bg-slate-100/10 px-4 py-3 text-slate-100"
              : "flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 hover:bg-slate-100/10 hover:text-slate-100 transition-colors";

            return item.to.startsWith("#") ? (
              <a key={item.label} href={item.to} className={linkClasses}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ) : (
              <Link key={item.label} to={item.to} className={linkClasses}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl bg-white/5 border border-slate-800 p-5 text-slate-300 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">
            Focus areas
          </p>
          <ul className="space-y-3 text-sm leading-6">
            <li>Monitor cloud spend in real time</li>
            <li>Surface anomalous EC2 and S3 usage</li>
            <li>Keep cost risk alerts highly visible</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
