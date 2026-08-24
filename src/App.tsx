import { useEffect, useMemo, useState } from "react";
import type { GroupInput } from "./types";
import { DataEditor } from "./components/DataEditor";
import { FlowVisual } from "./components/FlowVisual";
import { Compare } from "./components/Compare";
import { sequentialDecomposition } from "./math/sequentialDecomposition";
import { referenceDecomposition } from "./math/referenceDecomposition";
import { symmetricDecomposition } from "./math/symmetricDecomposition";
import { common, sumFactors } from "./math/calculateCommon";
const initial: GroupInput[] = [
  { id: "a", name: "A", share1: 0.19, ctr1: 0.035, share2: 0.14, ctr2: 0.03 },
  { id: "b", name: "B", share1: 0.28, ctr1: 0.02, share2: 0.33, ctr2: 0.022 },
  { id: "c", name: "C", share1: 0.3, ctr1: 0.024, share2: 0.16, ctr2: 0.02 },
  { id: "d", name: "D", share1: 0.23, ctr1: 0.05, share2: 0.37, ctr2: 0.047 },
];
type Method = "sequential" | "reference" | "symmetric";
type MethodSimulationState = {
  currentStep: number;
  isPlaying: boolean;
  hasStarted: boolean;
  hasCompleted: boolean;
};
const createSimulationState = (): Record<Method, MethodSimulationState> => ({
  sequential: { currentStep: 0, isPlaying: false, hasStarted: false, hasCompleted: false },
  reference: { currentStep: 0, isPlaying: false, hasStarted: false, hasCompleted: false },
  symmetric: { currentStep: 0, isPlaying: false, hasStarted: false, hasCompleted: false },
});
const methodInfo = {
  sequential: [
    "Последовательное разложение",
    "По очереди выделяем группу и продолжаем внутри остатка.",
  ],
  reference: [
    "Разложение через опорную группу",
    "Изменение долей оценивается относительно базовой категории.",
  ],
  symmetric: [
    "Симметричное разложение",
    "Каждая группа раскладывается независимо через средние значения.",
  ],
};
export default function App() {
  const [groups, setGroups] = useState(initial),
    [method, setMethod] = useState<Method>("sequential"),
    [order, setOrder] = useState(initial.map((x) => x.id)),
    [reference, setReference] = useState("c"),
    [simulations, setSimulations] = useState(createSimulationState),
    [speed, setSpeed] = useState(1),
    [formulas, setFormulas] = useState(false),
    [compare, setCompare] = useState(false);
  useEffect(() => {
    const ids = groups.map((g) => g.id);
    setOrder((o) => [
      ...o.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !o.includes(id)),
    ]);
    if (!ids.includes(reference)) setReference(ids[ids.length - 1]);
  }, [groups, reference]);
  const sequentialResult = useMemo(
    () => sequentialDecomposition(groups, order),
    [groups, order],
  );
  const referenceResult = useMemo(
    () => referenceDecomposition(groups, reference),
    [groups, reference],
  );
  const symmetricResult = useMemo(
    () => symmetricDecomposition(groups),
    [groups],
  );
  const results = {
      sequential: sequentialResult,
      reference: referenceResult,
      symmetric: symmetricResult,
    },
    result = results[method],
    c = common(groups);
  const activeSimulation = simulations[method];
  const step = Math.min(activeSimulation.currentStep, Math.max(0, result.steps.length - 1));
  const playing = activeSimulation.isPlaying;
  const updateSimulation = (
    methodId: Method,
    update: (state: MethodSimulationState) => MethodSimulationState,
  ) => setSimulations((all) => ({ ...all, [methodId]: update(all[methodId]) }));
  const selectMethod = (nextMethod: Method) => {
    updateSimulation(method, (state) => ({ ...state, isPlaying: false }));
    setMethod(nextMethod);
  };
  const updateGroups = (nextGroups: GroupInput[]) => {
    setGroups(nextGroups);
    setSimulations(createSimulationState());
  };
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        updateSimulation(method, (state) => {
          const nextStep = Math.min(state.currentStep + 1, result.steps.length - 1);
          return {
            ...state,
            currentStep: nextStep,
            hasStarted: true,
            hasCompleted: nextStep === result.steps.length - 1,
            isPlaying: nextStep < result.steps.length - 1,
          };
        }),
      1300 / speed,
    );
    return () => clearInterval(t);
  }, [playing, speed, result.steps.length, method]);
  const move = (id: string, d: number) => {
    const i = order.indexOf(id),
      j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
  };
  const useRecommendedOrder = () => {
    const originalIndex = new Map(groups.map((group, index) => [group.id, index]));
    setOrder(
      [...groups]
        .sort((a, b) => {
          const deltaDifference =
            Math.abs(b.share2 - b.share1) - Math.abs(a.share2 - a.share1);
          if (deltaDifference !== 0) return deltaDifference;
          const averageDifference =
            (b.share1 + b.share2) / 2 - (a.share1 + a.share2) / 2;
          return averageDifference || originalIndex.get(a.id)! - originalIndex.get(b.id)!;
        })
        .map((group) => group.id),
    );
  };
  const totals = {
    ctr: result.factors
      .filter((f) => f.type === "ctr")
      .reduce((s, f) => s + f.value, 0),
    share: result.factors
      .filter((f) => f.type === "share")
      .reduce((s, f) => s + f.value, 0),
  };
  const biggest = [...result.factors].sort(
    (a, b) => Math.abs(b.value) - Math.abs(a.value),
  );
  return (
    <>
      <header>
        <nav>
          <div className="brand">
            <span className="mark">FA</span>
            <span>
              Factor Analysis <i>Playground</i>
            </span>
          </div>
          <button
            className={compare ? "" : "active"}
            onClick={() => setCompare(false)}
          >
            Симуляция
          </button>
          <button
            className={compare ? "active" : ""}
            onClick={() => {
              updateSimulation(method, (state) => ({ ...state, isPlaying: false }));
              setCompare(true);
            }}
          >
            Сравнить методы
          </button>
        </nav>
        <div className="hero">
          <span className="eyebrow">Interactive learning tool</span>
          <h1>
            От общего изменения
            <br />к <em>вкладам факторов</em>
          </h1>
          <p>
            Как изменение общего CTR раскладывается на изменение CTR групп и
            структуры показов.
          </p>
        </div>
      </header>
      <div className="workspace">
        <DataEditor
          groups={groups}
          setGroups={updateGroups}
          reset={() => {
            updateGroups(initial);
            setOrder(initial.map((x) => x.id));
            setReference("c");
          }}
        />
        {compare ? (
          <Compare
            groups={groups}
            items={[
              {
                name: "Последовательный",
                sub: `Порядок: ${order.map((id) => groups.find((g) => g.id === id)?.name).join(" → ")}`,
                r: results.sequential,
                completed: simulations.sequential.hasCompleted,
              },
              {
                name: "Опорная группа",
                sub: `База: ${groups.find((g) => g.id === reference)?.name}`,
                r: results.reference,
                completed: simulations.reference.hasCompleted,
              },
              {
                name: "Симметричный",
                sub: "Без порядка · без базы",
                r: results.symmetric,
                completed: simulations.symmetric.hasCompleted,
              },
            ]}
          />
        ) : (
          <main className="tool">
            <div className="tabs">
              {(Object.keys(methodInfo) as Method[]).map((m) => (
                <button
                  className={method === m ? "active" : ""}
                  onClick={() => selectMethod(m)}
                  key={m}
                >
                  <b>{methodInfo[m][0]} {simulations[m].hasCompleted ? "✓" : ""}</b>
                  <small>{methodInfo[m][1]}</small>
                </button>
              ))}
            </div>
            <section className="panel options">
              <div>
                {method === "sequential" && (
                  <>
                    <div className="order-heading">
                      <span className="eyebrow">Порядок групп</span>
                      <button className="recommended-order" onClick={useRecommendedOrder}>
                        Recommended order
                      </button>
                    </div>
                    <div className="order">
                      {order.map((id, i) => (
                        <span key={id}>
                          {groups.find((g) => g.id === id)?.name}
                          <button onClick={() => move(id, -1)} disabled={!i}>
                            ←
                          </button>
                          <button
                            onClick={() => move(id, 1)}
                            disabled={i === order.length - 1}
                          >
                            →
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="hint">
                      Индивидуальные share-эффекты зависят от порядка.
                    </p>
                  </>
                )}
                {method === "reference" && (
                  <>
                    <label className="selector">
                      <span>Опорная группа</span>
                      <select
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      >
                        {groups.map((g) => (
                          <option value={g.id} key={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="hint">
                      Распределение структурного эффекта зависит от выбранной
                      базы.
                    </p>
                  </>
                )}
                {method === "symmetric" && (
                  <div className="independent">
                    ↔ <b>Independent per group</b>
                    <span>Без порядка и опорной категории</span>
                  </div>
                )}
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formulas}
                  onChange={(e) => setFormulas(e.target.checked)}
                />
                <span />
                Показывать формулы
              </label>
            </section>
            <section className="panel simulation">
              <div className="sim-head">
                <div>
                  <span className="eyebrow">
                    Шаг {step + 1} из {result.steps.length}
                  </span>
                  <h2>{result.steps[step].title}</h2>
                </div>
                <div className="exact">
                  {Math.abs(sumFactors(result.factors) - c.delta) < 1e-12
                    ? "✓ Точное разложение"
                    : "⚠ Расхождение"}
                </div>
              </div>
              <FlowVisual
                groups={groups}
                result={{
                  ...result,
                  steps: result.steps.map((s) =>
                    formulas ? s : { ...s, formula: undefined },
                  ),
                }}
                step={step}
                method={method}
                reference={reference}
              />
            </section>
            {step === result.steps.length - 1 && (
              <section className="panel interpretation">
                <span className="eyebrow">Интерпретация</span>
                <h2>Что произошло</h2>
                <p>
                  Общий CTR {c.delta >= 0 ? "вырос" : "снизился"} на{" "}
                  <b>{Math.abs(c.delta * 100).toFixed(3)} п.п.</b> Изменения CTR
                  внутри групп дали <b>{(totals.ctr * 100).toFixed(3)} п.п.</b>,
                  структура показов —{" "}
                  <b>{(totals.share * 100).toFixed(3)} п.п.</b>
                </p>
                {biggest[0] && (
                  <p>
                    Наиболее сильный вклад:{" "}
                    <b>
                      {biggest[0].groupName},{" "}
                      {biggest[0].type === "ctr"
                        ? "изменение CTR"
                        : method === "reference"
                          ? `изменение доли относительно ${groups.find((g) => g.id === reference)?.name}`
                          : method === "sequential"
                            ? "изменение доли относительно текущего остатка"
                            : "изменение доли при среднем CTR группы"}
                    </b>{" "}
                    ({(biggest[0].value * 100).toFixed(3)} п.п.).
                  </p>
                )}
                <div className="check">
                  <span>
                    Рассчитано{" "}
                    <b>{(sumFactors(result.factors) * 100).toFixed(4)} п.п.</b>
                  </span>
                  <span>
                    Факт <b>{(c.delta * 100).toFixed(4)} п.п.</b>
                  </span>
                  <span>
                    Разница{" "}
                    <b>
                      {((sumFactors(result.factors) - c.delta) * 100).toFixed(
                        4,
                      )}{" "}
                      п.п.
                    </b>
                  </span>
                </div>
              </section>
            )}
          </main>
        )}
      </div>
      {!compare && (
        <div className="playbar">
          <button
            onClick={() =>
              updateSimulation(method, (state) => ({
                ...state,
                currentStep: Math.max(0, step - 1),
                isPlaying: false,
                hasStarted: true,
              }))
            }
            disabled={!step}
          >
            ← Назад
          </button>
          <button
            className="play"
            onClick={() =>
              updateSimulation(method, (state) => ({
                ...state,
                isPlaying: !state.isPlaying,
                hasStarted: true,
              }))
            }
          >
            {playing ? "Ⅱ Пауза" : "▶ Воспроизвести"}
          </button>
          <button
            onClick={() =>
              updateSimulation(method, (state) => {
                const nextStep = Math.min(result.steps.length - 1, step + 1);
                return {
                  ...state,
                  currentStep: nextStep,
                  isPlaying: false,
                  hasStarted: true,
                  hasCompleted: nextStep === result.steps.length - 1,
                };
              })
            }
            disabled={step === result.steps.length - 1}
          >
            Далее →
          </button>
          <button
            onClick={() => {
              updateSimulation(method, (state) => ({
                ...state,
                currentStep: 0,
                isPlaying: false,
                hasStarted: false,
                hasCompleted: false,
              }));
            }}
          >
            ↻
          </button>
          <span className="progress">
            <i
              style={{ width: `${(step / (result.steps.length - 1)) * 100}%` }}
            />
          </span>
          <label>
            Скорость{" "}
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              {[0.5, 1, 1.5, 2].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            ×
          </label>
          <b>
            {step + 1} / {result.steps.length}
          </b>
        </div>
      )}
    </>
  );
}
