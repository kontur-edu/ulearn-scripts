import createGroupsAsync from './createGroupsAsync';
import copyGroupsAsync from './copyGroupsAsync';
import moveAllStudentsAsync from './moveAllStudentsAsync';
import putMarksToBrsAutoAsync from './putMarksToBrsAutoAsync';
import * as readStudents from './readStudentsAsync';
import updateScoresFromUlearnAsync from './updateScoresFromUlearnAsync';
import buildAutoMarksConfigAsync from './buildAutoMarksConfigAsync';
import * as googleApi from './apis/googleApi';
import * as itsApi from './apis/itsApi';
import * as teamProjectApi from './apis/teamProjectApi';
import JustDate from './helpers/JustDate';

const rtfSpreadsheetPart1Id = '1Hjr4diSXOt-QuF0xU2WXjlGZ4hr8P_Ffiur7y_Be5jA';
const rtfSpreadsheetPart2Id = '1zRwQ_kK6Go8ecj42SpntZELDcseOoU9jAgRaR7Kvjx4';

const rtfPart1Groups = [
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-01',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-02',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-03',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-04',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-05',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-06',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-07',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-08',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-09',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-10',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-11',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-12',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-13',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-14',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-15',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-16',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-17',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-18',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-19',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-20',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-21',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-22',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-23',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-24',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-25',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-26',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-27',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-28',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-29',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-30',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-31',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-32',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-33',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-34',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-35',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-36',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-37',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-38',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-39',
  'РТФ.2021 Пр.Ч1.У1 ЛБ, К, АТ-40',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-01',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-02',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-03',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-04',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-05',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-06',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-07',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-08',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-09',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-10',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-11',
  'РТФ.2021 Пр.Ч1.У2 ЛБ, К, АТ-12',
];

const rtfPart2Groups = [
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-01',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-02',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-03',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-04',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-05',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-06',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-07',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-08',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-09',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-10',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-11',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-12',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-13',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-14',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-15',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-16',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-17',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-18',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-19',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-20',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-21',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-22',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-23',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-24',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-25',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-26',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-27',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-28',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-29',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-30',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-31',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-32',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-33',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-34',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-35',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-36',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-37',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-38',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-39',
  'РТФ.2021 Пр.Ч2.У1 ЛБ, К, АТ-40',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-01',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-02',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-03',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-04',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-05',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-06',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-07',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-08',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-09',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-10',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-11',
  'РТФ.2021 Пр.Ч2.У2 ЛБ, К, АТ-12',
];

const mapping: { [key: string]: string } = {};
for (let i = 0; i < rtfPart1Groups.length; i++) {
  mapping[rtfPart1Groups[i]] = rtfPart2Groups[i];
}

run();

async function run() {
  // await runTeamProject();
  // await runIts();

  // console.log('START  runCreateGroups');
  // await runCreateGroups();
  // console.log('FINISH runCreateGroups');

  // console.log('START  runCopyGroupsToComplexity');
  // await runCopyGroupsToComplexity();
  // console.log('FINISH runCopyGroupsToComplexity');

  // console.log('START  runCopyGroups');
  // await runCopyGroups();
  // console.log('FINISH runCopyGroups');

  console.log('START  runMoveStudents');
  await runMoveStudents();
  console.log('FINISH runMoveStudents');

  console.log('START  runUpdateScores');
  await runUpdateScores();
  console.log('FINISH runUpdateScores');

  // console.log('!!!');
  // await runPutMarksAutoRtfOpd();
  // console.log('!!!');
}

async function runTeamProject() {
  let save = true;

  const it1start = new JustDate(2022, 4, 1);
  const it1end = new JustDate(2022, 4, 30);
  const it2start = new JustDate(2022, 5, 1);
  const it2end = new JustDate(2022, 5, 27);

  await teamProjectApi.authAsync(
    'JWT token'
  );

  const projects = (
    await teamProjectApi.getActiveProjectsAsync(2021, 2, 1, 100)
  ).items;
  const gameProjects = projects.filter(
    (it) => it.project_name === 'Компьютерная игра'
  );
  for (const gameProject of gameProjects) {
    console.log(
      '# Проект',
      gameProject.project_name,
      gameProject.instance_number
    );

    const iterations = (await teamProjectApi.getIterationsAsync(gameProject.id))
      .items;

    if (iterations.length === 0) {
      console.log('Добавление итераций...');
      if (save) {
        const r1 = await teamProjectApi.postIterationAsync(
          gameProject.id,
          'Апрельский спринт',
          '',
          it1start,
          it1end
        );
        console.log(r1);
        const r2 = await teamProjectApi.postIterationAsync(
          gameProject.id,
          'Майский спринт',
          '',
          it2start,
          it2end
        );
        console.log(r2);
      }
    } else {
      console.log('Итерации проекта:');
      for (const iteration of iterations) {
        console.log(
          '- ',
          iteration.title,
          iteration.date_begin,
          iteration.date_end
        );
        if (
          iteration.title === 'Апрельский спринт' &&
          (!iteration.date_begin || !iteration.date_end)
        ) {
          console.log('  Обновление... ', iteration.title);
          iteration.date_begin = it1start.toDashedString();
          iteration.date_end = it1end.toDashedString();
          if (save) {
            const updatedIteration = await teamProjectApi.putIterationAsync(
              gameProject.id,
              iteration
            );
            console.log(
              '  обновлено: ',
              updatedIteration.title,
              updatedIteration.date_begin,
              updatedIteration.date_end
            );
          }
        } else if (
          iteration.title === 'Майский спринт' &&
          (!iteration.date_begin || !iteration.date_end)
        ) {
          console.log('  Обновление... ', iteration.title);
          iteration.date_begin = it2start.toDashedString();
          iteration.date_end = it2end.toDashedString();
          if (save) {
            const updatedIteration = await teamProjectApi.putIterationAsync(
              gameProject.id,
              iteration
            );
            console.log(
              '  обновлено: ',
              updatedIteration.title,
              updatedIteration.date_begin,
              updatedIteration.date_end
            );
          }
        }
      }
    }

    console.log();
  }
}

