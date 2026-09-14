# Pagination Contract Helper

Backend paginated listings now share `parsePagination` and `paginationMeta` utilities. Page numbers are at least one, limits default to 25 and cap at 100, and metadata consistently reports `page`, `limit`, `total`, and `pages`.

Inventory and customer controllers use the shared contract without changing their response shapes. The helper tests cover normalization, capping, skip calculation, and page-count calculation.
