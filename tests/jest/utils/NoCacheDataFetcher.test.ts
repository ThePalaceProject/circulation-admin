// Need to manually mock DataFetcher before importing NoCacheDataFetcher
const mockSuperFetch = jest.fn();

// Mock the DataFetcher module
jest.mock("@thepalaceproject/web-opds-client/lib/DataFetcher", () => ({
  __esModule: true,
  default: class MockDataFetcher {
    fetch(url: string, options?: any) {
      return mockSuperFetch(url, options);
    }
  },
}));

// Import after mocking
import NoCacheDataFetcher from "../../../src/utils/NoCacheDataFetcher";

const TEST_URL = "http://example.com";

describe("NoCacheDataFetcher", () => {
  let fetcher: NoCacheDataFetcher;

  beforeEach(() => {
    // Clear mocks between tests
    mockSuperFetch.mockClear();

    // Create instance of class under test
    fetcher = new NoCacheDataFetcher();
  });

  it("adds no-cache headers to fetch requests", async () => {
    await fetcher.fetch(TEST_URL);

    expect(mockSuperFetch).toHaveBeenCalledWith(
      TEST_URL,
      expect.objectContaining({
        headers: { "Cache-Control": "no-cache" },
        cache: "no-cache",
      })
    );
  });

  it("preserves existing headers when adding no-cache headers", async () => {
    const options = {
      headers: { "Content-Type": "application/json" },
    };

    await fetcher.fetch(TEST_URL, options);

    expect(mockSuperFetch).toHaveBeenCalledWith(
      TEST_URL,
      expect.objectContaining({
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      })
    );
  });

  it("passes through other options to super.fetch", async () => {
    await fetcher.fetch(TEST_URL, {
      credentials: "include",
    });

    expect(mockSuperFetch).toHaveBeenCalledWith(
      TEST_URL,
      expect.objectContaining({
        headers: { "Cache-Control": "no-cache" },
        cache: "no-cache",
        credentials: "include",
      })
    );
  });
});
