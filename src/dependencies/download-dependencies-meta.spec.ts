import { downloadDependenciesMeta } from './download-dependencies-meta'
import { InstalledPackageInfo } from '../types/installed-package'
import { Logger } from '../logger/logger-factory'

jest.mock('./get-remote-dependency-meta', () => ({
    getRemoteMeta: jest.fn().mockImplementation((name, version) => {
        if (!version) {
            return Promise.resolve({
                name,
                version: '10.0.0',
                peerDependencies: {},
                versions: [],
            })
        }
        return Promise.resolve({
            name,
            version,
            peerDependencies: {},
            versions: [],
        })
    }),
}))

describe(downloadDependenciesMeta.name, () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return the remote meta for each dependency', async () => {
        // Arrange
        const dependencies: InstalledPackageInfo[] = [
            { name: 'package1', version: '1.0.0', latest: false },
            { name: 'package2', version: '2.0.0', latest: false },
            { name: 'package3', version: '3.0.0', latest: false },
        ]
        const logger: Logger = {
            info: jest.fn(),
            warn: jest.fn(),
            next: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            fail: jest.fn(),
            succeed: jest.fn(),
        }

        // Act
        const result = await downloadDependenciesMeta(dependencies, logger)

        // Assert
        expect(result).toEqual(
            expect.objectContaining({
                package1: {
                    name: 'package1',
                    version: '10.0.0',
                    peerDependencies: {},
                    versions: [],
                },
                package2: {
                    name: 'package2',
                    version: '10.0.0',
                    peerDependencies: {},
                    versions: [],
                },
                package3: {
                    name: 'package3',
                    version: '10.0.0',
                    peerDependencies: {},
                    versions: [],
                },
            })
        )
    })

    it('should return the remote meta for each dependency with latest version', async () => {
        // Arrange
        const dependencies: InstalledPackageInfo[] = [
            { name: 'package1', version: '1.0.0', latest: true },
            { name: 'package2', version: '2.0.0', latest: true },
            { name: 'package3', version: '3.0.0', latest: true },
        ]
        const logger: Logger = {
            info: jest.fn(),
            warn: jest.fn(),
            next: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            fail: jest.fn(),
            succeed: jest.fn(),
        }

        // Act
        const result = await downloadDependenciesMeta(dependencies, logger)

        // Assert
        expect(result).toEqual(
            expect.objectContaining({
                package1: {
                    name: 'package1',
                    version: '1.0.0',
                    peerDependencies: {},
                    versions: [],
                },
                package2: {
                    name: 'package2',
                    version: '2.0.0',
                    peerDependencies: {},
                    versions: [],
                },
                package3: {
                    name: 'package3',
                    version: '3.0.0',
                    peerDependencies: {},
                    versions: [],
                },
            })
        )
    })
})
