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
import { sliceCmd, error, consume, checkExtraneous, checkExtraneousFlags } from './cli';
import { addProject } from '../storage';
import { basename, extname } from 'path';

const usage = {
    header: 'Add a project to the shell',
    example: 'project add [<project_path>]',
    optional: [
        { name: '<project_path>', docs: 'the project root path or the  current directory' },
        { name: '-n|--name  <project_name>', docs: 'the project name or project path last segment' }
    ]
};

const doAdd = async (_1, _2, _3, { errors }, _4, _5, _6, argv) => {
    if (argv.help)
        throw new errors.usage(usage);

    sliceCmd(argv, 'add');

    const path = argv._.shift() || process.cwd();
    if (!existsSync(path))
        return error(errors, `${path} does not exists`);

    checkExtraneous(errors, argv);

    const pname = consume(argv, ['n', 'name']);
    const projectName = pname || basename(path, extname(path));

    checkExtraneousFlags(errors, argv);

    addProject(path, projectName);
    return true;
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/add', doAdd);
};
