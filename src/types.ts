export type NxCommandInputs = {
  affectedToIgnore: string[];
  args: string[];
  command:
    | 'runManyListedTargetsAndAllProjects'
    | 'runManyListedTargetsAndListedProjects'
    | 'runManyListedTargetsAndAffectedProjects'
    | 'showAffectedList';
  baseBoundaryOverride: string;
  headBoundaryOverride: string;
  isWorkflowsCiPipeline: boolean;
  projects: string[];
  setNxBranchToPrNumber: boolean;
  targets: string[];
  workingDirectory: string;
};
