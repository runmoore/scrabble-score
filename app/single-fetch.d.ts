// Makes useLoaderData, useActionData and `typeof loader` utilities infer Single
// Fetch types (for example `Date` stays a `Date` instead of becoming a string).
// Keep this in step with `future.v3_singleFetch` in remix.config.js.
import "@remix-run/server-runtime";

declare module "@remix-run/server-runtime" {
  interface Future {
    v3_singleFetch: true;
  }
}
