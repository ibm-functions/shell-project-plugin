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
import { getProject } from './storage';
import { error, sliceCmd, patchOW } from './cli';
import { docSet } from './docs';
import { switchTo } from './ui';

const usage = `${docSet}

\tset <projectName>

Required parameters:
\t<projectName>       the project name`;

const doSet = wsk => (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    sliceCmd(argv, 'set');
    const name = argv._.shift();

    if (!name)
        return error(modules, 'missing project name');

    const project = getProject(name);
    if (!project)
        return error(modules, `project ${name} does not exists`);

    switchTo(wsk, name, project.path);
};

module.exports = (commandTree, prequire) => {
    const wsk = prequire('/ui/commands/openwhisk-core');

    commandTree.listen('/project/set', doSet(wsk), { docs: docSet });
};
