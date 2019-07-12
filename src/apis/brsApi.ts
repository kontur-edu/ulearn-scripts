import 'bluebird';
import * as fs from 'fs';
import * as request from 'request-promise';
import * as cache from '../helpers/cache';

const baseUrl = 'https://brs.urfu.ru/mrd';
let globalSid: string = null;
let globalLogin: string = null;

export async function getDisciplineCachedAsync(
  year: number,
  course: number,
  termType: TermType
) {
  const cacheName = `${globalLogin}_getDiscipline_${year}_${course}_${termType}`;
  const cacheResult = cache.read<Discipline[]>(cacheName);
  if (cacheResult) {
    return cacheResult;
  }

  const result = await getDisciplineInternalAsync(year, course, termType);
  cache.save(cacheName, result);
  return result;
}

async function getDisciplineInternalAsync(
  year: number,
  course: number,
  termType: TermType
) {
  const paging = await requestApiJsonAsync<Paging<Discipline>>(
    `/mvc/mobile/discipline/fetch?year=${year}&termType=${termType}&course=${course}&total=0&page=1&pageSize=100&search=`
  );
  return paging.content;
}

export async function getAllStudentMarksAsync(discipline: Discipline) {
  const students = [
    ...(await getStudentMarksAsync(discipline, 'lecture', 'current')),
    ...(await getStudentMarksAsync(discipline, 'lecture', 'intermediate')),
    ...(await getStudentMarksAsync(discipline, 'laboratory', 'current')),
    ...(await getStudentMarksAsync(discipline, 'laboratory', 'intermediate')),
  ];

  const uniqueStudents: { [id: string]: StudentMark } = {};
  for (const s of students) {
    const knownStudent = uniqueStudents[s.studentUuid] || {};
    uniqueStudents[s.studentUuid] = { ...knownStudent, ...s };
  }

  return Object.keys(uniqueStudents).map(k => uniqueStudents[k]);
}

async function getStudentMarksAsync(
  discipline: Discipline,
  cardType: CardType,
  markType: MarkType
) {
  return getStudentMarksInternalAsync(
    discipline.disciplineLoad,
    discipline.groupHistoryId,
    cardType,
    markType
  );
}

async function getStudentMarksInternalAsync(
  disciplineLoad: string,
  groupHistoryId: string,
  cardType: CardType,
  markType: MarkType,
  isTotal: boolean = false,
  showActiveStudents: boolean = false
) {
  return requestApiJsonAsync<StudentMark[]>(
    `/mvc/mobile/studentMarks/fetch?disciplineLoad=${disciplineLoad}&groupUuid=${groupHistoryId}` +
      `&cardType=${cardType}&hasTest=false&isTotal=${isTotal}` +
      `&intermediate=${markType === 'intermediate'}` +
      `&selectedTeachers=null&showActiveStudents=${showActiveStudents}`
  );
}

export async function getAllControlActionsCachedAsync(discipline: Discipline) {
  return [
    ...(await getControlActionsCachedAsync(discipline, 'lecture', 'current')),
    ...(await getControlActionsCachedAsync(
      discipline,
      'lecture',
      'intermediate'
    )),
    ...(await getControlActionsCachedAsync(
      discipline,
      'laboratory',
      'current'
    )),
    ...(await getControlActionsCachedAsync(
      discipline,
      'laboratory',
      'intermediate'
    )),
  ];
}

async function getControlActionsCachedAsync(
  discipline: Discipline,
  cardType: CardType,
  markType: MarkType
) {
  const cacheName = `${globalLogin}_getControlActions_${
    discipline.disciplineLoad
  }_${discipline.groupHistoryId}_${cardType}_${markType}`;
  const cacheResult = cache.read<ControlAction[]>(cacheName);
  if (cacheResult) {
    return cacheResult;
  }

  const result = await getControlActionsInternalAsync(
    discipline.disciplineLoad,
    discipline.groupHistoryId,
    cardType,
    markType
  );
  cache.save(cacheName, result);
  return result;
}

async function getControlActionsInternalAsync(
  disciplineLoad: string,
  groupHistoryId: string,
  cardType: CardType,
  markType: MarkType
) {
  const response = await requestApiAsync(
    `/mvc/mobile/view/mark/${disciplineLoad}/${groupHistoryId}/teachers/${cardType}/${markType}`
  );

  const prefix = 'gridColumns = toTextArray(';
  const suffix = ');';
  const linesWithId = response
    .split('\r\n')
    .map(s => s.trim())
    .filter(s => s.startsWith(prefix));
  if (linesWithId.length !== 1) {
    throw new Error(
      'Control actions page should contain single line target line with techcard identifier'
    );
  }

  const columns: Array<{ controlAction: string; uuid: string }> = JSON.parse(
    linesWithId[0].substr(
      prefix.length,
      linesWithId[0].length - prefix.length - suffix.length
    )
  );

  const uuidPrefix = 'technologyCard';
  const result = columns
    .filter(c => c.uuid && c.uuid.startsWith(uuidPrefix))
    .map(c => ({
      uuid: c.uuid,
      uuidWithoutPrefix: c.uuid.substr(uuidPrefix.length),
      controlAction: c.controlAction,
    }));
  return result as ControlAction[];
}

