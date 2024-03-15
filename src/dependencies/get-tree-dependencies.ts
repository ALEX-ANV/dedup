import { DependencyNode } from '../types/dependency-tree';
import { DependencyEntity, LockFile, ProjectInfo } from '../types/project-info';

type Packages = {
  [key: string]: {
    dependencies?: {
      [key: string]: {
        requires: boolean;
        version: string;
        name: string;
      };
    };
    dependents?: string[];
    version: string;
    name: string;
  };
};

export async function getTreeDependencies(projectInfo: ProjectInfo) {
  const root: DependencyNode = getNode(projectInfo.name, projectInfo.version);

  const packages: Packages = flatten(projectInfo.lock.dependencies);

  packages[getNodeID(projectInfo)] = {
    name: projectInfo.name,
    version: projectInfo.version,
    dependencies: Object.keys(projectInfo.lock.dependencies).reduce(
      (acc, name) => ({
        ...acc,
        [name]: {
          requires: true,
          version: projectInfo.lock.dependencies[name].version,
          name,
        },
      }),
      {}
    ),
  };

  traversePackages(root, packages);

  return root;
}

function flatten(deps: LockFile['dependencies'] = {}): Packages {
  let flattened: Packages = {};

  Object.keys(deps).forEach((name) => {
    const { dependencies: subDeps = {}, requires = {}, version } = deps[name];
    const fullName = [name, version].join('@');
    const entry =
      flattened[fullName] ||
      (flattened[fullName] = {
        name,
        version,
      });

    entry.dependencies || (entry.dependencies = {});

    Object.keys(requires).forEach((subName) => {
      const subFullName = [subName, requires[subName]].join('@');

      entry.dependencies[subFullName] = {
        requires: !subDeps[subFullName],
        version: requires[subName],
        name: subName,
      };

      const subEntry =
        flattened[subFullName] ||
        (flattened[subFullName] = {
          name: subName,
          version: requires[subName],
        });
      const dependents = subEntry.dependents || (subEntry.dependents = []);

      dependents.push(fullName);
    });

    flattened = { ...flattened, ...flatten(subDeps) };
  });

  return flattened;
}

function traversePackages(
  parentNode: DependencyNode,
  packages: Packages,
  visitedNodes: string[] = []
) {
  const dependencies = packages[getNodeID(parentNode.data)].dependencies ?? {};

  const entries = Object.entries(dependencies);

  if (!entries.length) {
    return;
  }

  for (const [, { requires, version, name }] of entries) {
    const circular = visitedNodes.includes(name);
    const dependencyNode = getNode(name, version, circular, requires);

    parentNode.children.push(dependencyNode);

    if (circular) {
      continue;
    }

    traversePackages(dependencyNode, packages, [...visitedNodes, name]);
  }
}

function getNode(
  name: string,
  version: string,
  circular = false,
  dev = false
): DependencyNode {
  return {
    id: getNodeID({ name, version }),
    data: {
      name,
      version,
      dev,
      circular,
    },
    children: [],
  };
}

function getNodeID(node: DependencyEntity) {
  return `${node.name}@${node.version}`;
}

// async function getDependencies(
//   dependency: DependencyNode
// ): Promise<DependencyEntity[]> {
//   const { dependencies, devDependencies, peerDependencies } =
//     await getRemoteMeta(
//       dependency.dependency.name,
//       dependency.dependency.version,
//       ['dependencies', 'peerDependencies', 'devDependencies']
//     );
//   return combineDependencies(dependencies, devDependencies, peerDependencies);
// }
