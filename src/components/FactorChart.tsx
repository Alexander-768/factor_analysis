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
  const width = Math.max(680, bars.length * 80), height = compact ? 250 : 330, zero = height * 0.5;
  const scale = (height * 0.36) / max;
  return <div className="chart-wrap"><svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График вкладов факторов"><line x1="30" x2={width - 20} y1={zero} y2={zero} className="zero"/><text x="30" y={zero - 8} className="axis-label">0</text>{bars.map((bar, index) => {const x=48+index*(width-80)/bars.length,barHeight=Math.max(2,Math.abs(bar.value)*scale),y=bar.value>=0?zero-barHeight:zero;return <g key={`${bar.groupId}-${bar.type}-${index}`} className={`bar-group ${bar.type} ${bar.groupId === "total" ? "overall" : ""}`}><title>{`${bar.groupName} · ${bar.type === "ctr" ? "Влияние CTR" : "Влияние доли"}: ${pp(bar.value)} п.п.${Math.abs(delta)>.00001?` · ${(bar.value/delta*100).toFixed(1)}% от ΔCTR`:""}`}</title><rect x={x} y={y} width="42" height={barHeight} rx="5"/><text x={x+21} y={bar.value>=0?y-8:y+barHeight+15} className="value">{pp(bar.value)}</text><text transform={`translate(${x+21},${height-8}) rotate(-35)`} className="label">{bar.label}</text></g>})}</svg></div>;
}
