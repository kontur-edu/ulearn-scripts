import * as ulearnApi from './apis/ulearnApi';
import { Group } from './apis/ulearnApi';
import { findGroupByName } from './helpers/ulearnTools';
import { ActualStudent } from './readStudentsAsync';
import moveStudentAsync, { MoveStudentOptions } from './moveStudentAsync';

export default async function moveAllStudentsAsync(
  courseId: string,
  actualStudents: ActualStudent[],
  additionalSourceGroupNames: string[],
  options: MoveStudentOptions
) {
  const ulearnGroups = await ulearnApi.getGroupsAsync(courseId);
  const targetGroups = findTargetGroups(ulearnGroups, actualStudents);
  const sourceGroups = findSourceGroups(
    ulearnGroups,
    targetGroups,
    additionalSourceGroupNames
  );

  for (const sourceGroup of sourceGroups) {
    await moveStudentsFrom(sourceGroup, targetGroups, actualStudents, options);
  }
}

async function moveStudentsFrom(
  sourceGroup: ulearnApi.Group,
  targetGroups: ulearnApi.Group[],
  actualStudents: ActualStudent[],
  options: MoveStudentOptions
) {
  const students = await ulearnApi.getStudentsAsync(sourceGroup.id);
  for (const student of students) {
    await moveStudentAsync(
      student,
      sourceGroup,
      targetGroups,
      actualStudents,
      options
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
  return Object.keys(actualGroups).map(groupName =>
    findGroupByName(ulearnGroups, groupName)
  );
}

function findSourceGroups(
  ulearnGroups: Group[],
  targetGroups: Group[],
  sourceGroupNames: string[]
): Group[] {
  const groups: { [id: string]: Group } = {};
  for (const g of targetGroups) {
    groups[g.id] = g;
  }
  for (const groupName of sourceGroupNames) {
    const g = findGroupByName(ulearnGroups, groupName);
    groups[g.id] = g;
  }

  return Object.keys(groups).map(id => groups[id]);
}
