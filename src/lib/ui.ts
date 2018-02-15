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
import { getCurrentProject, setCurrentProject } from './storage';
import { patchOW } from './cli';

declare const repl: any;

export async function switchTo(wsk, name: string, path: string) {
    setCurrentProject(name);
    syncProjectName();
    patchOW(wsk);
    return repl.qexec(`lcd ${path}`);
}

export function syncProjectName() {
    const nameElem = document.getElementById('openwhisk-api-host');
    const projectName = getCurrentProject() || 'no project';
    nameElem.childNodes[0].textContent = projectName;
}

export interface ITable {
    headers: Array<string>;
    rows: Array<Array<ICell>>;
}

export interface ICell {
    name: string;
    onclick?: () => any;
}

export function printTable(table: ITable): HTMLElement {
    const response = document.createElement('div');
    response.className = 'result-table';

    const repl = document.createElement('div');
    response.appendChild(repl);
    repl.className = 'repl-result';

    const rows = document.createElement('div');
    repl.appendChild(rows);
    rows.className = 'entity';

    if (table.headers) {
        const headers = document.createElement('div');
        rows.appendChild(headers);
        headers.className = 'entity-attributes';
        headers.style.fontWeight = '500';
        headers.style.borderBottom = '1px solid';
        table.headers.forEach(headerText => {
            headers.appendChild(headerHTML(headerText));
        });
    }

    if (table.rows) {
        table.rows.forEach(rowTexts => {
            const row = document.createElement('div');
            rows.appendChild(row);
            row.className = 'entity-attributes';

            rowTexts.forEach(cell => {
                row.appendChild(cellHTML(cell));
            });
        });
    }

    return response;
}

function headerHTML(text: string): HTMLElement {
    const header = document.createElement('span');
    header.style.textAlign = 'center';
    header.innerText = text;
    return header;
}

function cellHTML(cell: ICell): HTMLElement {
    const span = document.createElement('span');
    span.className = 'entity-name-group';
    span.innerText = cell.name;
    if (cell.onclick) {
        span.onclick = cell.onclick;
    }
    return span;
}
