import { authByConfigAsync, Discipline } from './apis/brsApi';
import putMarksToBrsAsync, {
  PutMarksOptions,
  DisciplineConfig,
  ControlActionConfig,
  MarksData,
} from './putMarksToBrsAsync';
import buildAutoMarksConfigAsync from './buildAutoMarksConfigAsync';
import { ActualStudent } from './readStudentsAsync';
import * as googleApi from './apis/googleApi';
import { AuthorizePolicy } from './apis/googleAuth';

export { PutMarksOptions, DisciplineConfig, ControlActionConfig, MarksData };

export default async function putMarksAutoAsync(
  secretName: string,
  spreadsheetId: string,
  sheetName: string,
  options: PutMarksOptions,
  isSuitableDiscipline: (d: Discipline) => boolean = null,
  isSuitableActualStudent: (s: ActualStudent) => boolean = null,
  authorizePolicy: AuthorizePolicy = 'ask-if-not-saved'
) {
  await googleApi.authorizeAsync(authorizePolicy);

  const marksData = await buildAutoMarksConfigAsync(
    spreadsheetId,
    sheetName,
    isSuitableDiscipline,
    isSuitableActualStudent
  );

  try {
    await authByConfigAsync(secretName);
    await putMarksToBrsAsync(marksData, options);
  } catch (e) {
    console.log(e);
  }
}
