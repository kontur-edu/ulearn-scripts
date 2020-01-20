export function fixSpaces(str: string) {
  return str && str.replace(/[\s]/g, ' ');
}

export function compareFixed(s1: string, s2: string) {
  return fixSpaces(s1) === fixSpaces(s2);
}

export function parseAnyFloat(s: string) {
  return parseFloat(s && s.replace(',', '.'));
}
