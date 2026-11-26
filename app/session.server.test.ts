vi.mock("~/models/user.server", () => ({
  getUserById: vi.fn(),
}));

describe("requireUserId", () => {
  beforeAll(() => {
    vi.stubEnv("SESSION_SECRET", "test-secret");
  });

  test("redirects to login with the page path, not the raw data request path", async () => {
    const { requireUserId } = await import("./session.server");
    const request = new Request("http://localhost/games/123.data");
    const url = new URL("http://localhost/games/123");

    const thrown = await requireUserId(request, url).catch((e) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect(thrown.status).toEqual(302);
    expect(thrown.headers.get("Location")).toEqual(
      "/login?redirectTo=%2Fgames%2F123"
    );
  });
});
