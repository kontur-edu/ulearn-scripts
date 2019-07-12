import 'bluebird';
import * as fs from 'fs';
import * as request from 'request-promise';

const token = fs.readFileSync('./secrets/ulearn.jwt', 'utf8');
const baseApiUrl = 'https://api.ulearn.me';

const authCookie = fs.readFileSync('./secrets/ulearn.auth', 'utf8');
const baseSiteUrl = 'https://ulearn.me';

export async function getCourseStatisticsAsync(
  courseId: string,
  groupIds: string[]
) {
  return requestSiteJsonAsync<Statistics>(
    `/Analytics/ExportCourseStatisticsAsJson?courseId=${courseId}${groupIds
      .map(id => `&group=${id}`)
      .join('')}`
  );
}

export async function getGroupsAsync(courseId: string) {
  return (await requestApiJsonAsync<{ groups: Group[] }>(
    `/groups?course_id=${courseId}`
  )).groups;
}

export async function getStudentsAsync(groupId: string) {
  return (await requestApiJsonAsync<{ students: StudentToGet[] }>(
    `/groups/${groupId}/students`
  )).students.map(s => s.user);
}

export async function postStudentAsync(groupId: string, studentId: string) {
  return requestApiAsync(`/groups/${groupId}/students/${studentId}`, {
    method: 'POST',
  });
}

export async function deleteStudentAsync(groupId: string, studentId: string) {
  return requestApiAsync(`/groups/${groupId}/students/${studentId}`, {
    method: 'DELETE',
  });
}

export async function copyStudentsToGroup(
  studentIds: string[],
  toGroupId: string
) {
  return requestApiAsync(`/groups/${toGroupId}/students`, {
    method: 'POST',
    body: {
      studentIds,
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
  if (response.headers['content-type'].startsWith('application/json')) {
    return response.body;
  } else {
    console.error('>> Ulearn Site error. Perhaps, you should update "ulearn.auth" cookie');
    return null;
  }
}

async function requestApiJsonAsync<T>(
  uri: string,
  options?: RequestOptions
): Promise<T> {
  const response = await requestApiAsync(uri, options);
  return JSON.parse(response);
}

async function requestApiAsync(
  uri: string,
  options?: RequestOptions
): Promise<string> {
  const response = await request({
    ...options,
    url: baseApiUrl + uri,
    method: 'GET',
    resolveWithFullResponse: true,
    simple: false,
    headers: { Authorization: 'Bearer ' + token },
  });
  if (response.headers['content-type'].startsWith('application/json')) {
    return response.body;
  } else {
    console.error('>> Ulearn API error. Perhaps, you should update "ulearn.jwt" token');
    return null;
  }
}

interface RequestOptions {
  method?: string;
  body?: object;
  json?: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  visibleName: string;
}

interface StudentToGet {
  user: Student;
}

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

export type ScoringGroup = 'activity' | 'exercise' | 'homework' | 'seminar';

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
  groups: string[];
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
