import type { Decomposition, GroupInput } from "../types";
import { common, sumFactors } from "../math/calculateCommon";
import { FactorChart } from "./FactorChart";

type CompareItem = { name: string; sub: string; r: Decomposition; completed?: boolean };

export function Compare({ groups, items }: { groups: GroupInput[]; items: CompareItem[] }) {
  const delta = common(groups).delta;
  const displayGroupOrder = groups.map((group) => group.id);
  const maxAbsValue = Math.max(
    Math.abs(delta),
    ...items.flatMap((item) => item.r.factors.map((factor) => Math.abs(factor.value))),
  );
  return <main className="compare"><div className="compare-grid">{items.map((item) => {const ctr=item.r.factors.filter((factor)=>factor.type==="ctr").reduce((sum,factor)=>sum+factor.value,0),share=item.r.factors.filter((factor)=>factor.type==="share").reduce((sum,factor)=>sum+factor.value,0);return <section className="panel compare-card" key={item.name}><span className="eyebrow">{item.sub} · {item.completed?"Simulation completed":"Calculated"}</span><h2>{item.name}</h2><FactorChart compact factors={item.r.factors} delta={delta} displayGroupOrder={displayGroupOrder} maxAbsValue={maxAbsValue}/><div className="mini-totals"><span>CTR <b>{(ctr*100).toFixed(3)} п.п.</b></span><span>Доля <b>{(share*100).toFixed(3)} п.п.</b></span><span className="exact">✓ Δ = {(sumFactors(item.r.factors)*100).toFixed(4)} п.п.</span></div></section>})}</div><section className="panel matrix"><h2>Что меняет интерпретацию?</h2><table><thead><tr><th>Свойство</th><th>Последовательный</th><th>Опорная группа</th><th>Симметричный</th></tr></thead><tbody><tr><td>Зависит от порядка</td><td>Да</td><td>Нет</td><td>Нет</td></tr><tr><td>Зависит от базы</td><td>Нет</td><td>Да</td><td>Нет</td></tr><tr><td>Точное разложение</td><td>Да</td><td>Да</td><td>Да</td></tr><tr><td>Смысл share-эффекта</td><td>Относительно остатка</td><td>Относительно базы</td><td>При среднем CTR группы</td></tr><tr><td>Индивидуальные share bars стабильны</td><td>Нет</td><td>Нет</td><td>Да</td></tr></tbody></table></section><h2 className="choose-title">Какая интерпретация нужна?</h2><div className="choices"><article><b>Последовательная</b><p>Когда порядок имеет содержательный смысл и нужна история «выделили группу → анализируем остаток».</p></article><article><b>Опорная группа</b><p>Когда есть естественная бизнес-база или контрольная категория.</p></article><article><b>Симметричная</b><p>Когда важны отсутствие порядка и специальной базовой категории.</p></article></div></main>;
}
