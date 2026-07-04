import { Request, Response } from "express";
import {
  getFavourites,
  toggleFavourite,
} from "../controllers/favouriteController";
import { prismaMock } from "../__mocks__/prisma";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Helper to create a mock Request
const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  header: jest.fn(),
  body: {},
  ...overrides,
});

// Helper to create a mock Response
const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getFavourites", () => {
  it("returns 400 when x-anon-id header is missing", async () => {
    const req = mockRequest({
      header: jest.fn().mockReturnValue(null),
    });
    const res = mockResponse();

    await getFavourites(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "x-anon-id header required",
    });
  });

  it("returns favourites for a valid anonId", async () => {
    const req = mockRequest({
      header: jest.fn().mockReturnValue("anon-session-001"),
    });
    const res = mockResponse();

    // Tell the mock what prisma.favourite.findMany should return
    prismaMock.favourite.findMany.mockResolvedValue([
      {
        id: "fav-1",
        anonId: "anon-session-001",
        urlId: "url-1",
        createdAt: new Date(),
        url: { url: "https://google.com" },
      } as any,
    ]);

    await getFavourites(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      favourites: ["https://google.com"],
    });
  });

  it("returns 500 when prisma throws an error", async () => {
    const req = mockRequest({
      header: jest.fn().mockReturnValue("anon-session-001"),
    });
    const res = mockResponse();

    prismaMock.favourite.findMany.mockRejectedValue(new Error("DB error"));

    await getFavourites(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error retrieving favourites",
    });
  });
});
