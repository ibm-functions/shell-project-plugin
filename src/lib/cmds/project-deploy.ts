/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { existsSync } from 'fs';
import { sliceCmd, error, checkExtraneous, checkExtraneousFlags, consume } from './cli';
import { checkTools, getToolsDir } from '../tools';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import * as dbgc from 'debug';
const debug = dbgc('project:deploy');

const usage = `Deploy project.

\tdeploy

Optional parameters:
\t-m <manifest.yml>       the manifest to deploy (default manifest.yml)`;

const doDeploy = prequire => async (block, nextBlock, _3, { ui, errors }, _4, _5, _6, argv) => {
    if (argv.help) {
        throw new errors.usage(usage);
    }
    const err = await checkTools(block, nextBlock, { ui });
    if (err !== "")
        return error({ errors }, err);

    sliceCmd(argv, 'deploy');
    checkExtraneous({ errors }, argv);

    const file = consume(argv, ['m']) || 'manifest.yml';

    if (!existsSync(file))
        return error({ errors }, `${file} does not exists`);

    checkExtraneousFlags({ errors }, argv);

    const env = getEnvPlugin(prequire);
    const current = env ? env.current() : null;
    const userData = ui.userDataDir();

    const sysenv = prepareEnvVars(current);
    const wskdeploy = join(getToolsDir(ui), 'wskdeploy').replace(/[ ]/g, '\\ ');

    return execSync(`${wskdeploy} --managed`, { env: sysenv }).toString();
};

function getEnvPlugin(prequire) {
    try {
        return prequire('shell-environment-plugin');
    } catch (e) {
        // no environment, fine
        return null;
    }
}

// Extends system environment variables
function prepareEnvVars(env): { [key: string]: string } {
    if (env) {
        const vars = { ...env.variables };
        Object.keys(vars).forEach(key => {
            vars[key] = vars[key].value;
        });
        // TODO: consider not inheriting process env
        return { ...process.env, ...vars };
    }
    // TODO: consider not inheriting process env
    return { ...process.env };
}

module.exports = (commandTree, prequire) => {
    commandTree.listen('/project/deploy', doDeploy(prequire), { docs: 'Deploy project' });
};
