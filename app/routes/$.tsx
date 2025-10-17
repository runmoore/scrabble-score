import type { LoaderFunctionArgs } from "@remix-run/node";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Silently handle Chrome DevTools requests
  if (url.pathname.includes(".well-known") && url.pathname.includes("chrome.devtools")) {
    return new Response(null, { status: 204 });
  }

  // For other unmatched routes, return 404
  throw new Response("Not Found", { status: 404 });
}
