export default function prepareFio(fio: string) {
  return fio.replace('ё', 'е').replace(/[ ]+/, ' ');
}
