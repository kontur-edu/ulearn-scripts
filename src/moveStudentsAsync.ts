import * as ulearnApi from './apis/ulearnApi';
import { Group, Student } from './apis/ulearnApi';
import * as fio from './helpers/fio';
import { ActualStudent } from './readStudentsAsync';

export default async function moveStudentsAsync(
  courseId: string,
  sourceGroupName: string,
  actualStudents: ActualStudent[]
) {
  const ulearnGroups = await ulearnApi.getGroupsAsync(courseId);
  const targetGroups = findTargetGroups(ulearnGroups, actualStudents);
  const sourceGroup = findGroupByName(ulearnGroups, sourceGroupName);

  const students = await ulearnApi.getStudentsAsync(sourceGroup.id);
  for (const student of students) {
    await moveStudentAsync(student, sourceGroup, targetGroups, actualStudents);
  }
}

async function moveStudentAsync(
  student: Student,
  sourceGroup: Group,
  targetGroups: Group[],
  actualStudents: ActualStudent[]
) {
  const fullName = getFullName(student);
  console.log(`>>> '${fullName}' processing...`);

  const suitableActualStudents = actualStudents.filter(
    s => fio.toKey(s.fullName) === fio.toKey(fullName)
  );
  if (suitableActualStudents.length !== 1) {
    console.log(
      `    '${fullName}' was skipped,` +
        ` because was founded ${suitableActualStudents.length} times` +
        ` in the actual list`
    );
    return;
  }
  const actualStudent = suitableActualStudents[0];

  const targetGroup = findGroupByName(targetGroups, actualStudent.groupName);

  if (targetGroup.id === sourceGroup.id) {
    console.log(`    Source and target groups match ('${targetGroup.name}')`);
    return;
  }

  if (await isGroupContainsStudentAsync(targetGroup, student)) {
    console.log(
      ` 1) '${fullName}' had been already exist at '${targetGroup.name}'`
    );
  } else {
    await ulearnApi.copyStudentsToGroup([student.id], targetGroup.id);
    console.log(
      ` 1) '${fullName}' was copied from '${sourceGroup.name}'` +
        ` to '${targetGroup.name}'`
    );
  }
  if (await isGroupContainsStudentAsync(targetGroup, student)) {
    await ulearnApi.deleteStudentAsync(sourceGroup.id, student.id);
    console.log(` 2) '${fullName}' was removed from '${sourceGroup.name}'`);
  } else {
    console.log(
      ` 2) '${fullName}' was not removed` +
        ` from '${sourceGroup.name}',` +
        ` because not found at '${targetGroup.name}'`
    );
  }
}

function findTargetGroups(
  ulearnGroups: Group[],
  actualStudents: ActualStudent[]
) {
  const actualGroups: { [groupName: string]: boolean } = {};
  for (const student of actualStudents) {
    actualGroups[student.groupName] = true;
  }

  const result = [];
  for (const groupName of Object.keys(actualGroups)) {
    result.push(findGroupByName(ulearnGroups, groupName));
  }
  return result;
}

function findGroupByName(ulearnGroups: Group[], groupName: string) {
  const suitableGroups = ulearnGroups.filter(g => g.name === groupName);
  if (suitableGroups.length !== 1) {
    throw new Error(`Can't find single group '${groupName}' at ulearn`);
  }
  return suitableGroups[0];
}

async function isGroupContainsStudentAsync(group: Group, student: Student) {
  if (student.id) {
    const students = await ulearnApi.getStudentsAsync(group.id);
    return students.some(s => s.id === student.id);
  }
  return false;
}

function getFullName(student: Student) {
  const { lastName, firstName, visibleName } = student;
  return lastName || firstName
    ? `${lastName.trim()} ${firstName.trim()}`
    : visibleName;
}
