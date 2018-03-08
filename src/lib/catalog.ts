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

import * as octokitc from '@octokit/rest';
import { get } from 'https';
import { join } from 'path';
import * as dbgc from 'debug';

const debug = dbgc('project:catalog');

declare const repl: any;
declare const ui: any;

interface IRepos {
    data: IRepoData;
}

interface IRepoData {
    total_count: number;
    items: Array<IRepoItem>;
}

interface IRepoItem {
    name: string;
    full_name: string;
    html_url: string;
    description: string;
}

type ManifestBP = Array<IManifestDesc>;

export interface IManifestDesc {
    name: string;
    description: string;
    long_description: string;
    url: string;
    id: string;
    full_name: string;
    runtime: Array<IManifestDescRuntime>;
    categories: Array<string>;
}

export interface IManifestDescRuntime {
    name: string;
    kind: string;
    type: string;
}
export async function getTemplate(name: string): Promise<IManifestDesc> {
    const templates = await getCatalog();
    return templates.find(template => template.name === name);
}

async function httpGet(url: string) {
    return new Promise((resolve) => {
        debug(`get ${url}`);
        get(url, res => {
            const { statusCode } = res;
            if (statusCode !== 200)
                return resolve(null);

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', chunk => { rawData += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (e) {
                    debug(e);
                    resolve(null);
                }
            });
        }).on('error', e => {
            debug(e);
            resolve(null);
        });
    });
}

export function formatAsTable(repos: ManifestBP) {
    return repos.map(item => ({
        name: item.name,
        type: 'template',
        onclick: () => repl.pexec(`project import "${item.name}"`),
        attributes: [
            {
                value: item.description,
                css: 'deemphasize'
            },
            {
                value: 'nodejs',
                css: 'deemphasize'
            }]

    }));
}

export function showTemplateInSidecar(template: IManifestDesc) {
    ui.injectCSS(join(__dirname, '..', '..', 'resources', 'sidecar.css'));

    ui.addNameToSidecarHeader(undefined, template.name, template.full_name, 'onclick', 'template');
    ui.addVersionBadge({ version: 'boo' }, true);
    const deployMode = {
        mode: 'deploy',
        label: 'Deploy',
        type: 'custom',
        actAsButton: true,
        direct: () => {
            const packageName = (document.getElementById('sidecar-template-input-PACKAGE') as HTMLInputElement).value;

            repl.pexec(`project import "${template.url}.git/runtimes/nodejs/manifest.yaml" -p PACKAGE_NAME=${packageName}`);
        }
    };

    ui.showCustom({ content: sidecar(template), modes: [deployMode] });
}

// --- HTML

function sidecar(template: IManifestDesc): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'sidecar-template';
    div.innerHTML = `
        <div class="sidecar-template-desc">
            <span>${template.long_description}</span>
        </div>
        <div class="sidecar-template-inputs">
            <span class="sidecar-template-input-header">Input Parameters</span>
            ${parameter('PACKAGE', 'Package name')}
        <div>`;

    return div;
}

function parameter(name: string, label: string): string {
    return `<div class="sidecar-template-input">
              <label class="sidecar-template-input-label">${label}</label>
              <input onclick="event.stopPropagation();" class="sidecar-template-input-text" type="text" id="sidecar-template-input-${name}"/>
            </div>`;
}

// --- Local template catalog cache

const catalogkey = 'wsk.project.catalog';

async function refreshCatalogCache(): Promise<ManifestBP> {
    const octokit = new octokitc();
    const repos = await octokit.search.repos({ q: 'topic:openwhisk-packages+fork:true' }) as IRepos;
    debug(repos);

    // TODO: looks at tagged repos.
    const validrepos = [];
    for (let item of repos.data.items) {
        const content = await httpGet(`https://raw.githubusercontent.com/${item.full_name}/master/manifest-bp.json`) as IManifestDesc;
        if (content) {
            content.url = item.html_url;
            content.full_name = item.full_name;
            content.id = item.name;
            validrepos.push(content);
        }
    }

    localStorage.setItem(catalogkey, JSON.stringify(validrepos));
    return validrepos;
}

export async function getCatalog(): Promise<ManifestBP> {
    const catalog = localStorage.getItem(catalogkey);
    if (!catalog)
        return refreshCatalogCache();

    return JSON.parse(catalog);
}
