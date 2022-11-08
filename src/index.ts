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
import * as fio from './helpers/fio';
import JustDate from './helpers/JustDate';

const rtfSpreadsheetPart1Id = '1UWO2A5RBRjWjKRiskqplHw3-sUgiAdz8HgqCfmEo7aE';
// const rtfSpreadsheetPart2Id = '1zRwQ_kK6Go8ecj42SpntZELDcseOoU9jAgRaR7Kvjx4';

const rtfPart1Groups = [
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-01',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-02',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-03',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-04',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-05',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-06',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-07',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-08',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-09',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-10',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-11',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-12',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-13',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-14',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-15',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-16',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-17',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-18',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-19',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-20',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-21',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-22',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-23',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-24',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-25',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-26',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-27',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-28',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-29',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-30',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-31',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-32',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-33',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-34',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-35',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-36',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-37',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-38',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-39',
  'РТФ.2022 Пр.Ч1.У1 ЛБ, К, АТ-40',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-01',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-02',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-03',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-04',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-05',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-06',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-07',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-08',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-09',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-10',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-11',
  'РТФ.2022 Пр.Ч1.У2 ЛБ, К, АТ-12',
];

const rtfPart2Groups: string[] = [];

const mapping: { [key: string]: string } = {};
for (let i = 0; i < rtfPart1Groups.length; i++) {
  mapping[rtfPart1Groups[i]] = rtfPart2Groups[i];
}

run();

async function run() {
  // await runTeamProjectCreateIterations();
  // await runTeamProjectPutIterationMarks();
  // await runItsUsedApp();
  // await runItsDesignedApp();

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

  console.log('START  runUpdateScoresComplexity');
  await runUpdateScoresComplexity()
  console.log('FINISH runUpdateScoresComplexity');

  // console.log('!!!');
  // await runPutMarksAutoRtfOpd();
  // console.log('!!!');
}

// async function runTeamProjectPutIterationMarks() {
//   let save = true;
//   const iterationTitle = 'Майский спринт';
//   const projectName = 'Компьютерная игра';
//   const spreadsheetId = '1UbgK05lAgaw87ddn1Sbqtc7__UoteVSekGknKX0Izqw';
//   const teamProjectToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2NTQ1MzY2NDgsImV4cCI6MTY1NDU0MDI0OCwidXNlcklkIjo1Mjc3fQ.-FH1U0IQU8TONEXftCsvMTJ_LEWSd1I_1rSwQHDSkDk';
//   const scoreIndex = 6;

//   await googleApi.authorizeAsync('ask-if-not-saved');
//   const sheet = googleApi.openSpreadsheet(spreadsheetId);
//   const data = await sheet.readAsync('\'Оценки кураторов\'!A2:G');
//   const rows = data.values;
//   const scores: { teamNumber: number; studentName: string; score: number }[] =
//     [];
//   let lastTeamNumber = 0;
//   for (const row of rows) {
//     const teamNumber = row[4] ? parseInt(row[4], 0) : lastTeamNumber;
//     lastTeamNumber = teamNumber;
//     const studentName = row[2];
//     const score = parseInt(row[scoreIndex], 10);
//     scores.push({ teamNumber, studentName, score: score });
//   }

//   await teamProjectApi.authAsync(teamProjectToken);

//   const projects = (
//     await teamProjectApi.getActiveProjectsAsync(2021, 2, 1, 100)
//   ).items;
//   const suitableProjects = projects.filter(
//     (it) => it.project_name === projectName
//   );
//   for (const project of suitableProjects) {
//     console.log('# Проект', project.project_name, project.instance_number);

//     const iterations = (
//       await teamProjectApi.getIterationsAsync(project.id)
//     ).items.filter((it) => it.title === iterationTitle);
//     const iteration = iterations[0];
//     if (!iteration) {
//       console.log('  Итерация не найдена');
//     }

