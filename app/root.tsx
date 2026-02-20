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
        className="h-full select-none bg-white dark:bg-gray-900"
        style={{
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
