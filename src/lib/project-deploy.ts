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
import { sliceCmd, error, checkExtraneous, checkExtraneousFlags } from './cli';
import { checkTools, getToolsDir } from './tools';
import { join } from 'path';
import { execSync } from 'child_process';

const usage = `Deploy project.

\tdeploy [<manifest.yml>]

Required parameters:
\t<manifest.yml>       the project configuration file (default "manifest.yml")`;

async function doDeploy(block, nextBlock, _3, { ui, errors }, _4, _5, _6, argv) {
    if (argv.help) {
        throw new errors.usage(usage);
    }
    const err = await checkTools(block, nextBlock, { ui });
    if (err !== "")
        return error({ errors }, err);

    sliceCmd(argv, 'deploy');
    const file = argv._.shift() || 'manifest.yml';

    checkExtraneous({ errors }, argv);

    if (!existsSync(file))
        return error({ errors }, `${file} does not exists`);

    checkExtraneousFlags({ errors }, argv);

    const wskdeploy = join(getToolsDir(ui), 'wskdeploy').replace(/[ ]/g, '\\ ');
    return execSync(`${wskdeploy} --managed`).toString();
}

module.exports = (commandTree, require) => {
    commandTree.listen('/project/deploy', doDeploy, { docs: 'Deploy project' });
};
