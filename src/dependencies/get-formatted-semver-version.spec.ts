import { SemVer } from 'semver';
import { formatSemver } from './get-formatted-semver-version';

describe(formatSemver.name, () => {
  it('should format SemVer object into string', () => {
    const version: SemVer = new SemVer('1.2.3');
    expect(formatSemver(version)).toBe('1.2.3');
  });
  it('should format pre release SemVer object into string', () => {
    const version: SemVer = new SemVer('1.2.3-pre.0');
    expect(formatSemver(version)).toBe('1.2.3');
  });
});