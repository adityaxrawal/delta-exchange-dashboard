# ✨ Enhancement: Trade Count in Monthly Performance Chart

## Overview

Enhanced the Monthly Performance Chart to display the number of trades taken in each month, providing better context for the P&L performance.

## What Was Added

### 1. **Trade Count on Bars**

- Shows "X trade(s)" label directly on each bar
- Positioned above positive bars, below negative bars
- Uses subtle color (#ebdbb2) for readability

### 2. **Trade Count in Tooltip**

- Tooltip header now shows: "Month • X trade(s)"
- Example: "Jan 2024 • 15 trades"
- Proper pluralization (1 trade vs 2 trades)

### 3. **Data Tracking**

- Tracks both P&L and trade count per month
- Maintains chronological sorting
- Efficient single-pass aggregation

## Implementation Details

### Data Structure Change

**Before:**

```javascript
const monthlyPnL = {};
trades.forEach((t) => {
  const month = format(new Date(t.exitTime || t.entryTime), "MMM yyyy");
  monthlyPnL[month] = (monthlyPnL[month] || 0) + t.netPnl;
});
```

**After:**

```javascript
const monthlyData = {};
trades.forEach((t) => {
  const month = format(new Date(t.exitTime || t.entryTime), "MMM yyyy");
  if (!monthlyData[month]) {
    monthlyData[month] = { pnl: 0, trades: 0 };
  }
  monthlyData[month].pnl += t.netPnl;
  monthlyData[month].trades += 1; // ✨ NEW: Track trade count
});
```

### Custom Label Component

```javascript
const renderCustomLabel = (props) => {
  const { x, y, width, value, trades } = props;
  const isPositive = value >= 0;

  return (
    <text
      x={x + width / 2}
      y={isPositive ? y - 5 : y + 15} // Position based on bar direction
      fill="#ebdbb2"
      textAnchor="middle"
      fontSize="11"
      fontWeight="600"
    >
      {trades} trade{trades !== 1 ? "s" : ""}
    </text>
  );
};
```

### Enhanced Tooltip

```javascript
<Tooltip
  labelFormatter={(label) => {
    const monthData = data.find((d) => d.month === label);
    return `${label} • ${monthData?.trades || 0} trade${
      monthData?.trades !== 1 ? "s" : ""
    }`;
  }}
/>
```

## Visual Example

```
Monthly Performance Chart

    ┌─────────────────────────────────────────┐
    │              5 trades                    │  ← Label
    │   ┌───────────┐                         │
    │   │           │     8 trades             │
    │   │  $2,500   │  ┌──────────┐           │
$5K │   │           │  │          │           │
    │   │           │  │  $4,200  │           │
    │   └───────────┘  └──────────┘           │
────┼──────────────────────────────────────────┼───
    │                              ┌──────┐   │
    │                         3 trades    │   │
    │                              │-$800 │   │  ← Negative bar
    │                              └──────┘   │
    └─────────────────────────────────────────┘
      Jan 2024      Feb 2024      Mar 2024
```

## Benefits

### 📊 **Better Context**

- Understand if P&L is from many small trades or few large trades
- Identify months with high/low trading activity
- Spot patterns in trading frequency

### 📈 **Performance Analysis**

- Compare trade efficiency across months
- See if more trades = better performance
- Identify optimal trading frequency

### 🎯 **Quick Insights**

- Hover tooltip shows: "Jan 2024 • 15 trades"
- No need to count manually
- Immediate understanding of activity level

## Use Cases

### Example Insights:

1. **High P&L, Few Trades**

   - "Feb 2024: +$5,000 from 3 trades"
   - Interpretation: High quality trades, good risk/reward

2. **Low P&L, Many Trades**

   - "Mar 2024: +$500 from 50 trades"
   - Interpretation: Overtrading, small wins, high fees

3. **Negative P&L, Many Trades**

   - "Apr 2024: -$2,000 from 30 trades"
   - Interpretation: Poor strategy, should reduce frequency

4. **Positive P&L, Many Trades**
   - "May 2024: +$8,000 from 45 trades"
   - Interpretation: Consistent winning strategy

## Technical Details

### Data Flow

```
trades[]
  → Group by month
  → Count trades per month
  → Calculate P&L per month
  → Sort chronologically
  → Render with labels
```

### Label Positioning Logic

- **Positive bars**: Label above bar (`y - 5`)
- **Negative bars**: Label below bar (`y + 15`)
- **Centered**: `x + width / 2`

### Pluralization

```javascript
{trades} trade{trades !== 1 ? 's' : ''}
// Result: "1 trade" or "15 trades"
```

## Performance Impact

- **Minimal**: Single additional counter per month
- **No extra loops**: Trades counted during existing iteration
- **Efficient rendering**: Recharts handles label rendering natively

## Browser Compatibility

Works with all modern browsers supporting:

- SVG text elements ✅
- Recharts label props ✅
- Template strings ✅

## Future Enhancements (Optional)

Possible additions:

1. **Average P&L per trade**: Show `$X per trade` metric
2. **Win/Loss breakdown**: "15 trades (10W/5L)"
3. **Color-coded labels**: Green for profitable, red for losses
4. **Click to filter**: Click month to show only those trades
5. **Monthly statistics card**: Detailed breakdown on hover

## Testing

To verify the feature:

1. ✅ Load trade data with multiple months
2. ✅ Check each bar has trade count label
3. ✅ Hover over bar to see tooltip with trade count
4. ✅ Verify pluralization (1 trade vs multiple trades)
5. ✅ Check label positioning on positive vs negative bars

## Status

✅ **IMPLEMENTED** - Trade counts now display on Monthly Performance Chart
