import * as ulearnApi from './apis/ulearnApi';
import { GroupInfo } from './apis/ulearnApi';
import { findGroupByName } from './helpers/ulearnTools';
import { ActualStudent } from './readStudentsAsync';
import moveStudentAsync, { MoveStudentOptions } from './moveStudentAsync';

export default async function moveAllStudentsAsync(
  courseId: string,
  actualStudents: ActualStudent[],
  additionalSourceGroupInfos: { courseId: string; groupName: string }[],
  options: MoveStudentOptions
) {
  const courseGroups = await ulearnApi.getGroupsAsync(courseId);
  const targetGroups = findTargetGroups(courseGroups, actualStudents);
  const additionalSourceGroups = await findAdditionalGroupsAsync(
    courseId,
    courseGroups,
    additionalSourceGroupInfos
  );
  const sourceGroups = mergeGroups(targetGroups, additionalSourceGroups);

  for (const sourceGroup of sourceGroups) {
    await moveStudentsFrom(sourceGroup, targetGroups, actualStudents, options);
  }
}

async function moveStudentsFrom(
  sourceGroup: ulearnApi.GroupInfo,
  targetGroups: ulearnApi.GroupInfo[],
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
  courseGroups: GroupInfo[],
  actualStudents: ActualStudent[]
) {
  const actualGroups: { [groupName: string]: boolean } = {};
  for (const student of actualStudents) {
    actualGroups[student.groupName] = true;
  }
  return Object.keys(actualGroups).map(groupName =>
    findGroupByName(courseGroups, groupName)
  );
}

async function findAdditionalGroupsAsync(
  courseId: string,
  courseGroups: GroupInfo[],
  additionalGroups: { courseId: string; groupName: string }[]
): Promise<GroupInfo[]> {
  let result: GroupInfo[] = [];
  for (const additionalGroup of additionalGroups) {
    const groups =
      additionalGroup.courseId === courseId
        ? courseGroups
        : await ulearnApi.getGroupsAsync(additionalGroup.courseId);
    result = result.concat(
      groups.filter(g => g.name === additionalGroup.groupName)
    );
  }
  return result;
}

function mergeGroups(groups1: GroupInfo[], groups2: GroupInfo[]): GroupInfo[] {
  const groups: { [id: string]: GroupInfo } = {};
  for (const g of groups1) {
    groups[g.id] = g;
  }
  for (const g of groups2) {
    groups[g.id] = g;
  }
  return Object.keys(groups).map(id => groups[id]);
}
