import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext"; // Should be implemented for web
import { useStockContext } from "@/context/StockContext";
import ExplorePackageCard from "@/components/home/ExplorePackageCard";
import TradeCard from "@/components/home/TradeCard";
// import your Notification helper/hooks for web if you have them

function shimmerStyle(animVal) {
  // For web, you'd use CSS keyframe shimmer
  return { background: "#eee" };
}

function HomeScreen() {
  const userContext = useUser();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { packages } = useStockContext();
  const navigate = useNavigate();

  // IDs from original
  const explorePackagesId = ["5", "3", "10", "9"];
  const bestTradesId = ["2", "4", "11", "9"];

  const explorePackages = packages.filter((pkg) =>
    explorePackagesId.includes(pkg.package_id)
  );
  const bestTrades = packages.filter((pkg) =>
    bestTradesId.includes(pkg.package_id)
  );

  // On mount, e.g., set up web push notifications if desired
  useEffect(() => {
    // For web, implement or skip depending on stack.
  }, []);

  useEffect(() => {
    if (userContext.isInitializing) return; // Wait for auth

    if (!userContext.isLoggedIn) {
      navigate("/otp", { replace: true });
    }
  }, [userContext.isLoggedIn, userContext.isInitializing, navigate]);

  if (userContext.isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="px-6 py-4 shadow bg-white flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div>User: {userContext.userDetails?.username}</div>
      </header>

      {/* CONTENT */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        {/* Example: Explore Packages */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Explore Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explorePackages.map((pkg) => (
              <ExplorePackageCard key={pkg.package_id} pkg={pkg} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Best Trades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestTrades.map((pkg) => (
              <TradeCard key={pkg.package_id} pkg={pkg} />
            ))}
          </div>
        </section>
      </main>

      {/* Modal/Popup Example */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded shadow-xl">
            <div>Popup Modal Example</div>
            <button className="mt-4 btn" onClick={() => setIsPopupVisible(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
