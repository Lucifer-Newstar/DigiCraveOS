const { parsePagination, paginationMeta } = require("../../Restaurant_POS_System/pos-backend/utils/pagination");

describe("Phase 6 pagination contract", () => {
  test("normalizes pages and caps page size", () => {
    expect(parsePagination({ page: "0", limit: "500" })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(parsePagination({ page: "3", limit: "10" })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  test("calculates stable pagination metadata", () => {
    expect(paginationMeta({ page: 2, limit: 25, total: 51 })).toEqual({ page: 2, limit: 25, total: 51, pages: 3 });
  });
});
