import * as googleApi from './apis/googleApi';
import { Spreadsheet } from './apis/googleApi';
import * as ulearnApi from './apis/ulearnApi';
import {
  ScoringGroup,
  ShortSlideInfo,
  GroupInfo,
  UserProgress,
} from './apis/ulearnApi';
import * as fio from './helpers/fio';
import { getFullName } from './helpers/ulearnTools';

export default async function updateScoresFromUlearn(
  spreadsheetId: string,
  readRange: string,
  writeRange: string,
  updateTimeRange: string,
  courseId: string,
  groupNames: string[],
  onlyMaxScoresForHomework: boolean,
  authorizePolicy: googleApi.AuthorizePolicy = 'ask-if-not-saved'
) {
  const studentScores = await getStudentScoresAsync(
    courseId,
    groupNames,
    onlyMaxScoresForHomework
  );

  await googleApi.authorizeAsync(authorizePolicy);
  const sheet = googleApi.openSpreadsheet(spreadsheetId);

  const result = await fillSheetWithScoresAsync(
    sheet,
    readRange,
    writeRange,
    studentScores
  );
  await sheet.writeAsync(updateTimeRange, [[new Date().toLocaleString()]]);
  return result;
}

async function fillSheetWithScoresAsync(
  sheet: Spreadsheet,
  readRange: string,
  writeRange: string,
  studentScores: StudentScores
) {
  const result = {
    found: 0,
    updated: 0,
    skipped: 0,
    appended: 0,
    total: 0,
  };

  const newRows = [];
  const oldRows = (await sheet.readAsync(readRange)).values || [];
  for (const oldRow of oldRows) {
    const id = oldRow[0];
    if (!studentScores[id]) {
      newRows.push(oldRow);
      result.skipped++;
    } else {
      const newRow = getRowByStudentScore(studentScores[id]);
      newRows.push(newRow);
      delete studentScores[id];

      let updated = false;
      for (let i = 0; i < newRow.length; i++) {
        if (!oldRow[i] || newRow[i].toString() !== oldRow[i].toString()) {
          updated = true;
          break;
        }
      }

      if (updated) {
        result.updated++;
      }
      result.found++;
    }
  }

  const restStudentScores = Object.keys(studentScores)
    .map((k) => studentScores[k])
    .sort((a, b) => {
      const c1 = a.groupName.localeCompare(b.groupName);
      return c1 !== 0 ? c1 : a.name.localeCompare(b.name);
    });
  for (const s of restStudentScores) {
    newRows.push(getRowByStudentScore(s));
    result.appended++;
  }

  await sheet.writeAsync(writeRange, newRows);

  result.total = newRows.length;
  return result;
}

function getRowByStudentScore(studentScore: StudentScore) {
  return [
    studentScore.id,
    studentScore.groupName,
    fio.toKey(studentScore.name),
    studentScore.scores.exercise,
    studentScore.scores.homework,
    studentScore.scores.game,
  ];
}

async function getStudentScoresAsync(
  courseId: string,
  groupNames: string[],
  onlyMaxScoresForHomework: boolean
) {
  const courseSlides = await getCourseSlidesAsync(courseId);

  const availableGroups = await ulearnApi.getGroupsAsync(courseId);
  const filteredGroups = availableGroups.filter((g) =>
    groupNames.some((n) => g.name === n)
  );

  const studentScores = await prepareEmptyStudentScoresAsync(filteredGroups);

  const studentIds = Object.keys(studentScores);
  const progress = await ulearnApi.readUserProgressBatchAsync(
    courseId,
    studentIds
  );

  for (const studentId of studentIds) {
    const studentProgress = progress.userProgress[studentId];
    if (studentProgress) {
      fillStudentScore(
        studentScores[studentId],
        studentProgress,
        courseSlides,
        onlyMaxScoresForHomework
      );
    }
  }

  return studentScores;
}

async function getCourseSlidesAsync(courseId: string) {
  const course = await ulearnApi.getCourseAsync(courseId);
  const courseSlides: { [slideId: string]: ShortSlideInfo } = {};
  for (const unit of course.units) {
    for (const slide of unit.slides) {
      courseSlides[slide.id] = slide;
    }
  }
  return courseSlides;
}

async function prepareEmptyStudentScoresAsync(groups: GroupInfo[]) {
  const result: StudentScores = {};
  for (const group of groups) {
    const students = await ulearnApi.getStudentsAsync(group.id);
    for (const s of students) {
      result[s.id] = {
        id: s.id,
        name: getFullName(s),
        groupId: group.id,
        groupName: group.name,
        scores: {
          activity: 0,
          exercise: 0,
          homework: 0,
          seminar: 0,
          game: 0,
        },
      };
    }
  }
  return result;
}

function fillStudentScore(
  studentScore: StudentScore,
  studentProgress: UserProgress,
  courseSlides: {
    [slideId: string]: ShortSlideInfo;
  },
  onlyMaxScoresForHomework: boolean
) {
  for (const slideId of Object.keys(studentProgress.visitedSlides)) {
    const score = studentProgress.visitedSlides[slideId].score;
    const slide = courseSlides[slideId];
    if (slide) {
      const { scoringGroup, maxScore } = slide;
      if (scoringGroup === 'homework') {
        if (!onlyMaxScoresForHomework || score === maxScore) {
          studentScore.scores[scoringGroup] += score;
        }
      } else {
        studentScore.scores[scoringGroup] += score;
      }
    }
  }
}

interface StudentScores {
  [id: string]: StudentScore;
}

interface StudentScore {
  id: string;
  name: string;
  groupId: number;
  groupName: string;
  scores: { [key in ScoringGroup]: number };
}
