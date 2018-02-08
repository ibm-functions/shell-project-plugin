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
import { getCurrentProject } from './storage';

export function syncProjectName() {
    const nameElem = document.getElementById('openwhisk-api-host');
    const projectName = getCurrentProject() || 'no project';
    nameElem.childNodes[0].textContent = projectName;
}

export function printProjects(projects): HTMLElement {
    const response = document.createElement('div');
    response.className = 'result-table';

    const repl = document.createElement('div');
    response.appendChild(repl);
    repl.className = 'repl-result';

    const rows = document.createElement('div');
    repl.appendChild(rows);
    rows.className = 'entity';

    const header = document.createElement('div');
    rows.appendChild(header);
    header.className = 'entity-attributes';
    header.style.fontWeight = '500';
    header.style.borderBottom = '1px solid';

    const header1 = document.createElement('span');
    header1.style.borderRight = '1px solid';
    header1.style.textAlign = 'center';
    header.appendChild(header1);
    header1.innerText = 'Name';

    const header2 = document.createElement('span');
    header2.style.borderRight = '1px solid';
    header2.style.textAlign = 'center';
    header.appendChild(header2);
    header2.innerText = 'Path';

    Object.keys(projects).forEach(projectName => {
        const row = document.createElement('div');
        rows.appendChild(row);
        row.className = 'entity-attributes';

        const cell1 = document.createElement('span');
        cell1.className = 'repl-result-prefix';
        row.appendChild(cell1);
        cell1.innerText = projectName;

        const cell2 = document.createElement('span');
        cell2.className = 'repl-result-prefix';
        row.appendChild(cell2);
        cell2.innerText = projects[projectName];
    });
    return response;
}
