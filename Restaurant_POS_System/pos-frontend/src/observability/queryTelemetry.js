const getQueryKey = (query) => (query?.queryKey || []).map((part) => String(part)).join("/").slice(0, 200);

export const reportQueryError = ({ query, error }) => {
  const payload = {
    type: "query_error",
    queryKey: getQueryKey(query),
    status: error?.response?.status || null,
    message: String(error?.message || "Query failed").slice(0, 200),
    occurredAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("pos:query-error", { detail: payload }));
  if (import.meta.env?.DEV) console.warn("Query telemetry", payload);
};
