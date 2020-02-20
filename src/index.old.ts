import { TermType, StudentFailure } from './apis/brsApi';
import createGroupsAsync from './createGroupsAsync';
import copyGroupsAsync from './copyGroupsAsync';
import moveStudentsAsync from './moveStudentsAsync';
import putMarksToBrsAsync from './putMarksToBrsAsync';
import putMarksToBrsAutoAsync from './putMarksToBrsAutoAsync';
import { ControlActionConfig } from './putMarksToBrsAsync';
import * as readStudents from './readStudentsAsync';
import updateScoresFromUlearnAsync from './updateScoresFromUlearnAsync';

const rtf2019GroupNames = [
  'РТФ.2019 П1.1 ЛБ-01',
  'РТФ.2019 П1.1 ЛБ-02',
  'РТФ.2019 П1.1 ЛБ-03',
  'РТФ.2019 П1.1 ЛБ-04',
  'РТФ.2019 П1.1 ЛБ-05',
  'РТФ.2019 П1.1 ЛБ-06',
  'РТФ.2019 П1.1 ЛБ-07',
  'РТФ.2019 П1.1 ЛБ-08',
  'РТФ.2019 П1.1 ЛБ-09',
  'РТФ.2019 П1.1 ЛБ-10',
  'РТФ.2019 П1.1 ЛБ-11',
  'РТФ.2019 П1.1 ЛБ-12',
  'РТФ.2019 П1.1 ЛБ-13',
  'РТФ.2019 П1.1 ЛБ-14',
  'РТФ.2019 П1.1 ЛБ-15',
  'РТФ.2019 П1.1 ЛБ-16',
  'РТФ.2019 П1.1 ЛБ-17',
  'РТФ.2019 П1.1 ЛБ-18',
  'РТФ.2019 П1.1 ЛБ-19',
  'РТФ.2019 П1.1 ЛБ-20',
  'РТФ.2019 П1.1 ЛБ-21',
  'РТФ.2019 П1.1 ЛБ-22',
  'РТФ.2019 П1.1 ЛБ-23',
  'РТФ.2019 П1.1 ЛБ-24',
  'РТФ.2019 П1.1 ЛБ-25',
  'РТФ.2019 П1.1 ЛБ-26',
  'РТФ.2019 П2.1 ЛБ-01',
  'РТФ.2019 П2.1 ЛБ-02',
  'РТФ.2019 П2.1 ЛБ-03',
  'РТФ.2019 П2.1 ЛБ-04',
  'РТФ.2019 П2.1 ЛБ-05',
  'РТФ.2019 П2.1 ЛБ-06',
  'РТФ.2019 П2.1 ЛБ-07',
  'РТФ.2019 П2.1 ЛБ-08',
];

const rtf2019SpreadsheetId = '14t9k-9CLIY0Q7wOGyi9vGITTDl3UFvEDSkF-5TV6CrU';

const rtf2018GroupNames = [
  'РИ-180001 (ИВТ)',
  'РИ-180002-1 (ИВТ)',
  'РИ-180002-2 (ИВТ)',
  'РИ-180003-1 (ИВТ)',
  'РИ-180003-2 (ИВТ)',
  'РИ-180017 (ИВТ)',
];

const rtf2018SpreadsheetId = '1PE16nf_c3LlBMbUUtC4XTnzoUubAWEOIcHEfMjKdl8g';

run();

async function run() {
  //await runPutMarksAuto_OPD();
  //await runMoveAllStudents();

  // console.log('#runCreateGroups');
  // await runCreateGroups();
  // console.log();

  // console.log('#runMoveStudents');
  // await runMoveStudents();
  // console.log();

  // console.log('#runUpdateScores2019');
  // await runUpdateScores2019();
  // console.log();

  // console.log('#runUpdateScoresComplexity2019');
  // await runUpdateScoresComplexity2019();
  // console.log();

  // console.log('#runUpdateScores2018');
  // await runUpdateScores2018();
  // console.log();

  // console.log('#runPutMarksBP12019_1');
  // await runPutMarksBP12019_1();
  // console.log();

  // console.log('#runPutMarksBP12019_2');
  // await runPutMarksBP12019_2();
  // console.log();

  //await runPutMarks2018_1();
  //await runPutMarks2018_2();

  await runPutMarksAuto_Web();
}

async function runCreateGroups() {
  const groupNames = rtf2019GroupNames;
  const courseId = 'basicprogramming';
  const reviewMode = 'all';
  await createGroupsAsync(courseId, groupNames, ['homework'], reviewMode);
}

async function runCopyGroups() {
  const groupNames = rtf2019GroupNames;
  const courseId = 'basicprogramming';
  const destinationCourseId = 'complexity';

  await copyGroupsAsync(
    courseId,
    groupNames,
    destinationCourseId,
    null,
    true,
    [],
    'no'
  );
}

