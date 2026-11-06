import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect, useState } from "react";

import BackButton from "~/components/BackButton";
import { getUser } from "./session.server";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: stylesheet },
    { rel: "apple-touch-icon", href: "/icon.png" },
  ];
};

export const meta: MetaFunction = () => [
  {
    title: "Scrabble score",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    user: await getUser(request),
  });
};

export default function App() {
  // Exposed via data-hydrated below so e2e tests can wait for hydration
  // instead of guessing a fixed delay.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <html lang="en" className="h-full bg-white dark:bg-gray-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <Meta />
        <Links />
        <link rel="manifest" href="/manifest.json"></link>
      </head>
      <body
        className="h-full bg-white dark:bg-gray-900"
        data-hydrated={isHydrated ? "true" : undefined}
      >
        <Outlet />
        <BackButton />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
