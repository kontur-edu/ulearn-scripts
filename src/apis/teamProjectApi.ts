import 'bluebird';
import * as request from 'request-promise';
import JustDate from '../helpers/JustDate';

const baseUrl = 'https://teamproject.urfu.ru/api';
let globalAuthJwt: string = null;

export async function authAsync(authJwt: string) {
  globalAuthJwt = authJwt;
}

export async function getActiveProjectsAsync(
  year: number,
  term: TermType,
  pageNumber: number,
  pageSize: number
): Promise<Projects> {
  const queryString = `?status=active&size=${pageSize}&page=${pageNumber}&year=${year}&semester=${term}`;

  const result = await requestApiJsonAsync<Projects>(
    '/projects/' + queryString,
    {}
  );
  return result;
}

export async function getIterationsAsync(
  projectId: number
): Promise<Iterations> {
  const result = await requestApiJsonAsync<Iterations>(
    `/projects/${projectId}/iterations/`,
    {}
  );
  return result;
}

export async function getIterationAsync(
  projectId: number,
  iterationId: number
): Promise<Iteration> {
  const result = await requestApiJsonAsync<Iteration>(
    `/projects/${projectId}/iterations/${iterationId}/`,
    {}
  );
  return result;
}

export async function getKanbanBoardAsync(
  projectId: number,
  iterationId: number
): Promise<KanbanBoard> {
  const result = await requestApiJsonAsync<KanbanBoard>(
    `/projects/${projectId}/iterations/${iterationId}/kanban-board/`,
    {}
  );
  return result;
}

export async function getMembersAsync(projectId: number): Promise<Members> {
  const result = await requestApiJsonAsync<Members>(
    `/projects/${projectId}/members/`,
    {}
  );
  return result;
}

export async function postIterationAsync(
  projectId: number,
  title: string,
  description: string,
  dateBegin: JustDate,
  dateEnd: JustDate
): Promise<ResponseBody> {
  const body = {
    title,
    description,
    date_begin: dateBegin.toDashedString(),
    date_end: dateEnd.toDashedString(),
  };

  return await requestApiAsync<ResponseBody>(
    `/projects/${projectId}/iterations/`,
    {
      method: 'POST',
      body,
      json: true,
    }
  );
}

export async function putIterationAsync(
  projectId: number,
  iteration: Iteration
): Promise<Iteration> {
  return await requestApiAsync<Iteration>(
    `/projects/${projectId}/iterations/${iteration.id}/`,
    {
      method: 'PUT',
      body: iteration,
      json: true,
    }
  );
}

export async function postTaskAsync(
  projectId: number,
  iterationId: number,
  title: string,
  description: string,
  status: KanbanStatusId,
  executorId: number | null,
  dateEnd: JustDate
): Promise<ResponseBody> {
  const body = {
    title,
    description,
    status,
    executorId,
    dateEnd: dateEnd.toDashedString(),
  };
  return await requestApiAsync<ResponseBody>(
    `/projects/${projectId}/iterations/${iterationId}/tasks/`,
    {
      method: 'POST',
      body,
      json: true,
    }
  );
}

export async function getEstimationsAsync(
  projectId: number,
  iterationId: number
): Promise<Estimations> {
  const result = await requestApiJsonAsync<Estimations>(
    `/projects/${projectId}/iterations/${iterationId}/estimations/`,
    {}
  );
  return result;
}

