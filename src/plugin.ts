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
import { switchTo, syncProjectName } from "./lib/cmds/ui";
import { getCurrentProjectName, getProject, getCurrentProject } from "./lib/storage";
import { EventEmitter } from 'events';

declare const ui: any;

// preloading hook.
function init(commandTree, prequire) {
    if (ui.headless) return;

    const host = document.getElementById('openwhisk-api-host');
    if (host) {
        host.setAttribute('title', 'Your project name. Click to change to another project');
        host.setAttribute('onclick', 'repl.partial("project set <your_project_name>")');
    }

    const wsk = prequire('/ui/commands/openwhisk-core');
    const projectName = getCurrentProjectName();
    if (projectName) {
        const project = getProject(projectName);
        switchTo(wsk, projectName, project.path);
    } else {
        syncProjectName();
    }
}

module.exports = (commandTree, prequire) => {
    require('./lib/cmds/project')(commandTree, prequire);
    require('./lib/cmds/wsk')(commandTree, prequire);

    init(commandTree, prequire);

    return {
        current: getCurrentProject
    };
};
