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
    full_name: string;
    runtime: Array<IManifestDescRuntime>;
    categories: Array<string>;
}

export interface IManifestDescRuntime {
    name: string;
    kind: string;
    type: string;
}

export async function searchTemplates(): Promise<ManifestBP> {
    const octokit = new octokitc();
    const repos = await octokit.search.repos({ q: 'topic:openwhisk-packages+fork:true' }) as IRepos;
    debug(repos);
    // TODO: looks at tags.
    const validrepos = [];
    for (let item of repos.data.items) {
        const content = await httpGet(`https://raw.githubusercontent.com/${item.full_name}/master/manifest-bp.json`) as IManifestDesc;

        if (content) {
            content.url = item.html_url;
            content.full_name = item.full_name;
            validrepos.push(item);
        }
    }

    return validrepos;
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
        onclick: () => repl.pexec(`project import https://raw.githubusercontent.com/${item.full_name}/master/runtimes/nodejs/manifest.yaml`),
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
