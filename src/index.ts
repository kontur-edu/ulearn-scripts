import { TermType } from './apis/brsApi';
import moveStudentsAsync from './moveStudentsAsync';
import putMarksToBrsAsync from './putMarksToBrsAsync';
import { ControlActionConfig } from './putMarksToBrsAsync';
import * as readStudents from './readStudentsAsync';
import updateScoresFromUlearnAsync from './updateScoresFromUlearnAsync';

// runSample();

async function runSample() {
  await runUpdateScoresForSample();
  await runUpdateScoresComplexityForSample();
  await runMoveStudentsForSample();
}

async function runUpdateScoresForSample() {
  const spreadsheetId = '';
  const readRange = 'ОП!A2:E';
  const writeRange = 'ОП!A2:E';
  const updateTimeRange = 'ОП!G1';
  const courseId = 'basicprogramming';
  const groupNames = [
    'КФ-180001-1',
  ];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
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
  const groupNames = [
    'КФ-180001-1 (Пример)',
  ];
  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    'ask-if-not-saved'
  );
  console.log(result);
}

async function runMoveStudentsForSample() {
  try {
    const actualStudents = readStudents.fromCvs(
      './data/students.csv',
      false,
      2,
      0,
    );
    await moveStudentsAsync(
      'basicprogramming',
      'Регистрация КрутойФакультет, 2018',
      actualStudents
    );
  } catch (e) {
    console.log(e);
  }
}

async function runPutMarksForSample() {
  const actualStudents = readStudents.fromCvs(
    './data/students2.csv',
    true,
    1,
    0,
  );

  // Подсказка: 0.Группа, 1.Фамилия и имя, 2.ЛР, 3.ДР1, 4.ДР2, 5.ДР3, 6.КР, 7.Экзамен
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['Выполнение лабораторных работ и защита отчетов'],
      propertyIndex: 2
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
      propertyIndex: 4
    }, // Упражнения
    {
      controlActions: ['домашняя работа'],
      matchIndex: 2,
      matchCount: 3,
      propertyIndex: 5
    }, // Упражнения
    {
      controlActions: ['контрольная работа'],
      propertyIndex: 6
    }, // Упражнения
    {
      controlActions: ['экзамен'],
      propertyIndex: 7
    }, // Экзамен
  ];

  await putMarksToBrsAsync(
    'username-from-brs.json',
    actualStudents,
    'Крутой курс по программированию',
    2018,
    1,
    TermType.Spring,
    controlActionConfigs,
    { save: true, verbose: true, justFirstGroup: false }
  );
}
