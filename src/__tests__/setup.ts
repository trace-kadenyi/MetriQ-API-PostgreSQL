import { prismaMock } from "../__mocks__/prisma";

jest.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));
