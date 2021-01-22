import { StudentFailure } from './apis/brsApi';
import * as fileApi from './apis/fileApi';
import * as googleApi from './apis/googleApi';
import { parseStudentFailure } from './helpers/brsHelpers';

export interface ActualStudent {
  fullName: string;
  groupName: string;
  id: string;
  failure?: StudentFailure;
  properties: string[];
}

export async function fromSpreadsheetAsync(
  spreadsheetId: string,
  readRange: string,
  fullNameIndex: number = 0,
  groupNameIndex: number = 1,
  idIndex: number | null = null,
  failureIndex: number | null = null,
  authorizePolicy: googleApi.AuthorizePolicy = 'ask-if-not-saved'
) {
  await googleApi.authorizeAsync(authorizePolicy);
  const sheet = googleApi.openSpreadsheet(spreadsheetId);

  const rows = (await sheet.readAsync(readRange)).values || [];

  const result: ActualStudent[] = [];
  for (const row of rows) {
    const fullName = row[fullNameIndex];
    const groupName = row[groupNameIndex];
    const id = idIndex !== null ? row[idIndex] : null;
    const failure = failureIndex !== null ? parseStudentFailure(row[failureIndex]) : null;
    if (fullName && groupName) {
      result.push({
        fullName,
        groupName,
        id: id,
        failure: failure,
        properties: row,
      });
    }
  }
  return result;
}

export function fromCvs(
  filePath: string,
  skipHeader: boolean = false,
  fullNameIndex: number = 0,
  groupNameIndex: number = 1,
  idIndex: number | null = null,
  failureIndex: number | null = null,
): ActualStudent[] {
  const rows = fileApi.readFromCsv(filePath, skipHeader, ',');
  const result = [];
  for (const row of rows) {
    if (
      row.columns.length <= fullNameIndex ||
      row.columns.length <= groupNameIndex
    ) {
      throw new Error(`Can't parse line of actual students file`);
    }
    result.push({
      fullName: row.columns[fullNameIndex],
      groupName: row.columns[groupNameIndex],
      id: idIndex !== null ? row.columns[idIndex] : null,
      failure: failureIndex !== null ? parseStudentFailure(row.columns[failureIndex]) : null,
      properties: row.columns,
    });
  }
  return result;
}