async function runMoveStudents() {
  try {
    const actualStudents = await readStudents.fromSpreadsheetAsync(
      rtf2019SpreadsheetId,
      'Итого!A11:B',
      1,
      0,
      null,
      'ask-if-not-saved'
    );
    await moveStudentsAsync(
      'basicprogramming',
      'Регистрация ИРИТ-РтФ 2019',
      actualStudents,
      { verbosity: 'all' }
    );
  } catch (e) {
    console.log(e);
  }
}

async function runMoveAllStudents() {
  try {
    const actualStudents = await readStudents.fromSpreadsheetAsync(
      rtf2019SpreadsheetId,
      'Итого!A11:B',
      1,
      0,
      null,
      'ask-if-not-saved'
    );
    for (const group of rtf2019GroupNames) {
      await moveStudentsAsync('basicprogramming', group, actualStudents, {
        verbosity: 'just-moves',
      });
      await moveStudentsAsync('complexity', group, actualStudents, {
        verbosity: 'just-moves',
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function runUpdateScores2019() {
  const spreadsheetId = rtf2019SpreadsheetId;
  const readRange = 'ОП!A2:E';
  const writeRange = 'ОП!A2:E';
  const updateTimeRange = 'ОП!G1';
  const courseId = 'basicprogramming';
  const groupNames = rtf2019GroupNames;
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

async function runUpdateScoresComplexity2019() {
  const spreadsheetId = rtf2019SpreadsheetId;
  const readRange = 'ОСА!A2:E';
  const writeRange = 'ОСА!A2:E';
  const updateTimeRange = 'ОСА!G1';
  const courseId = 'complexity';
  const groupNames = rtf2019GroupNames;
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

async function runUpdateScores2018() {
  const spreadsheetId = rtf2018SpreadsheetId;
  const readRange = 'ОП!A2:E';
  const writeRange = 'ОП!A2:E';
  const updateTimeRange = 'ОП!G1';
  const courseId = 'basicprogramming2';
  const groupNames = rtf2018GroupNames;
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

async function runPutMarks2018_1() {
  const spreadsheetId = rtf2018SpreadsheetId;
  const readRange = 'БРС.ООП!E2:K';

  const allActualStudents = await readStudents.fromSpreadsheetAsync(
    spreadsheetId,
    readRange,
    1,
    0,
    null,
    'ask-if-not-saved'
  );
  const actualStudents = allActualStudents.filter(
    s => true
    //s.groupName.startsWith('РИ-280001') || s.groupName.startsWith('РИ-280003')
  );

  // Подсказка: 0.Группа, 1.Фамилия и имя, 2.ЛР, 3.ДР1, 4.ДР2, 5.КР, 6.Экзамен
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['выполнение работ и защита отчетов\n'],
      propertyIndex: 2,
    }, // Упражнения
    {
      controlActions: ['домашняя работа'],
      matchIndex: 0,
      matchCount: 2,
      propertyIndex: 3,
    }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 1,
      matchCount: 2,
      propertyIndex: 4,
    }, // Практики и активности
    {
      controlActions: ['контрольная работа'],
      propertyIndex: 5,
    }, // Практики и активности
    {
      controlActions: ['экзамен'],
      propertyIndex: 6,
    }, // Экзамен
  ];

  await putMarksToBrsAsync(
    'domashnikh',
    actualStudents,
    {
      name: 'Объектно-ориентированное программирование',
      isModule: false,
      year: 2019,
      course: 2,
      termType: TermType.Fall,
    },
    controlActionConfigs,
    {
      save: true,
      verbose: true,
      justFirstGroup: false,
      failureForSkipped: false,
    }
  );
}

async function runPutMarks2018_2() {
  const spreadsheetId = rtf2018SpreadsheetId;
  const readRange = 'БРС.СД!E2:M';

  const allActualStudents = await readStudents.fromSpreadsheetAsync(
    spreadsheetId,
    readRange,
    1,
    0,
    null,
    'ask-if-not-saved'
  );
  const actualStudents = allActualStudents.filter(
    s => true
    //s.groupName.startsWith('РИ-280001') || s.groupName.startsWith('РИ-280003')
  );

  // Подсказка: 0.Группа, 1.Фамилия и имя, 2.ЛР, 3.ДР1, 4.ДР2, 5.ДР3, 6.ДР4, 7.ПП, 8.Зачет
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['Выполнение работ и защита отчетов'],
      propertyIndex: 2,
    }, // Упражнения
    {
      controlActions: ['домашняя работа'],
      matchIndex: 0,
      matchCount: 4,
      propertyIndex: 3,
    }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 1,
      matchCount: 4,
      propertyIndex: 4,
    }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 2,
      matchCount: 4,
      propertyIndex: 5,
    }, // Практики и активности
    {
      controlActions: ['домашняя работа'],
      matchIndex: 3,
      matchCount: 4,
      propertyIndex: 6,
    }, // Практики и активности
    {
      controlActions: ['программный продукт'],
      propertyIndex: 7,
    }, // Практики и активности
    {
      controlActions: ['зачет'],
      propertyIndex: 8,
    }, // Зачет
  ];

  await putMarksToBrsAsync(
    'domashnikh',
    actualStudents,
    {
      name: 'Структуры данных',
      isModule: false,
      year: 2019,
      course: 2,
      termType: TermType.Fall,
    },
    controlActionConfigs,
    {
      save: true,
      verbose: true,
      justFirstGroup: false,
      failureForSkipped: false,
    }
  );
}

/*
лабораторные занятия
    Текущая аттестация - 0.5
      домашняя работа №1 - 35 (практики)
      домашняя работу №2 - 35 (практики)
      контрольная работа - 30 (активности)
    Промежуточная аттестация - 0.5
      экзамен - 100 (упражнения + экзамен)
*/
// ТА * 0.5: ДР1 (max 35)(сопоставить практики) ДР2 (max 35)(сопоставить практики) КР(max 30)(сопоставить активности)
// ПА * 0.5: экзамен (max 100)(сопоставить упражнения плюс итоговую работу)
async function runPutMarksBP12019_1() {
  const spreadsheetId = rtf2019SpreadsheetId;
  const readRange = 'БРС!E2:J';

  const allActualStudents = await readStudents.fromSpreadsheetAsync(
    spreadsheetId,
    readRange,
    1,
    0,
    null,
    'ask-if-not-saved'
  );
  const actualStudents = allActualStudents.filter(s =>
    s.groupName.startsWith('Программирование 1 уровень')
  );

  // Подсказка: 0.Группа БРС, 1.Фамилия Имя БРС, 2.ДР1, 3.ДР2, 4.КР, 5.Экзамен,
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['домашняя работа №1'],
      propertyIndex: 2,
    },
    {
      controlActions: ['домашняя работу №2'],
      propertyIndex: 3,
    },
    {
      controlActions: ['контрольная работа'],
      propertyIndex: 4,
    },
    {
      controlActions: ['экзамен'],
      propertyIndex: 5,
    },
  ];

  await putMarksToBrsAsync(
    'shadrin',
    actualStudents,
    {
      name: 'Программирование 1 уровень 1 семестр',
      isModule: true,
      year: 2019,
      course: 1,
      termType: TermType.Fall,
    },
    controlActionConfigs,
    {
      save: true,
      verbose: true,
      justFirstGroup: false,
      failureForSkipped: false,
    }
  );
}

