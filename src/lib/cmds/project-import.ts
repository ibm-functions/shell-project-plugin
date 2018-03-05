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
import { sliceCmd, error, consume, checkExtraneous, checkExtraneousFlags } from './cli';
import { formatAsTable, showTemplateInSidecar, getTemplate, getCatalog } from '../catalog';
import { checkTools } from '../tools';
import { deploy } from '../deploy';

const usage = {
    title: 'Import a project template from Github',
    header: '',
    example: 'import [<name>], import [<url>]', // import [<owner/repo>],
    optional: [
        { name: '<name>', docs: 'the template name' },
        // { name: '<owner/repo>', docs: 'the github repository containing the template' },
        { name: '<url>', docs: 'the URL pointing to the manifest to deploy' },
        { name: '-p|--param', docs: 'template parameter KEY=VALUE' }

    ]
};

const doImport = prequire => async (block, nextBlock, _3, { errors, ui }, _4, _5, _6, argv) => {
    if (argv.help)
        throw new errors.usage(usage);

    sliceCmd(argv, 'import');

    const repo = argv._.shift();

    checkExtraneous(errors, argv);

    if (!repo) {
        checkExtraneousFlags(errors, argv);

        const repos = await getCatalog();
        return formatAsTable(repos);
    } else {
        if (repo.startsWith('https:')) {

            const err = await checkTools(block, nextBlock, { ui });
            if (err !== "")
                return error({ errors }, err);

            const params = consume(argv, ['p', 'param']);
            checkExtraneousFlags(errors, argv);

            const aparams: Array<string> = typeof params === 'string' ? [params] : params;
            const kvs = {};
            aparams.forEach(kv => {
                const eqidx = kv.indexOf('=');
                if (eqidx === -1)
                    return error({ errors }, `malformed parameters ${kv}. Expected KEY=VALUE`);

                kvs[kv.substring(0, eqidx - 1)] = kv.substr(eqidx + 1);
            });

            return deploy(prequire, ui, repo, false, kvs);
        } else {
            checkExtraneousFlags(errors, argv);

            const template = await getTemplate(repo);
            if (template) {
                showTemplateInSidecar(template);
                return true;
            } else {
                return `no template found`;
            }
        }
    }
};

module.exports = (commandTree, prequire) => {
    commandTree.listen('/project/import', doImport(prequire));
};
