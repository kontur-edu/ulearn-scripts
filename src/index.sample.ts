import { TermType } from './apis/brsApi';
import createGroupsAsync from './createGroupsAsync';
import moveStudentsAsync from './moveStudentsAsync';
import putMarksToBrsManualAsync, {
  DisciplineConfig,
  ControlActionConfig,
} from './putMarksToBrsManualAsync';
import putMarksToBrsAutoAsync from './putMarksToBrsAutoAsync';
import * as readStudents from './readStudentsAsync';
import updateScoresFromUlearnAsync from './updateScoresFromUlearnAsync';

// runSample();

async function runSample() {
  await runCreateGroupsForSample();
  await runMoveStudentsForSample();
  await runUpdateScoresForSample();
  await runUpdateScoresComplexityForSample();
}

async function runCreateGroupsForSample() {
  const groupNames = ['КФ-180001-1'];
  const courseId = 'basicprogramming';
  const reviewMode = 'all';
  await createGroupsAsync(courseId, groupNames, ['homework'], reviewMode);
}

async function runMoveStudentsForSample() {
  try {
    const actualStudents = readStudents.fromCvs(
      './data/students.csv',
      false,
      2,
      0
    );
    await moveStudentsAsync(
      'basicprogramming',
      'Регистрация КрутойФакультет, 2018',
      actualStudents,
      {
        verbosity: 'all',
      }
    );
  } catch (e) {
    console.log(e);
  }
}

async function runUpdateScoresForSample() {
  const spreadsheetId = '';
  const readRange = 'ОП!A2:E';
  const writeRange = 'ОП!A2:E';
  const updateTimeRange = 'ОП!G1';
  const courseId = 'basicprogramming';
  const groupNames = ['КФ-180001-1'];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    false,
    'ask-if-not-saved'
  );
  console.log(result);
}

async function runUpdateScoresComplexityForSample() {
  const spreadsheetId = '';
  const readRange = 'ОСА!A2:E';
  const writeRange = 'ОСА!A2:E';
  const updateTimeRange = 'ОСА!G1';
  const courseId = 'complexity';
  const groupNames = ['КФ-180001-1 (Пример)'];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    false,
    'ask-if-not-saved'
  );
  console.log(result);
}

async function runPutMarksForSample() {
  const actualStudents = readStudents.fromCvs(
    './data/students2.csv',
    true,
    1,
    0
  );

  // Подсказка: 0.Группа, 1.Фамилия и имя, 2.ЛР, 3.ДР1, 4.ДР2, 5.ДР3, 6.КР, 7.Экзамен
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['Выполнение лабораторных работ и защита отчетов'],
      propertyIndex: 2,
    }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 0,
      matchCount: 3,
      propertyIndex: 3,
    }, // Упражнения
    {
      controlActions: ['домашняя работа'],
      matchIndex: 1,
      matchCount: 3,
      propertyIndex: 4,
    }, // Упражнения
    {
      controlActions: ['домашняя работа'],
      matchIndex: 2,
      matchCount: 3,
      propertyIndex: 5,
    }, // Упражнения
    {
      controlActions: ['контрольная работа'],
      propertyIndex: 6,
    }, // Упражнения
    {
      controlActions: ['экзамен'],
      propertyIndex: 7,
    }, // Экзамен
  ];

  const disciplineConfig = {
    name: 'Крутой курс по программированию',
    isModule: false,
    year: 2018,
    termType: TermType.Spring,
    course: 1,
  } as DisciplineConfig;

  await putMarksToBrsManualAsync(
    'username-from-brs.json',
    { actualStudents, disciplineConfig, controlActionConfigs },
    {
      save: true,
      verbose: true,
      failureForSkipped: false,
    }
  );
}

async function runPutMarksAutoForSample() {
  const secretName = 'username-from-brs.json';
  // Пример таблицы для автоматической конфигурации
  // https://docs.google.com/spreadsheets/d/1Owzl3JfmFASIdC7ZMMw-0kkA3pwFSab1QdVO5dhZoxY/edit?usp=sharing
  const spreadsheetId = '1Owzl3JfmFASIdC7ZMMw-0kkA3pwFSab1QdVO5dhZoxY';
  const sheetName = 'БРС';
  await putMarksToBrsAutoAsync(
    secretName,
    spreadsheetId,
    sheetName,
    {
      save: true,
      verbose: true,
      failureForSkipped: false,
    },
    (discipline) => discipline.group !== 'BAD-140934'
  );
}