//     const estimations = await (
//       await teamProjectApi.getEstimationsAsync(project.id, iteration.id)
//     ).items;
//     for (const estimation of estimations) {
//       const suitableScores = scores.filter(
//         (it) =>
//           it.teamNumber === project.instance_number &&
//           areNamesLike(estimation.fullname, it.studentName)
//       );

//       if (suitableScores.length === 1) {
//         const newScore = suitableScores[0].score;
//         const currentScore = estimation.estimation.score;

//         if (isNaN(newScore)) {
//           console.log(
//             '  ',
//             estimation.fullname,
//             `: новая оценка не задана`
//           );
//         } else if (currentScore === newScore) {
//           console.log(
//             '  ',
//             estimation.fullname,
//             `: текущая оценка ${currentScore} совпадает с новой`
//           );
//         } else {
//           console.log(
//             '  ',
//             estimation.fullname,
//             `: текущая оценка ${currentScore}, новая оценка ${newScore}`
//           );
//           if (save) {
//             try {
//               await teamProjectApi.putEstimationAsync(
//                 project.id,
//                 iteration.id,
//                 estimation.id,
//                 {
//                   score: newScore,
//                   comment: null,
//                 }
//               );
//             } catch (error) {}
//           }
//         }
//       } else if (suitableScores.length === 0) {
//         console.log('  ', estimation.fullname, ': нет новой оценки');
//       } else {
//         console.log('  ', estimation.fullname, ': несколько новых оценок');
//       }
//     }

//     console.log();
//   }
// }

function areNamesLike(fullName: string, name: string) {
  const fullNameKey = fio.toKey(fullName);
  const nameKey = fio.toKey(name);
  return fullNameKey.startsWith(nameKey);
}

async function runTeamProjectCreateIterations() {
  let save = true;

  const it1start = new JustDate(2022, 11, 8);
  const it1end = new JustDate(2022, 11, 13);
  const it2start = new JustDate(2022, 11, 14);
  const it2end = new JustDate(2022, 12, 4);
  const it3start = new JustDate(2022, 12, 5);
  const it3end = new JustDate(2022, 12, 25);

  await teamProjectApi.authAsync(
    'JWT-token'
  );

  const projects = (
    await teamProjectApi.getActiveProjectsAsync(2022, 1, 1, 100)
  ).items;
  let filteredProjects = projects.filter(
    (it) => it.title.startsWith('Приложение')
  );

  for (const project of filteredProjects) {
    console.log('# Проект', project.title, project.instance_number);

    const iterations = (await teamProjectApi.getIterationsAsync(project.id))
      .items;

    if (iterations.length === 0) {
      console.log('Добавление итераций...');
      if (save) {
        const r1 = await teamProjectApi.postIterationAsync(
          project.id,
          'Первый спринт',
          '',
          it1start,
          it1end
        );
        console.log(r1);

        const r2 = await teamProjectApi.postIterationAsync(
          project.id,
          'Второй спринт',
          '',
          it2start,
          it2end
        );
        console.log(r2);

        const r3 = await teamProjectApi.postIterationAsync(
          project.id,
          'Третий спринт',
          '',
          it3start,
          it3end
        );
        console.log(r3);
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

        await tryUpdateIteration(
          iteration,
          'Первый спринт',
          it1start,
          it1end,
          project,
          save
        );
        await tryUpdateIteration(
          iteration,
          'Второй спринт',
          it2start,
          it2end,
          project,
          save
        );
        await tryUpdateIteration(
          iteration,
          'Третий спринт',
          it3start,
          it3end,
          project,
          save
        );
      }
    }

    console.log();
  }
}

