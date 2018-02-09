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
import { getProjects } from './storage';
import { ITable, printTable } from './ui';
import { docList } from './docs';

declare const repl: any;

const usage = docList;

const doList = async (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    const projects = getProjects();

    const entries = projects.entries;
    const table = {
        headers: ['Name', 'Path'],
        rows: Object.keys(entries).map(key => {
            const onclick = () => repl.pexec(`project set ${key}`);
            return [{ name: key, onclick }, { name: entries[key], onclick }];
        })
    };

    return printTable(table);
};

module.exports = (commandTree, require) => {
    commandTree.listen('/project/list', doList, { docs: docList });
};
