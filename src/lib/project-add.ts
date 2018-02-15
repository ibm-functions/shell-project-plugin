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
import { sliceCmd, error, consume } from './cli';
import { addProject } from './storage';
import { docAdd } from './docs';
import { basename, extname } from 'path';

const usage = `${docAdd}

\tadd [<project_root_path>]

Optional parameters:
\t<project_path>               the project root path. Default is current path;
\t--name, -n <project_name>    the project name. Default is project path last segment`;

const doAdd = async (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    sliceCmd(argv, 'add');
    const path = argv._.shift() || process.cwd();

    if (!existsSync(path))
        return error(modules, `${path} does not exists`);

    const pname = consume(argv, ['n', 'name']);
    const projectName = pname || basename(path, extname(path));

    addProject(path, projectName);
    return true;
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/add', doAdd, { docs: docAdd });
};
