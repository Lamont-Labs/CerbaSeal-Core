import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/assess", label: "Readiness" },
  { href: "/pilot", label: "Pilot Generator" },
  { href: "/troubleshoot", label: "Troubleshooter" },
  { href: "/training", label: "Training" },
  { href: "/partner", label: "Partner Kit" },
  { href: "/wizard", label: "Wizard" },
];

export function Nav() {
  const [loc] = useLocation();
  return (
    <nav className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-14">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-white text-sm tracking-wide">CerbaSeal</span>
          <span className="text-slate-500 text-xs font-medium">Client Success</span>
        </Link>
        {links.map(({ href, label }) => {
          const active = href === "/" ? loc === "/" : loc.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                active ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
