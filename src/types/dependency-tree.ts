export interface DependencyNode {
  id: string;
  data: {
    name: string;
    version: string;
    dev: boolean;
    circular: boolean;
  };
  children?: DependencyNode[];
}
