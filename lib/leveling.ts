export const calcLevel = (xp: number) => {
  return Math.floor(xp / 100) + 1;
};

export const xpToNextLevel = (xp: number) => {
  return 100 - (xp % 100);
};