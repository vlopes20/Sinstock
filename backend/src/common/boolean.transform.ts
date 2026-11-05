// Read the original input: implicit Boolean conversion turns the string "false" into true.
export function parseBoolean(value: unknown): unknown {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}
