import { DepDictionary } from '../types/project-info';
export declare function checkMatchingRootVersionWithPeerDependencies(dictionary: Record<string, DepDictionary>): {
    name: string;
    needs: string;
}[];
