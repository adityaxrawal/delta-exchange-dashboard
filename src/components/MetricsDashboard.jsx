import KPICard from "./KPICard";
import { useCurrency } from "../context/CurrencyContext";

export default function MetricsDashboard({ kpis = {} }) {
  const { formatCurrency } = useCurrency();

  const formatINR = (value) => {
    if (!value && value !== 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBTC = (value) => {
    if (!value && value !== 0) return "0.0000 BTC";
    return `${value.toFixed(4)} BTC`;
  };

  // Calculate derived metrics
  const netProfitLoss = (kpis.final_balance || 0) - (kpis.initial_balance || 0);
  const roi =
    kpis.initial_balance > 0 ? (netProfitLoss / kpis.initial_balance) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 🎯 PRIMARY METRIC - Most Important */}
      <div className="grid grid-cols-1 gap-6">
        <KPICard
          title="💰 Current Wallet Balance"
          value={formatCurrency(kpis.final_balance)}
          isCurrency={true}
          rawValue={kpis.final_balance}
          hint={`Your actual balance after all ${
            kpis.num_trades || 0
          } trades, fees, and funding`}
          type={
            kpis.final_balance > kpis.initial_balance
              ? "profit"
              : kpis.final_balance < kpis.initial_balance
              ? "loss"
              : "default"
          }
        />
      </div>

      {/* Main Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Initial Deposit"
          value={formatCurrency(kpis.initial_balance)}
          isCurrency={true}
          rawValue={kpis.initial_balance}
          hint="Starting wallet balance from deposits"
        />
        <KPICard
          title="Total Net Change"
          value={formatCurrency(netProfitLoss)}
          isCurrency={true}
          rawValue={netProfitLoss}
          hint={`Change from ${formatCurrency(
            kpis.initial_balance
          )} to ${formatCurrency(kpis.final_balance)}`}
          type={
            netProfitLoss > 0
              ? "profit"
              : netProfitLoss < 0
              ? "loss"
              : "default"
          }
        />
        <KPICard
          title="ROI %"
          value={`${roi.toFixed(2)}%`}
          hint="Return on Investment"
          type={roi > 0 ? "profit" : roi < 0 ? "loss" : "default"}
        />
      </div>

      {/* Trading Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <KPICard
          title="Trade Cashflow"
          value={formatCurrency(kpis.total_net_pnl)}
          isCurrency={true}
          rawValue={kpis.total_net_pnl}
          hint={`${kpis.wins || 0}W / ${
            kpis.losses || 0
          }L (PnL from trades only, excluding fees)`}
          type={kpis.total_net_pnl > 0 ? "profit" : "loss"}
        />
        <KPICard
          title="Trading Fees"
          value={formatCurrency(kpis.total_fees)}
          isCurrency={true}
          rawValue={kpis.total_fees}
          hint={
            kpis.total_gst
              ? `Includes ${formatCurrency(Math.abs(kpis.total_gst))} GST`
              : "Trading fees paid"
          }
        />
        <KPICard
          title="Funding Payments"
          value={formatCurrency(kpis.total_funding || 0)}
          isCurrency={true}
          rawValue={kpis.total_funding || 0}
          hint={
            kpis.funding_count
              ? `${kpis.funding_count} payments`
              : "Net funding rate payments"
          }
          type={
            kpis.total_funding > 0
              ? "profit"
              : kpis.total_funding < 0
              ? "loss"
              : "default"
          }
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
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Number of Trades"
          value={kpis.num_trades?.toLocaleString() || "0"}
          hint="Total completed trades"
        />
        <KPICard
          title="Trading Volume"
          value={formatBTC(kpis.total_volume_btc)}
          hint="Total crypto volume traded"
        />
        <KPICard
          title="Average Win"
          value={formatCurrency(kpis.avg_win || 0)}
          isCurrency={true}
          rawValue={kpis.avg_win || 0}
          hint="Average profit per winning trade"
          type="profit"
        />
        <KPICard
          title="Average Loss"
          value={formatCurrency(kpis.avg_loss || 0)}
          isCurrency={true}
          rawValue={kpis.avg_loss || 0}
          hint="Average loss per losing trade"
          type="loss"
        />
      </div>
    </div>
  );
}
