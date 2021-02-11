import 'bluebird';
import * as fs from 'fs';
import * as request from 'request-promise';

const token = fs.readFileSync('./secrets/ulearn.jwt', 'utf8');
const baseApiUrl = 'https://api.ulearn.me';

const authCookie = fs.readFileSync('./secrets/ulearn.auth', 'utf8');
const baseSiteUrl = 'https://ulearn.me';

export async function getCourseStatisticsAsync(
  courseId: string,
  groupIds: number[]
) {
  return requestSiteJsonAsync<Statistics>(
    `/Analytics/ExportCourseStatisticsAsJson?courseId=${courseId}${groupIds
      .map((id) => `&group=${id}`)
      .join('')}`
  );
}

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

async function requestSiteJsonAsync<T>(uri: string): Promise<T> {
  const response = await requestSiteAsync(uri);
  return JSON.parse(response);
}

async function requestSiteAsync(uri: string): Promise<string> {
  const response = await request({
    url: baseSiteUrl + uri,
    method: 'GET',
    resolveWithFullResponse: true,
    simple: false,
    headers: { cookie: `ulearn.auth=${authCookie}` },
  });
  const contentType = response.headers['content-type'];
  if (contentType !== undefined && contentType.startsWith('application/json')) {
    return response.body;
  } else {
    console.error(
      '>> Ulearn Site error. Perhaps, you should update "ulearn.auth" cookie'
    );
    return null;
  }
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
  groups: CourseScoringGroup[];
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
  additionalScores: { [i: string]: { [j: string]: number } };
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

export interface Statistics {
  course: StatisticsCourse;
  groups: StatisticsGroup[];
  students: StatisticsStudent[];
}

export interface StatisticsCourse {
  scoring_groups: CourseScoringGroup[];
  title: string;
  units: CourseUnit[];
}

export interface CourseScoringGroup {
  abbreviation: string;
  id: ScoringGroup;
  name: string;
}

export interface CourseUnit {
  additional_scores: CourseAdditionalScore[];
  id: string;
  slides: CourseSlide[];
  title: string;
}

export interface CourseAdditionalScore {
  max_additional_score: number;
  scoring_group_id: string;
}

export interface CourseSlide {
  id: string;
  max_score: number;
  title: string;
}

export interface StatisticsGroup {
  Title: string;
  id: string;
}

export interface StatisticsStudent {
  additional_scores: StudentAdditionalScore[];
  groups: number[];
  name: string;
  slides_scores: StudentSlideScore[];
  user_id: string;
}

export interface StudentAdditionalScore {
  score: number;
  scoring_group_id: ScoringGroup;
  unit_id: string;
}

export interface StudentSlideScore {
  score: number;
  slide_id: string;
}
