import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "@remix-run/react";

import BackArrowIcon from "~/icons/back-arrow";

const PLAY_ROUTE_PATTERN = /^\/games\/.+\/play\/.+/;

export default function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationCount, setNavigationCount] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setNavigationCount((prev) => prev + 1);
  }, [location]);

  if (!location.pathname.startsWith("/games")) return null;
  if (PLAY_ROUTE_PATTERN.test(location.pathname)) return null;

  const canGoBack = navigationCount > 0;

  return (
    <button
      type="button"
      aria-label="Go back"
      disabled={!canGoBack}
      onClick={() => navigate(-1)}
      className="fixed bottom-6 left-4 z-10 rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-600 disabled:bg-blue-100 dark:bg-blue-700 dark:hover:bg-blue-600 sm:hidden"
    >
      <BackArrowIcon />
    </button>
  );
}