async function runPutMarksBP12019_2() {
  const spreadsheetId = rtf2019SpreadsheetId;
  const readRange = 'БРС!E2:J';

  const allActualStudents = await readStudents.fromSpreadsheetAsync(
    spreadsheetId,
    readRange,
    1,
    0,
    null,
    'ask-if-not-saved'
  );
  const actualStudents = allActualStudents.filter(s =>
    s.groupName.startsWith('Программирование 2 уровень')
  );

  // Подсказка: 0.Группа БРС, 1.Фамилия Имя БРС, 2.ДР1, 3.ДР2, 4.КР, 5.Экзамен,
  const controlActionConfigs: ControlActionConfig[] = [
    {
      controlActions: ['домашняя работа №1'],
      propertyIndex: 2,
    },
    {
      controlActions: ['домашняя работа №2'],
      propertyIndex: 3,
    },
    {
      controlActions: ['контрольная работа'],
      propertyIndex: 4,
    },
    {
      controlActions: ['экзамен'],
      propertyIndex: 5,
    },
  ];

  await putMarksToBrsAsync(
    'shadrin',
    actualStudents,
    {
      name: 'Программирование 2 уровень 1 семестр',
      isModule: true,
      year: 2019,
      course: 1,
      termType: TermType.Fall,
    },
    controlActionConfigs,
    {
      save: false,
      verbose: true,
      justFirstGroup: false,
      failureForSkipped: false,
    }
  );
}

async function runPutMarksAuto_Web() {
  const secretName = 'egorov';
  const spreadsheetId = '1mt3kXGLyqicgHqpDcUjDbnSDu44e8tugk-yJh73oaks';
  const sheetName = 'БРС';
  await putMarksToBrsAutoAsync(secretName, spreadsheetId, sheetName, {
    save: true,
    verbose: true,
    justFirstGroup: false,
    failureForSkipped: StudentFailure.NotChosen,
  });
}

async function runPutMarksAuto_OPD() {
  const secretName = 'egorov';
  const spreadsheetId = '18Lot4ZaGETCV8NwtfTrzu3M5HRJz5ekeMzLx1QNPPpo';
  const sheetName = 'БРС';
  await putMarksToBrsAutoAsync(secretName, spreadsheetId, sheetName, {
    save: true,
    verbose: true,
    justFirstGroup: false,
    failureForSkipped: false,
  });
}
