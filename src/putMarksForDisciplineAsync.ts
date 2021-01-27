import * as brsApi from './apis/brsApi';
import {
  ControlAction,
  Discipline,
  StudentMark,
  StudentFailure,
} from './apis/brsApi';
import { parseAnyFloat, compareNormalized } from './helpers/tools';
import * as fio from './helpers/fio';
import { ActualStudent } from './readStudentsAsync';
import { formatStudentFailure } from './helpers/brsHelpers';

export default async function putMarksForDisciplineAsync(
  discipline: Discipline,
  actualStudents: ActualStudent[],
  defaultStudentFailure: StudentFailure,
  controlActionConfigs: ControlActionConfig[],
  options: PutMarksOptions
) {
  if (actualStudents.length === 0) return;
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

  await putMarksForStudentsAsync(
    discipline,
    mergedStudents,
    controlActionConfigs,
    controlActions,
    options
  );
  console.log();

  await updateFailuresForSkippedStudentsAsync(
    skippedBrsStudents,
    discipline,
    defaultStudentFailure,
    options
  );
  console.log();

  if (options.save) {
    await brsApi.updateAllMarksAsync(discipline);
  }

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

async function putMarksForStudentsAsync(
  discipline: Discipline,
  students: MergedStudent[],
  controlActionConfigs: ControlActionConfig[],
  controlActions: ControlAction[],
  options: PutMarksOptions
) {
  const statusCounters: { [k: string]: number } = {};

  for (const student of students) {
    const status = await putMarksForStudentAsync(
      discipline,
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

  console.log('Marks update statuses:');
  for (const k of Object.keys(statusCounters)) {
    console.log(`- ${k} = ${statusCounters[k]}`);
  }
}

async function putMarksForStudentAsync(
  discipline: Discipline,
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
    const actualMark = parseAnyFloat(
      student.actual.properties[config.propertyIndex]
    );

    if (actualMark === brsMark || actualMark === 0) {
      marks.push(`    ${actualMark} `.substr(`${actualMark}`.length - 1));
      continue;
    } else {
      marks.push(`    ${actualMark}!`.substr(`${actualMark}`.length - 1));
    }

    try {
      if (options.save) {
        await brsApi.putStudentMarkAsync(
          student.brs.studentUuid,
          controlAction.uuidWithoutPrefix,
          actualMark,
          discipline.groupHistoryId,
          student.brs.cardType,
          student.brs.disciplineLoad
        );
      }
      updated++;
    } catch (error) {
      failed++;
    }
  }

  const brsFailureStatus =
    (student.brs.failure as StudentFailure) ?? StudentFailure.NoFailure;
  const actualFailure = student.actual.failure ?? StudentFailure.NoFailure;
  let failureStatus = '';
  if (actualFailure === brsFailureStatus) {
    failureStatus = `${formatStudentFailure(actualFailure)}`;
  } else {
    failureStatus = `${formatStudentFailure(actualFailure)}!`;
    try {
      if (options.save) {
        await brsApi.putStudentFailureAsync(
          student.brs.studentUuid,
          discipline,
          actualFailure
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
      )}, failureStatus: ${failureStatus}`
    );
  }
  return status;
}

function getSuitableControlAction(
  config: ControlActionConfig,
  controlActions: ControlAction[]
) {
  const suitableControlActions = controlActions.filter((a) =>
    config.controlActions.some((b) => compareNormalized(a.controlAction, b))
  );

  if (suitableControlActions.length === 0) {
    console.log(`All of ${config.controlActions.join(', ')} not found`);
    console.log(
      `Known actions: ${controlActions.map((a) => a.controlAction).join(', ')}`
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
        .map((a) => a.controlAction)
        .join(', ')}`
    );
    return null;
  }

  return suitableControlActions[0];
}

async function updateFailuresForSkippedStudentsAsync(
  students: StudentMark[],
  discipline: Discipline,
  defaultStudentFailure: StudentFailure,
  options: PutMarksOptions
) {
  const statusCounters: { [k: string]: number } = {};

  for (const student of students) {
    const status = await updateFailureForStudent(
      student,
      discipline,
      defaultStudentFailure,
      options
    );
    if (statusCounters[status] === undefined) {
      statusCounters[status] = 0;
    }
    statusCounters[status]++;
  }

  const statusKeys = Object.keys(statusCounters);
  if (statusKeys.length > 0) {
    console.log('Failures update statuses:');
    for (const k of statusKeys) {
      console.log(`- ${k} = ${statusCounters[k]}`);
    }
  } else {
    console.log('No failures for skipped students');
  }
}

async function updateFailureForStudent(
  student: StudentMark,
  discipline: Discipline,
  defaultStudentFailure: StudentFailure,
  options: PutMarksOptions
) {
  let status = '';
  const brsFailureStatus = student.failure
    ? (student.failure as StudentFailure)
    : StudentFailure.NoFailure;
  const actualFailure = defaultStudentFailure;
  if (actualFailure === brsFailureStatus) {
    status = 'SKIPPED';
  } else {
    try {
      if (options.save) {
        await brsApi.putStudentFailureAsync(
          student.studentUuid,
          discipline,
          actualFailure
        );
      }
      status = 'UPDATED';
    } catch (error) {
      status = 'FAILED';
    }
  }

  if (options.verbose || status === 'FAILED') {
    const studentName = (
      student.studentFio + '                              '
    ).substr(0, 30);
    const description =
      status !== 'SKIPPED'
        ? `${formatStudentFailure(actualFailure)} from ${formatStudentFailure(
            brsFailureStatus
          )}`
        : formatStudentFailure(actualFailure);
    console.log(`${status} ${studentName} ${description}`);
  }
  return status;
}

function mergeStudents(
  actualStudents: ActualStudent[],
  brsStudents: StudentMark[]
) {
  const activeBrsStudents = brsStudents.filter(isStudentActive);

  const mergedStudents: MergedStudent[] = [];
  const skippedActualStudents: ActualStudent[] = [];
  for (const actualStudent of actualStudents) {
    const suitableStudents = activeBrsStudents.filter((brsStudent) =>
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
      !mergedStudents.some(
        (ms) => ms.brs.studentUuid === brsStudent.studentUuid
      )
    ) {
      skippedBrsStudents.push(brsStudent);
    }
  }

  return { mergedStudents, skippedActualStudents, skippedBrsStudents };
}

function isStudentActive(brsStudent: StudentMark) {
  return (
    brsStudent.studentStatus !== 'Переведен' &&
    brsStudent.studentStatus !== 'Отчислен'
  );
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
}

interface MergedStudent {
  actual: ActualStudent;
  brs: StudentMark;
}
