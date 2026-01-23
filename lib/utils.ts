export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const sortByTimestampDesc = <T extends { timestamp: number }>(items: T[]) => {
  return [...items].sort((a, b) => b.timestamp - a.timestamp);
};
