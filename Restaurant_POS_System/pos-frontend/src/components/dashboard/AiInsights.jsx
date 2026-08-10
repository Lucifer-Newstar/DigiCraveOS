import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  getSalesForecast,
  getDishDemand,
  getDishRecommendations,
} from "../../https";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Small dependency-free SVG line chart for the revenue history + forecast.
const ForecastChart = ({ history, forecast }) => {
  const points = useMemo(() => {
    const hist = (history || []).slice(-21).map((d) => ({
      date: d.date,
      value: d.revenue,
      kind: "history",
    }));
    const fc = (forecast || []).map((d) => ({
      date: d.date,
      value: d.predicted_revenue,
      kind: "forecast",
    }));
    return [...hist, ...fc];
  }, [history, forecast]);

  if (points.length < 2) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
        Not enough data to draw a chart yet.
      </div>
    );
  }

  const W = 720;
  const H = 220;
  const pad = { l: 44, r: 12, t: 12, b: 22 };
  const values = points.map((p) => p.value);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);
  const span = maxV - minV || 1;

  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - minV) / span);

  const histPts = points.filter((p) => p.kind === "history");
  const line = (arr, offset = 0) =>
    arr.map((p, i) => `${x(i + offset)},${y(p.value)}`).join(" ");

  const splitIdx = histPts.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad.t + (H - pad.t - pad.b) * t;
        const val = maxV - span * t;
        return (
          <g key={i}>
            <line x1={pad.l} y1={gy} x2={W - pad.r} y2={gy} stroke="#e2e8f0" strokeWidth="1" />
            <text x={4} y={gy + 3} fontSize="9" fill="#94a3b8">
              {inr(val)}
            </text>
          </g>
        );
      })}
      {/* history line */}
      <polyline
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        points={line(histPts)}
      />
      {/* forecast line (dashed), connected to last history point */}
      <polyline
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeDasharray="5 4"
        points={
          (splitIdx >= 0 ? `${x(splitIdx)},${y(histPts[splitIdx].value)} ` : "") +
          points
            .filter((p) => p.kind === "forecast")
            .map((p, i) => `${x(splitIdx + 1 + i)},${y(p.value)}`)
            .join(" ")
        }
      />
      {/* forecast points */}
      {points.map((p, i) =>
        p.kind === "forecast" ? (
          <circle key={i} cx={x(i)} cy={y(p.value)} r="3" fill="#6366f1" />
        ) : null
      )}
    </svg>
  );
};

const SectionTitle = ({ title, subtitle }) => (
  <div>
    <h2 className="pos-title">{title}</h2>
    {subtitle && <p className="pos-subtitle">{subtitle}</p>}
  </div>
);

