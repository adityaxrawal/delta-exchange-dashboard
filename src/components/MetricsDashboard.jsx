import KPICard from "./KPICard";

export default function MetricsDashboard({ kpis = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
      <KPICard
        title="Total Net P&L (USD)"
        value={kpis.total_net_pnl?.toFixed?.(2) || "0.00"}
      />
      <KPICard
        title="Total Volume (BTC)"
        value={kpis.total_volume_btc?.toFixed?.(4) || "0.0000"}
      />
      <KPICard title="Number of Trades" value={kpis.num_trades || 0} />
      <KPICard
        title="Win Rate"
        value={kpis.win_rate_pct?.toFixed?.(2) ? kpis.win_rate_pct?.toFixed?.(2) + "%" : "0%"}
      />
      <KPICard
        title="Avg Win / Avg Loss"
        value={kpis.avg_win_loss_ratio?.toFixed?.(2) || "—"}
      />
      <KPICard
        title="Total Fees (USD)"
        value={kpis.total_fees?.toFixed?.(2) || "0.00"}
      />
    </div>
  );
}
