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
import * as docs from './docs';

const usage = {
    title: 'Project management operations',
    header: 'These commands will help you create, switch and deploy projects',
    example: 'project <command>',
    commandPrefix: 'project',
    available: [
        { command: 'add', docs: docs.docAdd, partial: '--path .' },
        { command: 'remove', docs: docs.docRemove, partial: '<project_name>' },
        { command: 'set', docs: docs.docSet, partial: '<project_name>' },
        { command: 'unset', docs: docs.docUnset },
        { command: 'list', docs: docs.docList },
        { command: 'deploy', docs: docs.docDeploy, partial: '-m manifest.yml' },
        { command: 'undeploy', docs: docs.docUndeploy }
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
    require('./project-deploy')(commandTree, prequire);
    require('./project-undeploy')(commandTree, prequire);
};
