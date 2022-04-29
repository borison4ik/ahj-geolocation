export default function isValid(val) {
  const reg = /^\[?\d{2}.\d{5}, ?-?\d{2}.\d{5}\]?/gm;
  return reg.test(String(val));
}
