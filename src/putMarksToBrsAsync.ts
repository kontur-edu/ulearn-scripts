import * as brsApi from './apis/brsApi';
import {
  ControlAction,
  Discipline,
  StudentMark,
  TermType
} from './apis/brsApi';
import {
  parseAnyFloat,
  compareFixed
} from './helpers/tools';
import * as fio from './helpers/fio';
import { ActualStudent } from './readStudentsAsync';

export default async function putMarksToBrsAsync(
  secretName: string,
  actualStudents: ActualStudent[],
  disciplineName: string,
  isModuleDiscipline: boolean,
  year: number,
  course: number,
  termType: TermType,
  controlActionConfigs: ControlActionConfig[],
  options: PutMarksOptions
) {
  try {
    await brsApi.authByConfigAsync(secretName);

    const allDisciplines = (await brsApi.getDisciplineCachedAsync(
      year,
      course,
      termType,
      isModuleDiscipline
    ))
    const disciplines = allDisciplines.filter(d => compareFixed(d.discipline, disciplineName));

    for (const discipline of disciplines) {
      await putMarksForDisciplineAsync(
        discipline,
        actualStudents.filter(s => compareFixed(s.groupName, discipline.group)),
        controlActionConfigs,
        options
      );
      if (options.justFirstGroup) {
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

async function putMarksForDisciplineAsync(
  discipline: Discipline,
  actualStudents: ActualStudent[],
  controlActionConfigs: ControlActionConfig[],
  options: PutMarksOptions
) {
  console.log(`# Processing group ${discipline.group}`);
  console.log();

  const controlActions = await brsApi.getAllControlActionsCachedAsync(
    discipline
  );
  if (!checkControlActionsConfiguration(controlActions, controlActionConfigs)) {
    return;
  }

  const brsStudents = await brsApi.getAllStudentMarksAsync(discipline);
  const {
    mergedStudents,
    skippedActualStudents,
    skippedBrsStudents,
  } = mergeStudents(actualStudents, brsStudents);
  logMergedStudents(mergedStudents, skippedActualStudents, skippedBrsStudents);
  console.log();

  await putMarksForStudents(
    mergedStudents,
    controlActionConfigs,
    controlActions,
    options
  );
  if (options.save) {
    await brsApi.updateAllMarksAsync(discipline);
  }
  console.log();

  console.log();
}

function checkControlActionsConfiguration(
  controlActions: ControlAction[],
  controlActionConfigs: ControlActionConfig[]
) {
  for (const config of controlActionConfigs) {
    if (!getSuitableControlAction(config, controlActions)) {
      return false;
    }
  }
  return true;
}

async function putMarksForStudents(
  students: MergedStudent[],
  controlActionConfigs: ControlActionConfig[],
  controlActions: ControlAction[],
  options: PutMarksOptions
) {
  const statusCounters: { [k: string]: number } = {};

  for (const student of students) {
    const status = await putMarksForStudent(
      student,
      controlActionConfigs,
      controlActions,
      options
    );
    if (statusCounters[status] === undefined) {
      statusCounters[status] = 0;
    }
    statusCounters[status]++;
  }

  console.log('Group statuses:');
  for (const k of Object.keys(statusCounters)) {
    console.log(`- ${k} = ${statusCounters[k]}`);
  }
}

async function putMarksForStudent(
  student: MergedStudent,
  controlActionConfigs: ControlActionConfig[],
  controlActions: ControlAction[],
  options: PutMarksOptions
) {
  let updated = 0;
  let failed = 0;

  const marks = [];
  for (const config of controlActionConfigs) {
    const controlAction = getSuitableControlAction(config, controlActions);
    if (!controlAction) {
      throw new Error();
    }

    const brsMark = parseAnyFloat(student.brs[controlAction.uuid] as string);
    const actualMark = parseAnyFloat(student.actual.properties[config.propertyIndex]);

    if (actualMark === brsMark) {
      marks.push(`  ${actualMark} `.substr(`${actualMark}`.length - 1));
      continue;
    } else {
      marks.push(`  ${actualMark}!`.substr(`${actualMark}`.length - 1));
    }

    try {
      if (options.save) {
        await brsApi.putStudentMarkAsync(
          student.brs.studentUuid,
          controlAction.uuidWithoutPrefix,
          actualMark
        );
      }
      updated++;
    } catch (error) {
      failed++;
    }
  }

  const status = failed > 0 ? 'FAILED ' : updated > 0 ? 'UPDATED' : 'SKIPPED';
  if (options.verbose || failed > 0) {
    const studentName = (
      student.actual.fullName + '                              '
    ).substr(0, 30);
    console.log(
      `${status} ${studentName} updated: ${updated}, failed: ${failed}, marks: ${marks.join(
        ' '
      )}`
    );
  }
  return status;
}

function getSuitableControlAction(
  config: ControlActionConfig,
  controlActions: ControlAction[]
) {
  const suitableControlActions = controlActions.filter(a =>
    config.controlActions.some(b => a.controlAction === b)
  );

  if (suitableControlActions.length === 0) {
    console.log(`All of ${config.controlActions.join(', ')} not found`);
    console.log(
      `Known actions: ${controlActions.map(a => a.controlAction).join(', ')}`
    );
    return null;
  }

  if (config.matchIndex !== undefined || config.matchCount !== undefined) {
    if (
      config.matchIndex === undefined ||
      config.matchCount === undefined ||
      suitableControlActions.length !== config.matchCount ||
      config.matchIndex >= config.matchCount
    ) {
      console.log(
        `Invalid configuration of ${config.controlActions.join(', ')}`
      );
      console.log(
        `Can't match: ${config.matchIndex}/${config.matchCount} of ${suitableControlActions.length}`
      );
      return null;
    }
    return suitableControlActions[config.matchIndex];
  }

  if (suitableControlActions.length > 1) {
    console.log(
      `Several control actions found for ${config.controlActions.join(', ')}`
    );
    console.log(
      `Found actions: ${suitableControlActions
        .map(a => a.controlAction)
        .join(', ')}`
    );
    return null;
  }

  return suitableControlActions[0];
}

function mergeStudents(
  actualStudents: ActualStudent[],
  brsStudents: StudentMark[]
) {
  const activeBrsStudents = brsStudents.filter(
    s => s.studentStatus !== 'Переведен'
  );

  const mergedStudents: MergedStudent[] = [];
  const skippedActualStudents: ActualStudent[] = [];
  for (const actualStudent of actualStudents) {
    const suitableStudents = activeBrsStudents.filter(brsStudent =>
      areStudentsLike(brsStudent, actualStudent)
    );
    if (suitableStudents.length === 1) {
      mergedStudents.push({ actual: actualStudent, brs: suitableStudents[0] });
    } else {
      skippedActualStudents.push(actualStudent);
    }
  }

  const skippedBrsStudents: StudentMark[] = [];
  for (const brsStudent of activeBrsStudents) {
    if (
      !mergedStudents.some(ms => ms.brs.studentUuid === brsStudent.studentUuid)
    ) {
      skippedBrsStudents.push(brsStudent);
    }
  }

  return { mergedStudents, skippedActualStudents, skippedBrsStudents };
}

function areStudentsLike(
  brsStudent: StudentMark,
  actualStudent: ActualStudent
) {
  const brsFullName = fio.toKey(brsStudent.studentFio);
  const actualFullName = fio.toKey(actualStudent.fullName);
  return brsFullName.startsWith(actualFullName);
}

function logMergedStudents(
  mergedStudents: MergedStudent[],
  skippedActualStudents: ActualStudent[],
  skippedBrsStudents: StudentMark[]
) {
  console.log(`Merged students = ${mergedStudents.length}`);
  console.log(`Can't merge actual students = ${skippedActualStudents.length}`);
  for (const s of skippedActualStudents) {
    console.log('- ' + s.fullName);
  }
  console.log(`Can't merge BRS students = ${skippedBrsStudents.length}`);
  for (const s of skippedBrsStudents) {
    console.log('- ' + s.studentFio);
  }
}

export interface ControlActionConfig {
  controlActions: string[];
  matchIndex?: number;
  matchCount?: number;
  propertyIndex: number;
}

export interface PutMarksOptions {
  save: boolean;
  verbose: boolean;
  justFirstGroup: boolean;
}

interface MergedStudent {
  actual: ActualStudent;
  brs: StudentMark;
}
