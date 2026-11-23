// Route tests call loaders and actions directly. With Single Fetch those return
// plain values, `data(value, init)` (a DataWithResponseInit), or a real Response
// (redirect). These helpers read all three the same way.

type DataWithInit = {
  type: "DataWithResponseInit";
  data: unknown;
  init: ResponseInit | null;
};

function isDataWithInit(result: unknown): result is DataWithInit {
  return (
    typeof result === "object" &&
    result !== null &&
    (result as { type?: unknown }).type === "DataWithResponseInit"
  );
}

function isResponse(result: unknown): result is Response {
  return (
    typeof result === "object" &&
    result !== null &&
    typeof (result as Response).status === "number" &&
    typeof (result as Response).headers?.get === "function"
  );
}

// Remix types DataWithResponseInit.type as `string`, so match on its structure.
type Unwrapped<R> = R extends { data: infer D; init: ResponseInit | null }
  ? D
  : R extends Response
  ? never
  : R;

/** The data a loader or action returned: unwraps `data(...)`, passes plain values through. */
export function dataOf<R>(result: R): Unwrapped<R> {
  if (isResponse(result)) {
    throw new Error(
      `Expected data but got a Response (status ${result.status}); use responseOf() for redirects.`
    );
  }
  return (isDataWithInit(result) ? result.data : result) as Unwrapped<R>;
}

/** The HTTP status the result would be sent with: 200 unless `data()` or a Response says otherwise. */
export function statusOf(result: unknown): number {
  if (isResponse(result)) return result.status;
  if (isDataWithInit(result)) return result.init?.status ?? 200;
  return 200;
}

/** The result as a Response (for redirects); fails the test if it is not one. */
export function responseOf(result: unknown): Response {
  if (!isResponse(result)) {
    throw new Error("Expected a Response (for example a redirect), got data.");
  }
  return result;
}
