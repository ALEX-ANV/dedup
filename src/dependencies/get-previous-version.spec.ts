import { getPreviousVersion } from './get-previous-version';
import { formatSemver } from './get-formatted-semver-version';

describe(getPreviousVersion.name, () => {
  it('should correctly update the minor version', () => {
    const version = '1.2.3';
    const remoteVersions = ['1.2.2', '1.2.1', '1.1.0'];
    const type = 'minor';

    const result = getPreviousVersion(version, remoteVersions, type);

    expect(formatSemver(result)).toBe('1.1.0');
  });

  it('should correctly update the major version', () => {
    const version = '2.2.3';
    const remoteVersions = ['2.1.0', '2.0.0', '1.0.0'];
    const type = 'major';

    const result = getPreviousVersion(version, remoteVersions, type);

    expect(formatSemver(result)).toBe('1.0.0');
  });

  it('should correctly update the patch version', () => {
    const version = '1.2.3';
    const remoteVersions = ['1.2.2', '1.2.1', '1.2.0'];
    const type = 'patch';

    const result = getPreviousVersion(version, remoteVersions, type);

    expect(formatSemver(result)).toBe('1.2.2');
  });

  it('should throw an error for an invalid version', () => {
    const version = 'invalid';
    const remoteVersions = ['1.2.2', '1.2.1', '1.2.0'];
    const type = 'patch';

    expect(() => getPreviousVersion(version, remoteVersions, type)).toThrow(
      `Invalid version: ${version}`
    );
  });
});
