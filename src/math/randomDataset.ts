import type { GroupInput } from "../types";

const normalize = (values: number[]) => {
  const sum = values.reduce((total, value) => total + value, 0);
  return values.map((value) => value / sum);
};

const centeredNoise = (random: () => number, amplitude: number) =>
  (random() + random() - 1) * amplitude;

const shuffle = (values: number[], random: () => number) => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

const redistributeShares = (share1: number[], random: () => number) => {
  if (share1.length < 2) return [...share1];
  const draw = random();
  const mode = draw < 0.3
    ? { minMoved: 0.02, maxMoved: 0.06, perGroupCap: 0.045 }
    : draw < 0.75
      ? { minMoved: 0.05, maxMoved: 0.15, perGroupCap: 0.09 }
      : { minMoved: 0.1, maxMoved: 0.22, perGroupCap: 0.16 };
  const indices = shuffle(share1.map((_, index) => index), random);
  const activeCount = share1.length >= 5 ? share1.length - 1 : share1.length;
  const active = indices.slice(0, activeCount);
  const donorCount = Math.max(1, Math.floor(active.length / 2));
  const donors = active.slice(0, donorCount);
  const receivers = active.slice(donorCount);
  const minimumShare = Math.min(0.003, 0.15 / share1.length);
  const capacities = donors.map((index) =>
    Math.min(mode.perGroupCap, Math.max(0, share1[index] - minimumShare)),
  );
  const totalCapacity = capacities.reduce((sum, value) => sum + value, 0);
  const requested = mode.minMoved + random() * (mode.maxMoved - mode.minMoved);
  const moved = Math.min(requested, totalCapacity * 0.85);
  const share2 = [...share1];
  capacities.forEach((capacity, index) => {
    share2[donors[index]] -= moved * capacity / totalCapacity;
  });
  const receiverWeights = receivers.map(() => 0.5 + random());
  const receiverTotal = receiverWeights.reduce((sum, value) => sum + value, 0);
  receiverWeights.forEach((weight, index) => {
    share2[receivers[index]] += moved * weight / receiverTotal;
  });
  return share2;
};

export function randomizeDataset(
  groups: GroupInput[],
  random: () => number = Math.random,
): GroupInput[] {
  if (!groups.length) return [];
  const share1 = normalize(groups.map(() => 0.55 + random() * 0.9));
  const share2 = redistributeShares(share1, random);
  const ctr1 = groups.map(() => {
    const average = (random() + random() + random()) / 3;
    return 0.005 + 0.075 * Math.pow(average, 1.55);
  });
  const ctrNoise = groups.map(() => centeredNoise(random, 0.22));
  if (groups.length > 1) {
    if (ctrNoise.every((value) => value >= 0)) ctrNoise[0] = -Math.max(0.05, ctrNoise[0]);
    if (ctrNoise.every((value) => value <= 0)) ctrNoise[0] = Math.max(0.05, -ctrNoise[0]);
  }
  return groups.map((group, index) => ({
    ...group,
    share1: share1[index],
    share2: share2[index],
    ctr1: ctr1[index],
    ctr2: Math.max(0.0001, ctr1[index] * (1 + ctrNoise[index])),
  }));
}