async function runIts() {
  await itsApi.authAsync('', '');
  const subgroups = (await itsApi.getProjectSubgroupsAsync('604')).data;
  const students = (await itsApi.getStudentsAsync(subgroups[0].Id, false)).data;

  const teams: { [key: string]: string[] } = {};
  teams['1'] = ['Виктор', 'Фаддей', 'Никита', 'Николай'];
  teams['2'] = ['Михаил', 'Матвей', 'Михаил'];
  teams['3'] = ['Михаил', 'Максим', 'Константин', 'Кирилл'];

  const save = true;
  let problemCount = 0;
  for (const key of Object.keys(teams)) {
    const team = teams[key];

    console.log('Команда', key);
    const g1 = subgroups.filter(
      (it) => it.Name === 'Компьютерная игра\\л' + key
    )[0];
    const form1 = await itsApi.getProjectSubgroupFormAsync(g1.Id);
    if (save) {
      form1.limit = 4;
      form1.teacherId = form1.teachers[0].id;
      try {
        const r1 = await itsApi.putProjectSubgroupFormAsync(form1);
        if (!r1) {
          problemCount++;
        }
      } catch (e) {
        problemCount++;
      }
    }

    const g2 = subgroups.filter(
      (it) => it.Name === 'Компьютерная игра\\экзамен\\' + key
    )[0];
    const form2 = await itsApi.getProjectSubgroupFormAsync(g2.Id);
    if (save) {
      form2.limit = 4;
      form2.teacherId = form2.teachers[0].id;
      try {
        const r2 = await itsApi.putProjectSubgroupFormAsync(form2);
        if (!r2) {
          problemCount++;
        }
      } catch (e) {
        problemCount++;
      }
    }

    const isGroupCorrect = !!(g1 && form1 && g2 && form2);
    console.log('С группой все хорошо?', isGroupCorrect);
    if (!isGroupCorrect) {
      problemCount++;
    }

    for (const studentName of team) {
      const student = students.filter(
        (it) => it.Surname + ' ' + it.Name === studentName
      )[0];
      console.log('- ', studentName, !!student);
      if (!student) {
        problemCount++;
      }
      if (save) {
        try {
          await itsApi.putStudentMembershipAsync(g1.Id, student.Id, true);
          await itsApi.putStudentMembershipAsync(g2.Id, student.Id, true);
        } catch (e) {
          problemCount++;
        }
      }
    }
    console.log();
  }
  console.log('Всего проблем:', problemCount);
}

async function runCreateGroups() {
  const groupNames = rtfPart1Groups;
  const courseId = 'basicprogramming';
  const reviewMode = 'all';

  await createGroupsAsync(courseId, groupNames, ['homework'], reviewMode);
}

async function runCopyGroups() {
  const groupNames = rtfPart1Groups;
  const courseId = 'basicprogramming';
  const destinationCourseId = 'basicprogramming2';

  await copyGroupsAsync(
    courseId,
    groupNames,
    destinationCourseId,
    (it) => mapping[it],
    true,
    ['game'],
    'all'
  );
}

async function runCopyGroupsToComplexity() {
  const groupNames = rtfPart1Groups;
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
      rtfSpreadsheetPart2Id,
      'Итого!H7:L',
      4, // fullName
      3, // groupName
      0, // ulearnId,
      null,
      'ask-if-not-saved'
    );

    await moveAllStudentsAsync(
      'basicprogramming2',
      actualStudents,
      [
        {
          courseId: 'basicprogramming',
          groupName: 'Регистрация ИРИТ-РТФ УрФУ 2021',
        },
      ],
      {
        verbosity: 'tries-and-moves',
      }
    );
  } catch (e) {
    console.log(e);
  }
}

async function runUpdateScores() {
  const spreadsheetId = rtfSpreadsheetPart2Id;
  const readRange = 'ОП!A2:H';
  const writeRange = 'ОП!A2:H';
  const updateTimeRange = 'ОП!J1';
  const courseId = 'basicprogramming2';
  const groupNames = rtfPart2Groups;
  const onlyMaxScoresForHomework = false;

  const result = await updateScoresFromUlearnAsync(
    spreadsheetId,
    readRange,
    writeRange,
    updateTimeRange,
    courseId,
    groupNames,
    onlyMaxScoresForHomework,
    'ask-if-not-saved'
  );
  console.log(result);
}

async function runUpdateScoresComplexity() {
  const spreadsheetId = rtfSpreadsheetPart1Id;
  const readRange = 'ОСА!A2:E';
  const writeRange = 'ОСА!A2:E';
  const updateTimeRange = 'ОСА!G1';
  const courseId = 'complexity';
  const groupNames = rtfPart1Groups;
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

async function runPutMarksAutoRtfOpd() {
  const secretName = 'shadrin';
  // Пример таблицы для автоматической конфигурации
  // https://docs.google.com/spreadsheets/d/1Owzl3JfmFASIdC7ZMMw-0kkA3pwFSab1QdVO5dhZoxY/edit?usp=sharing
  const spreadsheetId = '1DI6Z64suSse7ioQoVlLBEhcIrgBYpWF_XqgRPf4SdwU';
  const sheetName = 'БРС';
  await putMarksToBrsAutoAsync(
    secretName,
    spreadsheetId,
    sheetName,
    {
      save: true,
      verbose: true,
    },
    (discipline) => discipline.group !== 'BAD-140934'
  );
}
