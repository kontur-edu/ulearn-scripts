import 'bluebird';
import * as fs from 'fs';
import * as request from 'request-promise';

const token = fs.readFileSync('./secrets/ulearn.jwt', 'utf8');
const baseApiUrl = 'https://api.ulearn.me';

export async function getCourseAsync(courseId: string) {
  return requestApiJsonAsync<CourseInfo>(`/courses/${courseId}`);
}

export async function getGroupAsync(groupId: number) {
  return requestApiJsonAsync<GroupInfo>(`/groups/${groupId}`);
}

export async function getGroupsAsync(courseId: string) {
  return (
    await requestApiJsonAsync<{ groups: GroupInfo[] }>(
      `/groups?course_id=${courseId}`
    )
  ).groups;
}

export async function postGroupAsync(courseId: string, groupName: string) {
  return requestApiAsync<CreateGroupResponse>(`/groups?course_id=${courseId}`, {
    method: 'POST',
    body: {
      name: groupName,
    },
    json: true,
  });
}

export async function patchGroupAsync(
  groupId: number,
  patch: UpdateGroupParameters
) {
  return requestApiAsync<GroupInfo>(`/groups/${groupId}`, {
    method: 'PATCH',
    body: patch,
    json: true,
  });
}

export async function deleteGroupAsync(groupId: number) {
  return requestApiAsync<any>(`/groups/${groupId}`, {
    method: 'DELETE',
  });
}

export async function copyGroupAsync(
  groupId: number,
  destinationCourseId: string,
  makeMeOwner: boolean
) {
  return requestApiAsync<CopyGroupResponse>(
    `/groups/${groupId}/copy?destination_course_id=${destinationCourseId}&make_me_owner=${makeMeOwner}`,
    {
      method: 'POST',
      json: true,
    }
  );
}

export async function postGroupScoresAsync(
  groupId: number,
  scoringGroups: ScoringGroup[]
) {
  return requestApiAsync<any>(`/groups/${groupId}/scores`, {
    method: 'POST',
    body: {
      scores: scoringGroups,
    },
    json: true,
  });
}

export async function getStudentsAsync(groupId: number) {
  return (
    await requestApiJsonAsync<{ students: GroupStudentInfo[] }>(
      `/groups/${groupId}/students`
    )
  ).students.map((s) => s.user);
}

export async function postStudentAsync(groupId: number, studentId: string) {
  return requestApiAsync<any>(`/groups/${groupId}/students/${studentId}`, {
    method: 'POST',
  });
}

export async function deleteStudentAsync(groupId: number, studentId: string) {
  return requestApiAsync<any>(`/groups/${groupId}/students/${studentId}`, {
    method: 'DELETE',
  });
}

export async function copyStudentsToGroupAsync(
  studentIds: string[],
  toGroupId: number
) {
  return requestApiAsync<any>(`/groups/${toGroupId}/students`, {
    method: 'POST',
    body: {
      studentIds,
    },
    json: true,
  });
}

export async function readUserProgressBatchAsync(
  courseId: string,
  studentIds: string[]
) {
  return requestApiAsync<UsersProgressResponse>(`/userProgress/${courseId}`, {
    method: 'POST',
    body: {
      userIds: studentIds,
    },
    json: true,
  });
}

async function requestApiJsonAsync<T>(
  uri: string,
  options?: RequestOptions
): Promise<T> {
  const response = await requestApiAsync<string>(uri, options);
  return JSON.parse(response);
}

async function requestApiAsync<T>(
  uri: string,
  options?: RequestOptions
): Promise<T> {
  const response = await request({
    method: 'GET',
    ...options,
    url: baseApiUrl + uri,
    resolveWithFullResponse: true,
    simple: false,
    headers: { Authorization: 'Bearer ' + token },
  });
  const contentType = response.headers['content-type'];
  if (contentType !== undefined && contentType.startsWith('application/json')) {
    return response.body;
  } else {
    console.error(
      '>> Ulearn API error. Perhaps, you should update "ulearn.jwt" token'
    );
    return null;
  }
}

