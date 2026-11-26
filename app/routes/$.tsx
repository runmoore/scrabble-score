import type { LoaderFunctionArgs } from "react-router";

export function loader({ url }: LoaderFunctionArgs) {
  // Silently handle Chrome DevTools requests
  if (
    url.pathname.includes(".well-known") &&
    url.pathname.includes("chrome.devtools")
  ) {
    return new Response(null, { status: 204 });
  }

  // For other unmatched routes, return 404
  throw new Response("Not Found", { status: 404 });
}
