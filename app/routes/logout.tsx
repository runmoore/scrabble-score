import type { ActionFunction, LoaderFunction } from "react-router";
import { redirect } from "react-router";

import { logout } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
