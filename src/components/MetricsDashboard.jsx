import KPICard from "./KPICard";

export default function MetricsDashboard({ kpis = {} }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBTC = (value) => {
    if (!value && value !== 0) return "0.0000 BTC";
    return `${value.toFixed(4)} BTC`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <KPICard
        title="Total Net P&L"
        value={formatCurrency(kpis.total_net_pnl)}
        hint={kpis.total_net_pnl > 0 ? "Total profit" : "Total loss"}
        type={kpis.total_net_pnl > 0 ? "profit" : "loss"}
      />
      <KPICard
        title="Trading Volume"
        value={formatBTC(kpis.total_volume_btc)}
        hint="Total BTC traded"
      />
      <KPICard
        title="Number of Trades"
        value={kpis.num_trades?.toLocaleString() || "0"}
        hint="Total trades executed"
      />
      <KPICard
        title="Win Rate"
        value={
          kpis.win_rate_pct?.toFixed?.(1)
            ? `${kpis.win_rate_pct.toFixed(1)}%`
            : "0%"
        }
        hint={`${kpis.wins || 0} wins / ${kpis.num_trades || 0} trades`}
        type={kpis.win_rate_pct > 50 ? "profit" : "loss"}
      />
      <KPICard
        title="Win/Loss Ratio"
        value={kpis.avg_win_loss_ratio?.toFixed?.(2) || "—"}
        hint="Average win / Average loss"
        type={
          kpis.avg_win_loss_ratio > 1
            ? "profit"
            : kpis.avg_win_loss_ratio < 1
            ? "loss"
            : "default"
        }
      />
      <KPICard
        title="Total Fees"
        value={formatCurrency(kpis.total_fees)}
        hint="Trading fees paid"
      />
    </div>
  );
}
