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

import { existsSync } from 'fs';
import { normalize, resolve  } from 'path';
import { syncProjectName } from './ui';

const projectkey = 'wsk.project';

export interface IProject {
    name: string;
    path: string;
}

// Register new project
export function addProject(path: string, projectName: string) {
    if (!existsSync(path))
        throw new Error(`${path} does not exists`);

    path = normalize(resolve(path));
    const projects = getProjects();

    projects.entries[projectName] = { name: projectName, path };
    if (!projects.current)
        projects.current = projectName;

    localStorage.setItem(projectkey, JSON.stringify(projects));
}

export function removeProject(name: string) {
    const projects = getProjects();
    delete projects.entries[name];

    if (projects.current === name) {
        const keys = Object.keys(projects.entries);
        projects.current = keys.length > 0 ? keys[0] : undefined;
    }

    localStorage.setItem(projectkey, JSON.stringify(projects));
}

export function getProject(name: string): IProject {
    return getProjects().entries[name];
}

export function getProjects() {
    return JSON.parse(localStorage.getItem(projectkey) || '{ "entries": {} }');
}

export function getCurrentProject(): string {
    const projects = getProjects();
    return projects.current;
}

export function setCurrentProject(name: string) {
    const projects = getProjects();
    projects.current = name;
    localStorage.setItem(projectkey, JSON.stringify(projects));
}
