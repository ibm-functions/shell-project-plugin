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
import { getProjects, setCurrentProject } from './storage';
import { error, sliceCmd } from './cli';
import { docSet } from './docs';

declare const repl: any;

const usage = `${docSet}

\tset <projectName>

Required parameters:
\t<projectName>       the project name`;

const doSet = async (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    sliceCmd(argv, 'set');
    const name = argv._.shift();

    if (!name)
        return error(modules, 'missing project name');

    const projects = getProjects().entries;
    if (!projects[name])
        return error(modules, `project ${name} does not exists`);
    setCurrentProject(name);
    return true;
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/set', doSet, { docs: docSet });
};