const AiInsights = () => {
  // --- Forecast ---
  const {
    data: fcRes,
    isLoading: fcLoading,
    isError: fcError,
  } = useQuery({ queryKey: ["ml-forecast"], queryFn: () => getSalesForecast(7) });
  const fc = fcRes?.data || {};

  // --- Demand ---
  const {
    data: dmRes,
    isLoading: dmLoading,
  } = useQuery({ queryKey: ["ml-demand"], queryFn: () => getDishDemand({ top: 10 }) });
  const dm = dmRes?.data || {};

  const forecastTotal = (fc.forecast || []).reduce(
    (s, d) => s + (d.predicted_revenue || 0),
    0
  );

  // --- Recommender (interactive) ---
  const [cart, setCart] = useState(["Butter Chicken"]);
  const [recs, setRecs] = useState([]);
  const [recBasis, setRecBasis] = useState(null);

  const dishChoices = (dm.predictions || []).map((p) => p.dish);

  const recMutation = useMutation({
    mutationFn: (items) => getDishRecommendations(items, 5),
    onSuccess: (res) => {
      setRecs(res?.data?.recommendations || []);
      setRecBasis(res?.data?.basis || null);
    },
    onError: () =>
      enqueueSnackbar("Could not fetch recommendations.", { variant: "error" }),
  });

  const toggleDish = (dish) => {
    const next = cart.includes(dish)
      ? cart.filter((d) => d !== dish)
      : [...cart, dish];
    setCart(next);
  };

  const runRecommend = () => recMutation.mutate(cart);

  if (fcError) {
    return (
      <div className="pos-card p-6">
        <p className="text-rose-600 font-semibold">AI service unavailable.</p>
        <p className="text-slate-500 text-sm mt-1">
          Make sure the <code>Restaurant_POS_ML</code> service is running and
          that <code>ML_SERVICE_URL</code> is set in the backend&nbsp;.env.
        </p>
      </div>
    );
  }

  const maxDemand = Math.max(
    1,
    ...(dm.predictions || []).map((p) => p.predicted_quantity_exact || 0)
  );

  return (
    <div className="container mx-auto space-y-10">
      {/* ---------------- Sales Forecast ---------------- */}
      <section>
        <SectionTitle
          title="Sales Forecast"
          subtitle="Predicted revenue & orders for the next 7 days, learned from your order history."
        />

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="pos-card p-5">
            <p className="text-sm font-medium text-slate-500">
              Projected 7-day revenue
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {fcLoading ? "…" : inr(forecastTotal)}
            </p>
          </div>
          <div className="pos-card p-5">
            <p className="text-sm font-medium text-slate-500">Days of history</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {fcLoading ? "…" : fc.days_of_history ?? 0}
            </p>
          </div>
          <div className="pos-card p-5">
            <p className="text-sm font-medium text-slate-500">Model</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">
              {fcLoading ? "…" : (fc.method || "—").replace(/-/g, " ")}
            </p>
            {typeof fc.fit_r2 === "number" && (
              <p className="text-xs text-slate-400 mt-1">Fit R² {fc.fit_r2}</p>
            )}
          </div>
        </div>

        <div className="pos-card p-5 mt-4">
          <div className="flex items-center gap-4 mb-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-4 rounded bg-emerald-500 inline-block" />
              History
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-4 rounded bg-indigo-500 inline-block" />
              Forecast
            </span>
          </div>
          {fcLoading ? (
            <div className="h-56 flex items-center justify-center text-slate-400">
              Loading…
            </div>
          ) : (
            <ForecastChart history={fc.history} forecast={fc.forecast} />
          )}
        </div>

        {!fcLoading && (fc.forecast || []).length > 0 && (
          <div className="mt-4 overflow-x-auto pos-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Predicted revenue</th>
                  <th className="p-3 font-medium">Predicted orders</th>
                </tr>
              </thead>
              <tbody>
                {fc.forecast.map((d) => (
                  <tr key={d.date} className="border-b border-slate-50">
                    <td className="p-3 text-slate-700">{d.date}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {inr(d.predicted_revenue)}
                    </td>
                    <td className="p-3 text-slate-700">{d.predicted_orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------------- Dish Demand ---------------- */}
      <section>
        <SectionTitle
          title="Dish Demand Prediction"
          subtitle={
            dm.target_date
              ? `Expected quantities for ${dm.weekday}, ${dm.target_date} — use it for prep planning.`
              : "Expected quantities per dish for the next service day."
          }
        />
        <div className="pos-card p-5 mt-5">
          {dmLoading ? (
            <div className="text-slate-400">Loading…</div>
          ) : (dm.predictions || []).length === 0 ? (
            <div className="text-slate-400">No dish history yet.</div>
          ) : (
            <ul className="space-y-3">
              {dm.predictions.map((p) => (
                <li key={p.dish} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm font-medium text-slate-700 truncate">
                    {p.dish}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      style={{
                        width: `${(p.predicted_quantity_exact / maxDemand) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-slate-900">
                    {p.predicted_quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------------- Recommender ---------------- */}
      <section>
        <SectionTitle
          title="Dish Recommendations"
          subtitle="Pick what's in the order and get dishes frequently bought together (market-basket analysis)."
        />

        <div className="pos-card p-5 mt-5">
          <p className="text-sm font-medium text-slate-500 mb-2">
            Items in the order
          </p>
          <div className="flex flex-wrap gap-2">
            {(dishChoices.length ? dishChoices : cart).map((dish) => {
              const active = cart.includes(dish);
              return (
                <button
                  key={dish}
                  onClick={() => toggleDish(dish)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  {dish}
                </button>
              );
            })}
          </div>

          <button
            onClick={runRecommend}
            disabled={cart.length === 0 || recMutation.isPending}
            className="pos-btn mt-4 disabled:opacity-50"
          >
            {recMutation.isPending ? "Analyzing…" : "Get recommendations"}
          </button>

          {recs.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Suggested add-ons {recBasis ? `· ${recBasis}` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recs.map((r) => (
                  <div
                    key={r.name}
                    className="rounded-xl border border-slate-100 p-4 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {r.basis}
                      </span>
                    </div>
                    {r.reasons && r.reasons.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Often ordered with{" "}
                        <span className="font-medium text-slate-700">
                          {r.reasons[0].with}
                        </span>{" "}
                        (lift {r.reasons[0].lift}×)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AiInsights;
