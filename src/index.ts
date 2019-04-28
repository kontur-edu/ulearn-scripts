import { TermType } from './apis/brsApi';
import * as fileApi from './apis/fileApi';
import moveStudentsAsync from './moveStudentsAsync';
import putMarksToBrsAsync from './putMarksToBrsAsync';
import { ControlActionConfig } from './putMarksToBrsAsync';
import updateScoresFromUlearnAsync from './updateScoresFromUlearnAsync';

run();

async function run() {
  // await runUpdateScoresForSE();
  // await runUpdateScoresForIT();
  // await runUpdateScoresComplexityForIT();
}

async function runUpdateScoresForSE() {
  const spreadsheetId = '';
  const readRange = 'ОП!C2:G';
  const writeRange = 'ОП!C2:G';
  const updateTimeRange = 'ОП!I1';
  const courseId = 'basicprogramming2';
  const groupNames = [
    'РИ-180012-1 (ПрИнж)',
    'РИ-180012-2 (ПрИнж)',
    'РИ-180013-1 (ПрИнж)',
    'РИ-180013-2 (ПрИнж)',
    'РИ-180014-1 (ПрИнж)',
    'РИ-180014-2 (ПрИнж)',
    'РИ-180015-1 (ПрИнж)',
    'РИ-180015-2 (ПрИнж)',
    'РИ-180021-1 (ПрИнж)',
    'РИ-180021-2 (ПрИнж)',
    'РИ-180022-1 (ПрИнж)',
    'РИ-180022-2 (ПрИнж)',
    'РИ-180018-1 (ПрИнф)',
    'РИ-180018-2 (ПрИнф)',
    'РИ-180019-1 (ПрИнф)',
    'РИ-180019-2 (ПрИнф)',
    'РИ-180026-1 (ПрИнф)',
    'РИ-180026-2 (ПрИнф)',
  ];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    'ask'
  );
  console.log(result);
}

async function runUpdateScoresForIT() {
  const spreadsheetId = '';
  const readRange = 'ОП!A2:E';
  const writeRange = 'ОП!A2:E';
  const updateTimeRange = 'ОП!G1';
  const courseId = 'basicprogramming';
  const groupNames = [
    'РИ-180001-1 (ИВТ)',
    'РИ-180001-2 (ИВТ)',
    'РИ-180002-1 (ИВТ)',
    'РИ-180002-2 (ИВТ)',
    'РИ-180003-1 (ИВТ)',
    'РИ-180003-2 (ИВТ)',
    'РИ-180017-1 (ИВТ)',
    'РИ-180017-2 (ИВТ)',
  ];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    'ask'
  );
  console.log(result);
}

async function runUpdateScoresComplexityForIT() {
  const spreadsheetId = '';
  const readRange = 'ОСА!A2:E';
  const writeRange = 'ОСА!A2:E';
  const updateTimeRange = 'ОСА!G1';
  const courseId = 'complexity';
  const groupNames = [
    'РИ-180001-1 (ИВТ)',
    'РИ-180001-2 (ИВТ)',
    'РИ-180002-1 (ИВТ)',
    'РИ-180002-2 (ИВТ)',
    'РИ-180003-1 (ИВТ)',
    'РИ-180003-2 (ИВТ)',
    'РИ-180017-1 (ИВТ)',
    'РИ-180017-2 (ИВТ)',
  ];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    'ask'
  );
  console.log(result);
}

async function runMoveStudents() {
  try {
    const actualStudents = fileApi.readStudentsFromCsv(
      './data/students.csv',
      false,
      2,
      0,
      ','
    );
    await moveStudentsAsync(
      'basicprogramming',
      'Регистрация ИРИТ-РтФ, 2018, ИВТ',
      actualStudents
    );
  } catch (e) {
    console.log(e);
  }
}

async function runPutMarksForSE() {
  const actualStudents = fileApi.readStudentsFromCsv(
    './data/students2.csv',
    true,
    1,
    0,
    ','
  );

  // Подсказка: 0.Группа, 1.Фамилия Имя, 2.ДР4, 3.ЗЛР, 4.ДР3, 5.Экзамен
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['домашняя работа № 3', 'Домашняя работа №3'],
      propertyIndex: 4,
    }, // Упражнения 100*0.4*0.6 Лек/ТА
    // {
    //   controlActions: ['экзамен'],
    //   propertyIndex: 5
    // }, // Итоговая работа 100*0.6*0.6 Лек/ПА
    // {
    //   controlActions: ['домашняя работа № 4', 'Домашняя работа №4'],
    //   propertyIndex: 2
    // }, // Активности 20*0.4 Лаб/ТА
    // {
    //   controlActions: ['Защита лабораторных работ'],
    //   propertyIndex: 3
    // }, // Практики 80*0.4 Лаб/ТА
  ];

  await putMarksToBrsAsync(
    'shadrin',
    actualStudents,
    'Язык и технологии программирования',
    2018,
    1,
    TermType.Spring,
    controlActionConfigs,
    { save: false, verbose: true, justFirstGroup: false }
  );
}

async function runPutMarksForIT() {
  const actualStudents = fileApi.readStudentsFromCsv(
    './data/students2.csv',
    true,
    1,
    0,
    ','
  );

  // Подсказка: 0.Группа, 1.Фамилия и имя, 2.ЛР, 3.ДР1, 4.ДР2, 5.ДР3, 6.КР, 7.Экзамен
  const controlActionConfigs: ControlActionConfig[] = [
    // {
    //   controlActions: ['Выполнение лабораторных работ и защита отчетов'],
    //   propertyIndex: 2
    // }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 0,
      matchCount: 3,
      propertyIndex: 3,
    }, // Упражнения
    // {
    //   controlActions: ['домашняя работа'],
    //   matchIndex: 1,
    //   matchCount: 3,
    //   propertyIndex: 4
    // }, // Упражнения
    // {
    //   controlActions: ['домашняя работа'],
    //   matchIndex: 2,
    //   matchCount: 3,
    //   propertyIndex: 5
    // }, // Упражнения
    // {
    //   controlActions: ['контрольная работа'],
    //   propertyIndex: 6
    // }, // Упражнения
    // {
    //   controlActions: ['экзамен'],
    //   propertyIndex: 7
    // }, // Экзамен
  ];

  await putMarksToBrsAsync(
    'domashnikh',
    actualStudents,
    'Алгоритмизация и программирование',
    2018,
    1,
    TermType.Spring,
    controlActionConfigs,
    { save: true, verbose: true, justFirstGroup: false }
  );
}
