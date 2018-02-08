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
import { sliceCmd, error } from './cli';
import { addProject } from './storage';

export const docs = 'Add project to the shell';

const usage = `Register project.

\tadd <projectRootPath>

Required parameters:
\t<project_path>       the project root path`;

const doAdd = async (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    sliceCmd(argv, 'add');
    const path = argv._.shift();

    if (!path)
        return error(modules, 'missing path');

    if (!existsSync(path))
        return error(modules, `${path} does not exists`);

    addProject(path);
    return true;
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/add', doAdd, { docs });
};
