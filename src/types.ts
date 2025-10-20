export type Inputs = {
  affected: boolean;
  all: boolean;
  args: readonly string[];
  baseBoundaryOverride: string;
  headBoundaryOverride: string;
  isWorkflowsCiPipeline: boolean;
  parallel: number;
  projects: readonly string[];
  setNxBranchToPrNumber: boolean;
  targets: readonly string[];
  workingDirectory: string;
};
