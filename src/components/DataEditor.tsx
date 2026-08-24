import type { GroupInput } from "../types";
import { common } from "../math/calculateCommon";
import { randomizeDataset } from "../math/randomDataset";

const pct = (v: number) => `${(v * 100).toFixed(2)}%`,
  pp = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(3)} п.п.`;

export function DataEditor({
  groups,
  setGroups,
  reset,
}: {
  groups: GroupInput[];
  setGroups: (groups: GroupInput[]) => void;
  reset: () => void;
}) {
  const c = common(groups),
    s1 = groups.reduce((sum, group) => sum + group.share1, 0),
    s2 = groups.reduce((sum, group) => sum + group.share2, 0);
  const edit = (id: string, key: keyof GroupInput, value: string) =>
    setGroups(
      groups.map((group) =>
        group.id === id
          ? { ...group, [key]: key === "name" ? value : Number(value) }
          : group,
      ),
    );
  return (
    <aside className="panel editor">
      <div className="panel-title">
        <div>
          <span className="eyebrow">Dataset</span>
          <h2>Исходные данные</h2>
        </div>
        <div className="dataset-actions">
          <button
            className="text-btn"
            onClick={() => setGroups(randomizeDataset(groups))}
          >
            Сгенерировать данные
          </button>
          <button className="text-btn" onClick={reset}>
            Сбросить
          </button>
        </div>
      </div>
      <div className="data-head">
        <span>Группа</span>
        <span>Доля 1</span>
        <span>CTR 1</span>
        <span>Доля 2</span>
        <span>CTR 2</span>
        <span>Средний CTR</span>
        <span />
      </div>
      {groups.map((group) => (
        <div className="data-row" key={group.id}>
          <input
            value={group.name}
            onChange={(event) => edit(group.id, "name", event.target.value)}
          />
          {(["share1", "ctr1", "share2", "ctr2"] as const).map((key) => (
            <input
              key={key}
              type="number"
              step="0.1"
              value={group[key]}
              onChange={(event) => edit(group.id, key, event.target.value)}
            />
          ))}
          <output className="average-ctr">
            {(((group.ctr1 + group.ctr2) / 2) * 100).toFixed(3)}%
          </output>
          <button
            className="delete"
            disabled={groups.length <= 2}
            onClick={() =>
              setGroups(groups.filter((item) => item.id !== group.id))
            }
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="add"
        onClick={() => {
          const number = groups.length + 1;
          setGroups([
            ...groups,
            {
              id: `g${Date.now()}`,
              name: `Group ${number}`,
              share1: 0,
              share2: 0,
              ctr1: 0.02,
              ctr2: 0.02,
            },
          ]);
        }}
      >
        ＋ Добавить группу
      </button>
      {(Math.abs(s1 - 1) > 1e-9 || Math.abs(s2 - 1) > 1e-9) && (
        <div className="warning">
          Суммы долей должны быть равны 1. Сейчас: {s1.toFixed(3)} /{" "}
          {s2.toFixed(3)}
        </div>
      )}
      <div className="totals">
        <div>
          <span>CTR · период 1</span>
          <b>{pct(c.t1)}</b>
        </div>
        <div>
          <span>CTR · период 2</span>
          <b>{pct(c.t2)}</b>
        </div>
        <div className="delta">
          <span>Изменение</span>
          <b>{pp(c.delta)}</b>
        </div>
      </div>
    </aside>
  );
}
