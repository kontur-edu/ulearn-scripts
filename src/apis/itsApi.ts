import 'bluebird';
import * as request from 'request-promise';

const baseUrl = 'https://its.urfu.ru';
let globalSessionInfo: string = null;
let globalItsAuth: string = null;

export async function authAsync(sessionInfo: string, itsAuth: string) {
  globalSessionInfo = sessionInfo;
  globalItsAuth = itsAuth;
}

export async function getProjectSubgroupsAsync(
  groupId: string
): Promise<Collection<ProjectSubgroup>> {
  const filterParams = [
    { property: 'Year', value: '' },
    { property: 'Semester', value: '' },
    { property: 'ModuleTitle', value: '' },
    { property: 'Name', value: '' },
    { property: 'subgroupType', value: '' },
    { property: 'Limit', value: '' },
    { property: 'count', value: '' },
  ];
  const filter = encodeURI(JSON.stringify(filterParams));

  const groupParams = { property: 'ModuleTitle', direction: 'ASC' };
  const group = encodeURI(JSON.stringify(groupParams));

  const page = 1;
  const start = 0;
  const limit = 25;
  const queryString = `?competitionGroupId=${groupId}&filter=${filter}&group=${group}&page=${page}&start=${start}&limit=${limit}`;

  const result = await requestApiJsonAsync<Collection<ProjectSubgroup>>(
    '/ProjectSubgroup' + queryString,
    {},
    { 'X-Requested-With': 'XMLHttpRequest' }
  );
  return result;
}

export async function getProjectSubgroupFormAsync(
  subgroupId: number
): Promise<ProjectSubgroupForm> {
  const queryString = `?id=${subgroupId}`;

  const response = await requestApiAsync<Response>(
    '/ProjectSubgroup/Edit' + queryString,
    {
      resolveWithFullResponse: true,
    }
  );

  const antiforgery = extractAntiforgery(response);
  const requestVerificationToken = extractRequestVerificationToken(
    response.body
  );
  const id = extractSubgroupId(response.body);
  const name = extractSubgroupName(response.body);
  const limit = extractSubgroupLimit(response.body);
  const teachers = extractSubgroupTeachers(response.body);

  const selectedTeacher = teachers.filter((it) => it.selected)[0] || null;
  const teacherId = selectedTeacher ? selectedTeacher.id : '';

  return {
    id,
    name,
    limit,
    teacherId,
    teachers: teachers.map((it) => ({ id: it.id, caption: it.caption })),
    requestVerificationToken,
    antiforgery,
  };
}

function extractAntiforgery(response: Response): string {
  const antiforgeryPrefix = '.AspNetCore.Antiforgery.SdfBlYY3_vg=';
  const antiforgeryCookies = response.headers['set-cookie'].filter((it) =>
    it.startsWith(antiforgeryPrefix)
  );
  const antiforgeryCookie =
    antiforgeryCookies.length > 0 ? antiforgeryCookies[0] : '';
  const antiforgery = antiforgeryCookie
    .split(';')[0]
    .substring(antiforgeryPrefix.length);
  return antiforgery;
}

function extractRequestVerificationToken(body: string): string {
  const verificationTokenMatch = body.match(
    /<input name=\"__RequestVerificationToken\" type=\"hidden\" value=\"([^"]*)\" \/>/
  );
  const verificationToken = verificationTokenMatch[1];
  return verificationToken;
}

function extractSubgroupId(body: string): number {
  const idMatch = body.match(
    /<input[^>]*name="Id"[^>]*value=\"([^"]*)\"[^>]*>/
  );
  const id = parseInt(idMatch[1], 10);
  return id;
}

function extractSubgroupName(body: string): string {
  const nameMatch = body.match(
    /<input[^>]*name="Name"[^>]*value=\"([^"]*)\"[^>]*>/
  );
  const name = nameMatch[1];
  return name;
}

function extractSubgroupLimit(body: string): number {
  const limitMatch = body.match(
    /<input[^>]*name="Limit"[^>]*value=\"([^"]*)\"[^>]*>/
  );
  const limit = parseInt(limitMatch[1], 10);
  return limit;
}

function extractSubgroupTeachers(
  body: string
): { selected: boolean; id: string; caption: string }[] {
  const teacherIdSelectMatch = body.match(
    /<select[^>]*id="TeacherId"[^>]*>([\s]*<option[^>]*>[^<]*<\/option>[\s]*)*<\/select>/
  );

  const teachers = teacherIdSelectMatch
    .slice(1)
    .map((it) =>
      it.match(
        /[\s]*<option (selected=\"selected\")?[^>]*value=\"([^"]*)\"[^>]*>([^<]*)<\/option>[\s]*/
      )
    )
    .map((it) => ({
      selected: it[1] === 'selected="selected"',
      id: it[it.length - 2],
      caption: it[it.length - 1],
    }));

  return teachers;
}

