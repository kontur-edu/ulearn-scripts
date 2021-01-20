import * as brsApi from './apis/brsApi';
import { Discipline } from './apis/brsApi';
import putMarksForDisciplineAsync, {
  PutMarksOptions,
  ControlActionConfig,
} from './putMarksForDisciplineAsync';
import { compareNormalized } from './helpers/tools';
import { ActualStudent } from './readStudentsAsync';

export { PutMarksOptions, ControlActionConfig };

export default async function putMarksToBrsAsync(
  marksData: MarksData,
  options: PutMarksOptions
) {
  const { actualStudents, disciplineConfig, controlActionConfigs } = marksData;
  const disciplines = await getSuitableDisciplinesAsync(disciplineConfig);

  for (const discipline of disciplines) {
    await putMarksForDisciplineAsync(
      discipline,
      actualStudents.filter((s) =>
        compareNormalized(s.groupName, discipline.group)
      ),
      controlActionConfigs,
      options
    );
  }
}

async function getSuitableDisciplinesAsync(disciplineConfig: DisciplineConfig) {
  const allDisciplines = await brsApi.getDisciplineCachedAsync(
    disciplineConfig.year,
    disciplineConfig.termType,
    disciplineConfig.course,
    disciplineConfig.isModule
  );
  const disciplines = allDisciplines.filter(
    (d) =>
      compareNormalized(d.discipline, disciplineConfig.name) &&
      (!disciplineConfig.isSuitableDiscipline ||
        disciplineConfig.isSuitableDiscipline(d))
  );
  return disciplines;
}

export interface MarksData {
  actualStudents: ActualStudent[];
  disciplineConfig: DisciplineConfig;
  controlActionConfigs: ControlActionConfig[];
}

export interface DisciplineConfig {
  name: string;
  year: number;
  termType: number;
  course: number;
  isModule: boolean;
  isSuitableDiscipline?: (d: Discipline) => boolean;
}
