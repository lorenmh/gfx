export const atoms = str => (
  str
  .join()
  .split(' ')
  .filter(x => x)
  .reduce((a, c) => ((a[c] = Symbol(c) || 1) && a), {})
);