interface RequestOptions {
  method?: string;
  body?: object;
  json?: boolean;
}

type Status = 'ok' | 'error';
type Gender = 'male' | 'female';
type GroupAccessType = 'fullAccess' | 'owner';
type TimeString = string;

export interface GroupInfo {
  id: number;
  createTime: TimeString;
  name: string;
  isArchived: boolean;
  inviteHash: string;
  isInviteLinkEnabled: boolean;
  areYouStudent: boolean;
  isManualCheckingEnabled: boolean;
  isManualCheckingEnabledForOldSolutions: boolean;
  defaultProhibitFurtherReview: boolean;
  canStudentsSeeGroupProgress: boolean;
  studentsCount: number;
  owner: ShortUserInfo;
  accesses: [
    {
      user: ShortUserInfo;
      accessType: GroupAccessType;
      grantedBy: ShortUserInfo;
      grantTime: TimeString;
    }
  ];
  apiUrl: string;
  status: Status;
}

export interface CreateGroupResponse {
  id: number;
  apiUrl: string;
  status: Status;
}

export interface CopyGroupResponse {
  id: number;
  apiUrl: string;
  status: Status;
}

export interface UpdateGroupParameters {
  name?: string;
  isArchived?: boolean;
  isInviteLinkEnabled?: boolean;
  isManualCheckingEnabled?: boolean;
  isManualCheckingEnabledForOldSolutions?: boolean;
  defaultProhibitFurtherReview?: boolean;
  canStudentsSeeGroupProgress?: boolean;
}

export interface ShortUserInfo {
  id: string;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  visibleName: string;
  avatarUrl: string;
  gender: Gender;
}

interface GroupStudentInfo {
  user: ShortUserInfo;
  addingTime: TimeString;
}

export interface CourseInfo {
  id: string;
  title: string;
  description: string;
  units: UnitInfo[];
  nextUnitPublishTime: TimeString;
  scoring: ScoringSettingsModel;
  containsFlashcards: boolean;
  isTempCourse: boolean;
  tempCourseError: string;
}

export interface UnitInfo {
  id: string;
  title: string;
  isNotPublished: boolean;
  publicationDate: TimeString;
  slides: ShortSlideInfo[];
  additionalScores: UnitScoringGroupInfoUnitScoringGroupInfo[];
}

export interface ShortSlideInfo {
  id: string;
  title: string;
  hide: boolean;
  slug: string;
  maxScore: 0;
  scoringGroup: ScoringGroup;
  type: SlideType;
  apiUrl: string;
  questionsCount: number;
  gitEditLink: string;
}

export interface UnitScoringGroupInfoUnitScoringGroupInfo {
  canInstructorSetAdditionalScore: boolean;
  maxAdditionalScore: number;
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  weight: number;
}

export interface ScoringSettingsModel {
  groups: ScoringGroupModel[];
}

export interface ScoringGroupModel {
  id: string;
  name: string;
  abbr: string;
  description: string;
  weight: number;
}

export interface UsersProgressResponse {
  userProgress: { [userId: string]: UserProgress };
  status: Status;
}

export interface UserProgress {
  visitedSlides: { [slideId: string]: UserProgressSlideResult };
  additionalScores: { [unitId: string]: { [scoringGroup in ScoringGroup]: number } };
}

export interface UserProgressSlideResult {
  score: number;
  usedAttempts: number;
  waitingForManualChecking: boolean;
  prohibitFurtherManualChecking: boolean;
  visited: boolean;
  isSkipped: boolean;
}

export type SlideType = 'lesson' | 'quiz' | 'exercise' | 'flashcards';

export type ScoringGroup =
  | 'activity'
  | 'exercise'
  | 'homework'
  | 'seminar'
  | 'game';
