# Kitchen Ticket Pagination

The KDS ticket endpoint now accepts bounded `page` and `limit` parameters after station grouping, preserving ticket arrays in `data` and adding pagination metadata. The Kitchen Display requests 25 tickets at a time and exposes navigation controls while retaining its ten-second refresh interval.

Verification included the kitchen pagination integration test, frontend ESLint, and the Vite production build.
