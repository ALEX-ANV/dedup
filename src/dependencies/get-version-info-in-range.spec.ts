import { getVersionsInfoInRange } from './get-version-info-in-range';

describe(getVersionsInfoInRange.name, () => {
  it('should correctly calculate min, max and versions within range', () => {
    const range = '^1.2.0';
    const versions = ['1.3.0', '1.2.1', '1.2.0', '1.1.0', '1.0.0'];

    const result = getVersionsInfoInRange(range, versions);

    expect(result.min.version).toBe('1.2.0');
    expect(result.max.version).toBe('1.3.0');
    expect(result.versions.map((v) => v.version)).toEqual([
      '1.3.0',
      '1.2.1',
      '1.2.0',
    ]);
  });

  it('should correctly calculate min, max and versions within range for pre release versions', () => {
    const range = '^1.2.0';
    const versions = [
      '1.3.0',
      '1.2.1',
      '1.2.0',
      '1.1.0',
      '1.0.0',
      '1.2.0-pre.0',
    ];

    const result = getVersionsInfoInRange(range, versions);

    expect(result.min.version).toBe('1.2.0');
    expect(result.max.version).toBe('1.3.0');
    expect(result.versions.map((v) => v.version)).toEqual([
      '1.3.0',
      '1.2.1',
      '1.2.0',
    ]);
  });

  it('should correctly calculate min, max and versions within range for pre release versions with pre release range', () => {
    const range = '^1.2.0-pre.0';
    const versions = [
      '1.3.0',
      '1.2.1',
      '1.2.0',
      '1.1.0',
      '1.0.0',
      '1.2.0-pre.0',
    ];

    const result = getVersionsInfoInRange(range, versions);

    expect(result.min.version).toBe('1.2.0-pre.0');
    expect(result.max.version).toBe('1.3.0');
    expect(result.versions.map((v) => v.version)).toEqual([
      '1.3.0',
      '1.2.1',
      '1.2.0',
      '1.2.0-pre.0',
    ]);
  });

  it('should throw an error for an invalid range', () => {
    const range = 'invalid';
    const versions = ['1.2.0', '1.1.0', '1.0.0'];

    expect(() => getVersionsInfoInRange(range, versions)).toThrow();
  });

  it('should throw an error for an invalid version', () => {
    const range = '^1.2.0';
    const versions = ['1.2.0', 'invalid', '1.0.0'];

    expect(() => getVersionsInfoInRange(range, versions)).toThrow(
      `Invalid version: invalid`
    );
  });
});
