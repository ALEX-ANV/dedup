import { getPreviousVersion } from './get-previous-version'

jest.mock('./get-versions-info-in-range', () => ({
    getVersionsInfoInRange: jest.fn().mockReturnValue({ max: '1.2.3' }),
}))

describe(getPreviousVersion.name, () => {
    it('should correctly update the minor version', () => {
        const dep = { needs: '', name: '', version: '1.2.3' }
        const remoteVersions = ['1.2.2', '1.2.1', '1.2.0']
        const type = 'minor'

        const result = getPreviousVersion(dep, remoteVersions, type)

        expect(result).toBe('1.2.0')
    })

    it('should correctly update the major version', () => {
        const dep = { needs: '', name: '', version: '2.2.3' }
        const remoteVersions = ['2.1.0', '2.0.0', '1.0.0']
        const type = 'major'

        const result = getPreviousVersion(dep, remoteVersions, type)

        expect(result).toBe('2.0.0')
    })

    it('should correctly update the patch version', () => {
        const dep = { needs: '', name: '', version: '1.2.3' }
        const remoteVersions = ['1.2.2', '1.2.1', '1.2.0']
        const type = 'patch'

        const result = getPreviousVersion(dep, remoteVersions, type)

        expect(result).toBe('1.2.2')
    })

    it('should throw an error for an invalid version', () => {
        const dep = { needs: '', name: '', version: 'invalid' }
        const remoteVersions = ['1.2.2', '1.2.1', '1.2.0']
        const type = 'patch'

        expect(() => getPreviousVersion(dep, remoteVersions, type)).toThrow(
            `Invalid version: ${dep.version}`
        )
    })
})
