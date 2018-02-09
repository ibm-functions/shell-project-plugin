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

import { syncProjectName } from './lib/ui';

// preloading hook.
function init(commandTree, prequire) {
    if (typeof document === 'undefined') return;

    // const wsk = prequire('/ui/commands/openwhisk-core');

    const host = document.getElementById('openwhisk-api-host');
    if (host) {
        host.setAttribute('title', 'Your project name. Click to change to another project');
        host.setAttribute('onclick', 'repl.partial("project set <your_project_name>")');
    }

    syncProjectName();
}

module.exports = (commandTree, prequire) => {
    require('./lib/project')(commandTree, prequire);
    require('./lib/project-add')(commandTree, prequire);
    require('./lib/project-set')(commandTree, prequire);
    require('./lib/project-remove')(commandTree, prequire);
    require('./lib/project-list')(commandTree, prequire);

    init(commandTree, prequire);
};
