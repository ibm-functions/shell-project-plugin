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
import { getProjects } from '../storage';
import * as colors from 'colors';

declare const repl: any;
declare const ui: any;

const doList = async (_1, _2, _3, modules, _4, _5, _6, argv) => {
    if (argv.help)
        throw new modules.errors.usage(usage);

    const projects = getProjects();

    const entries = projects.entries;
    if (Object.keys(entries).length === 0) {
        if (ui.headless) {
            return 'no projects. Use ' + 'project add'.bold + ' to add a project';
        } else {
            const div = document.createElement('div');
            div.innerHTML = `<span>
                              no projects. Please use
                              <span class='clickable' onclick='repl.partial("project add")'>project add</span>
                              to add one
                         </span>`;
            return div;
        }
    }

    return Object.keys(entries).map(key => {
        const value = entries[key];
        return {
            name: key,
            type: 'project',
            onclick: () => repl.pexec(`project set ${key}`),
            attributes: [
                {
                    value: value.path,
                    css: 'deemphasize'
                }]
        };
    });
};

module.exports = (commandTree, require) => {
    const master = commandTree.listen('/project/list', doList, { docs: '' });
    commandTree.synonym('/project/ls', doList, master);
};
