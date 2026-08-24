import type { FactorContribution } from "../types";

const pp = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(3)}`;

type Props = {
  factors: FactorContribution[];
  delta: number;
  compact?: boolean;
  displayGroupOrder?: string[];
  maxAbsValue?: number;
};

export function FactorChart({ factors, delta, compact = false, displayGroupOrder, maxAbsValue }: Props) {
  const orderedFactors = displayGroupOrder
    ? [...factors].sort((a, b) => {
        const groupDifference = displayGroupOrder.indexOf(a.groupId) - displayGroupOrder.indexOf(b.groupId);
        return groupDifference || Number(a.type === "share") - Number(b.type === "share");
      })
    : factors;
  const bars = [
    ...orderedFactors.map((factor) => ({
      ...factor,
      label: `${factor.groupName} · ${factor.type === "ctr" ? "CTR" : "доля"}`,
    })),
    { groupId: "total", groupName: "Общее", type: "ctr" as const, value: delta, label: "Общее ΔCTR" },
  ];
  const max = Math.max(maxAbsValue ?? 0, ...bars.map((bar) => Math.abs(bar.value)), 0.0001);
  const width = Math.max(680, bars.length * 80), plotHeight = compact ? 250 : 330, height = plotHeight + 48, zero = plotHeight * 0.5;
  const scale = (plotHeight * 0.36) / max;
  return <div className="chart-wrap"><svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График вкладов факторов"><line x1="30" x2={width - 20} y1={zero} y2={zero} className="zero"/><text x="30" y={zero - 8} className="axis-label">0</text>{bars.map((bar, index) => {const x=48+index*(width-80)/bars.length,barHeight=Math.max(2,Math.abs(bar.value)*scale),y=bar.value>=0?zero-barHeight:zero;return <g key={`${bar.groupId}-${bar.type}-${index}`} className={`bar-group ${bar.type} ${bar.groupId === "total" ? "overall" : ""}`}><title>{`${bar.groupName} · ${bar.type === "ctr" ? "Влияние CTR" : "Влияние доли"}: ${pp(bar.value)} п.п.${Math.abs(delta)>.00001?` · ${(bar.value/delta*100).toFixed(1)}% от ΔCTR`:""}`}</title><rect x={x} y={y} width="42" height={barHeight} rx="5"/><text x={x+21} y={bar.value>=0?y-8:y+barHeight+15} className="value">{pp(bar.value)}</text><text x={x+21} y={plotHeight+12} className="label">{bar.groupId==='total'?<><tspan x={x+21}>Общее изменение</tspan><tspan x={x+21} dy="11">CTR</tspan></>:<><tspan x={x+21}>{bar.groupName}</tspan><tspan x={x+21} dy="11">Влияние изменения</tspan><tspan x={x+21} dy="11">{bar.type==='ctr'?'CTR':'доли'}</tspan></>}</text></g>})}</svg></div>;
}