export async function putEstimationAsync(
  projectId: number,
  iterationId: number,
  memberId: number,
  estimation: Estimation
): Promise<ResponseBody> {
  return await requestApiAsync<ResponseBody>(
    `/projects/${projectId}/iterations/${iterationId}/estimate/members/${memberId}/`,
    {
      method: 'PUT',
      body: estimation,
      json: true,
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
  if (!globalAuthJwt) {
    throw new Error('Not authenticated. Use authAsync to authenticate');
  }

  headers = headers || {};
  headers['Authorization'] = globalAuthJwt.startsWith('Bearer ')
    ? globalAuthJwt
    : 'Bearer ' + globalAuthJwt;

  cookies = cookies || {};

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
  Authorization?: string;
  'Content-Type'?: string;
  'X-Requested-With'?: 'XMLHttpRequest';
}

interface RequestCookies {
  [name: string]: string;
}

export interface ResponseBody {
  success?: true;
  errors?: { [key: string]: string[] } | null;
}

export interface KanbanBoard {
  items: Array<KanbanStatus>;
}

export interface KanbanStatus {
  status_id: KanbanStatusId;
  tasks: KanbanTask[];
}

export type KanbanStatusId = null | 1 | 2 | 3;

export interface KanbanTask {
  id: number; // 34927
  title: string; // 'Эксперимент с teamproject'
  status: KanbanStatusId; // 3
  end_date: string; // '2022-04-15'
  executor: Student;
  key: boolean; // false
  count_of_attachments: number; // 0
  count_of_comments: number; // 0
}

export type Iterations = {
  items: Array<Iteration>;
  count: number;
  project: Project;
};

export interface Iteration {
  id: number; // 14215
  title: string; // 'Апрельский спринт'
  description: string; // null
  date_begin: string; // '2022-04-01'
  date_end: string; // '2022-04-30'
  estimable: boolean; // false
  estimation_date_begin: string; // '2022-04-27'
  estimation_date_end: string; // '2022-05-27'
  can_change_dates: boolean; // true
  can_delete: boolean; // true
  comments: []; // []
  calculated: boolean; // false
  finished: boolean; // false
  started: boolean; // true
  published: null; // null
  publish_comment: null; // null
  publishable: boolean; // false
  published_by: null; // null
  published_by_role: string; // ''
}

export interface Projects {
  items: Array<Project>;
  count: number;
}

export interface Project {
  id: number; // 30855
  is_completed: boolean; // false
  title: string; // "Спроектированное приложение (пересдачи)"
  curator: Curator;
  passport_number: string; // "107/ЛКП-2248-2022
  instance_number: number; // 1
  customer: string; // "Акционерное общество \\\"ПРОИЗВОДСТВЕННАЯ ФИРМА \\\"СКБ КОНТУР\\\"",
  is_multiprogram: boolean; // false
  is_kernel: boolean; // false
  number_of_iterations: number; // 0
  number_of_members: number; // 1
  current_iteration: null; // null
  members: Student[];
  updates: null; // null
  warnings: null; // null
}

export interface Project2021 {
  id: number; // 19931
  title: string; // "Компьютерная игра"
  description: string; // "<ol><li><p>В каждой команде 3 человека."
  period: string; // "Весенний семестр 2021/2022 уч.год"
  curator: Person;
  project_name: string; // "Компьютерная игра"
  id_project_lkp: number; // 3743
  passport_number: string; // "21/ЛКП-956-2022"
  instance_number: number; // 29
  supercurator: Person;
  name_program: string; // 'Разработка программных продуктов'
  complete: boolean; // false
  new_iteration_can_be_added: boolean; // true
  is_multi: boolean; // false
  report_ready: boolean; // false
  experts_score_int: null; // null
  published: null; // null
  publish_comment: null; // null
  publishable: boolean; // false
  team_head: boolean; // false
  im_student: boolean; // false
  im_chief_student: boolean; // false
  im_rop: boolean; // true
  im_curator: boolean; // true
  published_by: null; // null
  published_by_role: string; // ''
  int_instance_number: number; // 29
  is_kernel: boolean; // false
  is_estimation_finished: boolean; // false
}

export enum TermType {
  Fall = 1,
  Spring = 2,
}

export interface Estimations {
  items: EstimatedStudentMember[];
  count: number;
  comments: string[];
}

export interface Estimation {
  score: number | null;
  comment: string | null;
}

export interface Members {
  items: Member[];
  count: number; // 5
  id_project_lkp: number; // 3743
  name_program: string; // 'Разработка программных продуктов'
  is_head_role_assigned: boolean; // false
  is_admin_role_assigned: boolean; // false
}

export interface CuratorMember extends Member {
  // id: null;
  curator: boolean; // true
  is_supercurator: boolean; // true
}

export interface EstimatedStudentMember extends StudentMember {
  estimation: Estimation;
}

export interface StudentMember extends Member {
  // id: 20271
  group_name: string; // 'МЕН-110801'
  role: null; // null
  competency_role: null; // null
  competency_role_id: null; // null
}

export interface Member extends Person {
  email: null;
  phone: null;
}

export interface Student extends Person {
  role: string; // null
}

export interface Curator extends Person {
  is_external: boolean;
  shortname: string; // "Домашних И.А."
}

export interface Person {
  id: number;
  fullname: string; // "Домашних Иван Алексеевич"
  photo: string; // null
}
