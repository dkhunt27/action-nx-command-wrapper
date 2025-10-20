const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

export const execPromisified = async (command: string, execOverride?: typeof exec): Promise<string> => {
  execOverride = execOverride ?? exec;
  const { stdout, stderr } = await execOverride(command);
  if (stderr) {
    throw stderr;
  }
  return stdout;
};
