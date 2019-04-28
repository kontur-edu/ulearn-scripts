import * as fs from 'fs';

export interface ActualStudent {
  fullName: string;
  groupName: string;
  properties: string[];
}

export function readStudentsFromCsv(
  filePath: string,
  skipHeader: boolean = false,
  fullNameIndex: number = 0,
  groupNameIndex: number = 1,
  separator: string = ';'
): ActualStudent[] {
  const text = stripBOM(fs.readFileSync(filePath, 'utf8'));
  const lines = text.split('\r\n');

  const result = [];
  let needSkip = skipHeader;
  for (const line of lines) {
    if (needSkip) {
      needSkip = false;
      continue;
    }

    if (line) {
      const parts = line.split(separator);
      if (parts.length <= fullNameIndex || parts.length <= groupNameIndex) {
        throw new Error(`Can't parse line '${line}' of actual students file`);
      }
      result.push({
        fullName: parts[fullNameIndex],
        groupName: parts[groupNameIndex],
        properties: parts,
      });
    }
  }
  return result;
}

function stripBOM(content: string) {
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
}
