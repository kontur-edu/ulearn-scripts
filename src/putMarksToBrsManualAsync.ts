import { authByConfigAsync } from './apis/brsApi';
import putMarksToBrsAsync, {
  PutMarksOptions,
  DisciplineConfig,
  ControlActionConfig,
  MarksData,
} from './putMarksToBrsAsync';

export { PutMarksOptions, DisciplineConfig, ControlActionConfig, MarksData };

export default async function putMarksToBrsManualAsync(
  secretName: string,
  marksData: MarksData,
  options: PutMarksOptions
) {
  try {
    await authByConfigAsync(secretName);
    await putMarksToBrsAsync(marksData, options);
  } catch (e) {
    console.log(e);
  }
}
