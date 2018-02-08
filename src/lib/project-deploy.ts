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

const usage = `Deploy project.

\tdeploy <project.yml>

Required parameters:
\t<project.yml>       the project configuration file. Default is project.yml`;

const doDeploy = (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help) {
        throw new modules.errors.usage(usage);
    }
    sliceCmd(argv, 'deploy');
    const file = argv._.shift() || 'project.yml';

    checkExtraneous(modules, argv);

    if (! existsSync(file))
        return error(modules, `${file} does not exists`);

    checkExtraneousFlags(modules, argv);
    return true;
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/deploy', doDeploy, { docs: 'Deploy project' });
};
