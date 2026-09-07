# Reservation Pagination

The reservations API accepts bounded `page` and `limit` query parameters and preserves its reservation array in `data` while adding pagination metadata. The Reservations page requests 25 rows per page and exposes Previous/Next controls.

Verification included the reservation pagination integration test, frontend ESLint, and the Vite production build.
