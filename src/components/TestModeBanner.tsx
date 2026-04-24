import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/supplier-dashboard", label: "Supplier Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/monthly-history", label: "Monthly History" },
  { to: "/supplier-details", label: "Supplier Details" },
  { to: "/login", label: "Login" },
];

export const TestModeBanner = () => {
  const location = useLocation();

  return (
    <div className="w-full bg-yellow-300 text-yellow-950 border-b border-yellow-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-semibold">⚠️ Modo de teste — autenticação desabilitada</span>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 ml-auto">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`hover:underline ${active ? "font-bold underline" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TestModeBanner;
