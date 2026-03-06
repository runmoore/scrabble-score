import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom";
import { URL as NodeURL } from "node:url";

installGlobals();

// happy-dom overrides URL with an implementation missing searchParams.
// Restore Node's native URL so loader tests can parse search params.
globalThis.URL = NodeURL as unknown as typeof globalThis.URL;