export async function putStudentMarkAsync(
  studentUuid: string,
  controlActionId: string,
  mark: number
) {
  const body = `student=${studentUuid}&techcard=${controlActionId}&mark=${
    isNaN(mark) ? '' : mark.toString()
  }`;
  return requestApiJsonAsync<StudentMark>(
    `/mvc/mobile/studentMarks/put`,
    {
      method: 'POST',
      body,
      json: false,
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }
  );
}

export async function updateAllMarksAsync(discipline: Discipline) {
  // Одного вызова достаточно, чтобы обновить все оценки по предмету у группы.
  await updateMarksAsync(discipline, 'lecture', 'intermediate');
  // await updateMarksAsync(discipline, 'lecture', 'current');
  // await updateMarksAsync(discipline, 'lecture', 'intermediate');
  // await updateMarksAsync(discipline, 'laboratory', 'current');
  // await updateMarksAsync(discipline, 'laboratory', 'intermediate');
}

async function updateMarksAsync(
  discipline: Discipline,
  cardType: CardType,
  markType: MarkType
) {
  return updateMarksInternalAsync(
    discipline.disciplineLoad,
    discipline.groupHistoryId,
    cardType,
    markType
  );
}

async function updateMarksInternalAsync(
  disciplineLoad: string,
  groupHistoryId: string,
  cardType: CardType,
  markType: MarkType
) {
  const body =
    `disciplineLoad=${disciplineLoad}&groupUuid=${groupHistoryId}` +
    `&cardType=${cardType}&hasTest=false&isTotal=false` +
    `&intermediate=${markType === 'intermediate'}` +
    `&selectedTeachers=null&showActiveStudents=true`;
  return requestApiAsync(
    `/mvc/mobile/updateMarks`,
    {
      method: 'POST',
      body,
      json: false,
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }
  );
}

export async function authByConfigAsync(secretName: string) {
  const secrets = JSON.parse(fs.readFileSync('./secrets/brs.json', 'utf8'));
  const credentials = secrets[secretName] as {
    login: string;
    password: string;
  };
  if (!credentials) {
    throw new Error(`Secret ${secretName} not found`);
  }
  globalSid = await authAsync(credentials.login, credentials.password);
  globalLogin = credentials.login;
}

async function authAsync(login: string, password: string): Promise<string> {
  const response = await request({
    url: baseUrl + `/j_spring_security_check`,
    method: 'POST',
    body: `j_username=${login}&j_password=${password}`,
    resolveWithFullResponse: true,
    simple: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  });

  const sessionCookie = response.headers['set-cookie'].filter(
    (cookie: string) => cookie.startsWith('JSESSIONID=')
  )[0];
  const sid = (sessionCookie as string)
    .split(';')[0]
    .substr('JSESSIONID='.length)
    .trim();
  return sid;
}

async function requestApiJsonAsync<T>(
  uri: string,
  options?: RequestOptions,
  headers?: RequestHeaders
): Promise<T> {
  const response = await requestApiAsync(uri, options, headers);
  if (response.trimLeft().startsWith('<!DOCTYPE html>')) {
    throw new Error('Forbidden');
  }
  return JSON.parse(response);
}

async function requestApiAsync(
  uri: string,
  options?: RequestOptions,
  headers?: RequestHeaders
): Promise<string> {
  if (!globalSid) {
    throw new Error(
      'Not authenticated. Use authByConfigAsync or authAsync to authenticate'
    );
  }

  return request({
    ...options,
    url: baseUrl + uri,
    headers: {
      Cookie: `JSESSIONID=${globalSid};`,
      ...headers,
    },
  });
}

interface RequestOptions {
  method?: string;
  body?: object | string;
  json?: boolean;
}

interface RequestHeaders {
  'Content-Type'?: string;
}

export enum TermType {
  Fall = 1,
  Spring = 2,
}

export type CardType = 'lecture' | 'laboratory';
export type MarkType = 'intermediate' | 'current';

interface Paging<T> {
  content: T[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
}

export interface RegisterInfo {
  registerInfoStr: string;
  registerId: number;
  passDate: any;
  cardType: string;
  sheet: string;
}

export interface Discipline {
  groupId: string;
  discipline: string;
  group: string;
  registerInfo: RegisterInfo[];
  disciplineLoad: string;
  groupHistoryId: string;
}

const studentMarkSample: StudentMark = {
  studentPersonalNumber: '09800106',
  isEdit: false,
  studentUuid:
    'studen18hc2jg0000magk6mi3iec84bsundigr18hc2jg0000m53o7mlgvora278',
  status: 1,
  studentStatus: 'Активный',
  ignoreCurrentDebars: false,
  studentFio: 'Анисимова Маргарита Васильевна',
  isExtern: false,
  teacherName: '',
  cardType: 'lecture',
  studentName: 'Анисимова М.В.',
  studentGroup: 'РИ-180001',
  registerClosed: false,
  subgroupsITS: '',
  disciplineLoad: 'unpldd18hc2jg0000m5kojcd3te76bnk',
};

export interface StudentMark {
  studentPersonalNumber: string;
  isEdit: boolean;
  studentUuid: string;
  status: number;
  studentStatus: string;
  ignoreCurrentDebars: boolean;
  studentFio: string;
  isExtern: boolean;
  teacherName: string;
  cardType: CardType;
  studentName: string;
  studentGroup: string;
  registerClosed: boolean;
  subgroupsITS: string;
  disciplineLoad: string;
  [props: string]: number | string | boolean;
}

export interface ControlAction {
  uuid: string;
  uuidWithoutPrefix: string;
  controlAction: string;
}
