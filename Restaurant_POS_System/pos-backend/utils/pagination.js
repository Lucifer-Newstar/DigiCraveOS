const parsePagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationMeta = ({ page, limit, total }) => ({ page, limit, total, pages: Math.ceil(total / limit) });

module.exports = { parsePagination, paginationMeta };
