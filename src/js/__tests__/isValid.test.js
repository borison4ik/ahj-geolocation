import isValid from '../utils/isValid';

describe('isValid function', () => {
  const cases = [
    '12.12345, 12.12345',
    '12.12345, -12.12345',
    '12.12345,12.12345',
    '12.12345,-12.12345',
    '[12.12345, 12.12345]',
  ];
  test.each(cases)('isValid function return true', (str) => {
    expect(isValid(str)).toBe(true);
  });
});