export async function putProjectSubgroupFormAsync(
  form: ProjectSubgroupForm
): Promise<boolean> {
  const body = `Name=${encodeURIComponent(form.name)}&Limit=${form.limit}&TeacherId=${form.teacherId}&__RequestVerificationToken=${form.requestVerificationToken}`;

  const response = await requestApiAsync<Response>(
    `/ProjectSubgroup/Edit?id=${form.id}`,
    {
      method: 'POST',
      body,
      json: false,
      simple: false,
      resolveWithFullResponse: true,
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    {
      '.AspNetCore.Antiforgery.SdfBlYY3_vg': form.antiforgery,
    }
  );
  return response.statusCode === 302 || response.statusCode === 200;
}

export async function getStudentsAsync(
  subgroupId: number,
  hideStudents: boolean
): Promise<Collection<Student>> {
  const page = 1;
  const start = 0;
  const limit = 25;
  const queryString = `?id=${subgroupId}&hideStudents=${hideStudents}&page=${page}&start=${start}&limit=${limit}`;

  const result = await requestApiJsonAsync<Collection<Student>>(
    '/ProjectSubgroup/StudentsAjax' + queryString,
    {}
  );
  return result;
}

export async function putStudentMembershipAsync(
  subgroupId: number,
  studentId: string,
  include: boolean
): Promise<void> {
  const body = `subgroupId=${subgroupId}&studentId=${studentId}&include=${include}`;

  await requestApiAsync<string>(
    '/ProjectSubgroup/StudentMembership',
    {
      method: 'POST',
      body,
      json: false,
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  );
}

async function requestApiJsonAsync<T>(
  uri: string,
  options?: RequestOptions,
  headers?: RequestHeaders,
  cookies?: RequestCookies
): Promise<T> {
  const response = await requestApiAsync<string>(
    uri,
    options,
    headers,
    cookies
  );
  if (response.trimLeft().startsWith('<!DOCTYPE html>')) {
    throw new Error(uri + ' is Forbidden');
  }
  return JSON.parse(response);
}

async function requestApiAsync<T>(
  uri: string,
  options?: RequestOptions,
  headers?: RequestHeaders,
  cookies?: RequestCookies
): Promise<T> {
  if (!globalItsAuth || !globalSessionInfo) {
    throw new Error('Not authenticated. Use authAsync to authenticate');
  }

  cookies = cookies || {};
  cookies['ItsAuth'] = globalItsAuth;
  cookies['sessionInfo'] = globalSessionInfo;

  const cookieHeader = Object.keys(cookies)
    .map((k) => `${k}=${cookies[k]}`)
    .join('; ');

  return request({
    method: 'GET',
    ...options,
    url: baseUrl + uri,
    headers: {
      Cookie: cookieHeader,
      ...headers,
    },
  });
}

interface RequestOptions {
  method?: string;
  body?: object | string;
  json?: boolean;
  simple?: boolean;
  resolveWithFullResponse?: boolean;
}

interface RequestHeaders {
  'Content-Type'?: string;
  'X-Requested-With'?: 'XMLHttpRequest';
}

interface RequestCookies {
  [name: string]: string;
}

interface Response {
  statusCode: number;
  headers: { ['set-cookie']?: string[] };
  body: string;
}

export interface ProjectSubgroup {
  Id: number; // 19911
  Name: string; // 'Компьютерная игра\\экзамен\\9'
  Level: 'А' | 'B' | 'C';
  HasScores: boolean;
  moduleId: string; // '4f7f489c13914c508d3beb54455a0d58'
  ModuleTitle: string; // 'Компьютерная игра'
  Year: string; // '2021'
  Semester: 'Весенний' | 'Осенний'; // 'Весенний'
  semesterId: number; // 2
  subgroupType: string; // 'лекции'
  kgmer: string; // '1'
  Limit: number; // 4
  count: number; // 4
  teacher: string; // 'Домашних И.А.'
}

interface Student {
  Id: string; // 'studen195e3pg0000nmtmebn7661r1gk'
  GroupName: string; // 'МЕН-110802'
  Surname: string; // 'Абелян'
  Name: string; // 'Давид'
  PatronymicName: string; // 'Самвелович'
  Status: string; // 'Активный'
  Included: boolean;
  AnotherGroup: string | null;
}

interface ProjectSubgroupForm {
  id: number;
  name: string;
  limit: number;
  teacherId: string;
  teachers: { id: string; caption: string }[];
  requestVerificationToken: string;
  antiforgery: string;
}

interface Collection<T> {
  data: Array<T>;
  total: number;
}
