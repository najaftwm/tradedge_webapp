import { useState } from "react";
import { Home, TrendingUp, Crown, Compass, Speech, User } from "lucide-react"; // Or use @tabler/icons-react, @heroicons, etc.

const tabs = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/stocks", label: "Stocks", icon: TrendingUp },
  { path: "/trades", label: "Trades", icon: Crown, labelClass: "text-yellow-500" },
  // Uncomment/replace as needed
  // { path: "/explore", label: "IPO", icon: Compass },
  { path: "/myPackages", label: "Packs", icon: Compass },
  { path: "/referral", label: "Refer", icon: Speech },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomTabs() {
  const [active, setActive] = useState("/home"); // Use router location in a real app

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-50 h-16 shadow">
      {tabs.map(({ path, label, icon: Icon, labelClass }) => (
        <button
          key={path}
          onClick={() => setActive(path)}
          className={`flex-1 flex flex-col items-center justify-center px-1 group transition
                      hover:bg-gray-100 focus:outline-none
                      ${active === path ? "text-blue-600 font-semibold" : "text-gray-500"}`}
        >
          <Icon size={24} className={`${active === path ? "stroke-2" : ""} mb-1`} />
          <span className={`text-xs font-medium ${labelClass || ""}`}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
