/*
 * Copyright 2018 IBM Corporation
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
const usage = {
    title: 'Project management operations',
    header: 'These commands will help you create, switch and deploy projects',
    example: 'project <command>',
    commandPrefix: 'project',
    available: [
        { command: 'add', docs: 'Add project to the shell' },
        { command: 'remove', docs: 'Remove project from the shell', partial: '<project_name>' },
        { command: 'set', docs: 'Set current project', partial: '<project_name>' },
        { command: 'unset', docs: 'Unset current project' },
        { command: 'list', docs: 'List projects added to the shell' },
        { command: 'import', docs: 'Import external project to the current project' },
        { command: 'deploy', docs: 'Deploy project' },
        { command: 'undeploy', docs: 'Undeploy project' }
    ],
    related: []
};

module.exports = (commandTree, prequire) => {
    commandTree.subtree('/project', { usage });

    require('./project-add')(commandTree, prequire);
    require('./project-set')(commandTree, prequire);
    require('./project-unset')(commandTree, prequire);
    require('./project-remove')(commandTree, prequire);
    require('./project-list')(commandTree, prequire);
    require('./project-import')(commandTree, prequire);

    require('./project-deploy')(commandTree, prequire);
    require('./project-undeploy')(commandTree, prequire);
};
