export type NxCommandInputs = {
  affectedToIgnore: string[];
  args: string[];
  command: 'targetedAll' | 'targetedProjects' | 'targetedAffected' | 'showAffectedList';
  baseBoundaryOverride: string;
  headBoundaryOverride: string;
  isWorkflowsCiPipeline: boolean;
  parallel: number;
  projects: string[];
  setNxBranchToPrNumber: boolean;
  targets: string[];
  workingDirectory: string;
};