async function tryUpdateIteration(
  iteration: teamProjectApi.Iteration,
  iterationName: string,
  startDate: JustDate,
  endDate: JustDate,
  project: teamProjectApi.Project,
  save: boolean
) {
  if (
    iteration.title === iterationName &&
    (!iteration.date_begin || !iteration.date_end)
  ) {
    console.log('  Обновление... ', iteration.title);
    iteration.date_begin = startDate.toDashedString();
    iteration.date_end = endDate.toDashedString();
    if (save) {
      const updatedIteration = await teamProjectApi.putIterationAsync(
        project.id,
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

async function runItsGame() {
  await itsApi.authAsync('', '');
  const subgroups = (await itsApi.getProjectSubgroupsAsync('604')).data;
  const students = (await itsApi.getStudentsAsync(subgroups[0].Id, false)).data;

  const teams: { [key: string]: string[] } = {};
  teams['1'] = ['Виктор', 'Фаддей', 'Никита', 'Николай'];
  teams['2'] = ['Михаил', 'Матвей', 'Михаил'];
  teams['3'] = ['Михаил', 'Максим', 'Константин', 'Кирилл'];

  await distributeStudentsToTeamsAsync(
    subgroups,
    'Компьютерная игра',
    null,
    teams,
    false
  );
}

async function runItsSample() {
  await itsApi.authAsync(
    'sessionInfo',
    'itsAuth'
  );
  const groupId = '1';
  const allSubgroups = (await itsApi.getProjectSubgroupsAsync(groupId)).data;
  const projectName = 'Приложение';

  const projects = [
    {
      // Куратор 1
      moduleId: '',
      teams: {
        ['1']: [
          'Фамилия Имя',
        ],
        ['2']: [
          'Фамилия Имя',
        ],
      },
    },
    {
      // Куратор 2
      moduleId: '',
      teams: {
        ['1']: [
          'Фамилия Имя',
        ],
      },
    },
  ];

  const save = false;
  let problemCount = 0;
  for (const project of projects) {
    problemCount += await distributeStudentsToTeamsAsync(
      allSubgroups,
      projectName,
      project.moduleId,
      project.teams,
      save
    );
  }

  console.log('Всего проблем:', problemCount);
}

async function distributeStudentsToTeamsAsync(
  allSubgroups: itsApi.ProjectSubgroup[],
  projectName: string,
  moduleId: string | null,
  teams: { [key: string]: string[] },
  save: boolean = false
) {
  console.log('# ' + projectName + (moduleId !== null ? ' ' + moduleId : ''));
  console.log();

  const projectSubgroups = allSubgroups.filter(
    (it) =>
      it.Name.startsWith(projectName) &&
      (moduleId === null || it.moduleId === moduleId)
  );

  const students = (
    await itsApi.getStudentsAsync(projectSubgroups[0].Id, false)
  ).data;

  let problemCount = 0;
  for (const key of Object.keys(teams)) {
    const team = teams[key];

    console.log('Команда', key);
    const g1 = projectSubgroups.filter(
      (it) => it.Name === projectName + '\\л' + key
    )[0];
    const form1 = await itsApi.getProjectSubgroupFormAsync(g1.Id);
    if (save) {
      form1.limit = 5;
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

    const g2 = projectSubgroups.filter(
      (it) => it.Name === projectName + '\\экзамен\\' + key
    )[0];
    const form2 = await itsApi.getProjectSubgroupFormAsync(g2.Id);
    if (save) {
      form2.limit = 5;
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
  console.log('Проблем по проекту:', problemCount);
  console.log();

  return problemCount;
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
      rtfSpreadsheetPart1Id,
      'Итого!H7:L',
      4, // fullName
      3, // groupName
      0, // ulearnId,
      null,
      'ask-if-not-saved'
    );

    await moveAllStudentsAsync(
      'basicprogramming',
      actualStudents,
      [
        {
          courseId: 'basicprogramming',
          groupName: 'Регистрация ИРИТ-РТФ УрФУ 2022',
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
  const spreadsheetId = rtfSpreadsheetPart1Id;
  const readRange = 'ОП!A2:H';
  const writeRange = 'ОП!A2:H';
  const updateTimeRange = 'ОП!J1';
  const courseId = 'basicprogramming';
  const groupNames = rtfPart1Groups;
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
  const readRange = 'ОСА!A2:H';
  const writeRange = 'ОСА!A2:H';
  const updateTimeRange = 'ОСА!J1';
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
