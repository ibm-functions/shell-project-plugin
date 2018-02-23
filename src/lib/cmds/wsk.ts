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
import { getCurrentProjectName } from "../storage";

import * as dbgc from 'debug';
import { sliceCmd } from "./cli";
const debug = dbgc('project:wsk');

declare const repl: any;

/* Augment all basic wsk commands to show/update assets in the project */

// tslint:disable-next-line:space-before-function-paren
const doList = rawList => async function () {
    const result = await rawList.apply(undefined, arguments);
    const projectName = getCurrentProjectName();
    if (projectName && result && result.filter) {
        debug(`filtering ${result.length} actions in project ${projectName}`);
        return result.filter(action => {
            const managed = getManagedAnnotation(action.annotations);
            return managed ? managed.__OW_PROJECT_NAME === projectName : false;
        });
    }
    return result;
};

// tslint:disable-next-line:space-before-function-paren
const doUpdate = rawUpdate => async function () {
    const projectName = getCurrentProjectName();
    if (projectName) {
        arguments[2] = [...arguments[2], '-a', 'managed', JSON.stringify({ __OW_PROJECT_NAME: projectName })];
    }
    return rawUpdate.apply(null, arguments);
};

// tslint:disable-next-line:space-before-function-paren
const doGet = rawGet => async function () {
    const result = await rawGet.apply(undefined, arguments);
    if (result && result.message)
        checkInProject(result.message.annotation);

    return result;
};

// tslint:disable-next-line:space-before-function-paren
const doGuardedCmd = (getCmd: string, rawCmd, cmd: string, wsk) => async function () {
    // Extract entity and doGet
    const argv = wsk.parseOptions([...arguments[2]]).argv;
    const nocmd = argv.slice(argv.indexOf(cmd) + 1);
    const name = nocmd.slice(0, 1);
    const entityname = name.length > 0 ? name[0] : null;
    if (entityname) {
        const result = await repl.pexec(`${getCmd} "${entityname}"`, { echo: false, noHistory: true });
        if (result)
            checkInProject(result.annotations);
    }

    return await rawCmd.apply(null, arguments);
};

function checkInProject(annotations) {
    const projectName = getCurrentProjectName();
    if (!projectName)
        return;

    const managed = getManagedAnnotation(annotations);
    if (managed && managed.__OW_PROJECT_NAME === projectName)
        return;

    throw new Error(`The requested resource does not exist in this project.`);
}

function getManagedAnnotation(annotations) {
    if (annotations) {
        for (const kv of annotations) {
            if (kv.key === 'managed') {
                return kv.value;
            }
        }
    }
    return null;
}

module.exports = (commandTree, prequire) => {
    const wsk = prequire('/ui/commands/openwhisk-core');

    const listVerbs = wsk.synonyms('list', 'verbs');
    // TODO: something's wrong with 'activations'
    for (const entity of ['actions', 'rules', 'triggers', 'packages']) {
        wsk.synonyms(entity).forEach(sentity => {
            listVerbs.forEach(list => {
                const rawCmd = commandTree.find(`/wsk/${entity}/${list}`);
                commandTree.listen(`/wsk/${sentity}/${list}`, doList(rawCmd.$), { docs: `List ${entity}` });
            });
        });
    }

    for (const verb of ['update', 'create']) {
        const synVerbs = wsk.synonyms(verb, 'verbs');
        for (const entity of ['actions', 'rules', 'triggers', 'packages']) {
            const rawCmd = commandTree.find(`/wsk/${entity}/${verb}`);

            wsk.synonyms(entity).forEach(sentity => {
                synVerbs.forEach(sverb => {
                    commandTree.listen(`/wsk/${sentity}/${sverb}`, doUpdate(rawCmd.$), { docs: `${verb} ${entity}` });
                });
            });
        }
    }

    for (const verb of ['get', 'fire', 'delete', 'invoke']) {
        const synVerbs = wsk.synonyms(verb, 'verbs');
        for (const entity of ['actions', 'rules', 'triggers', 'packages']) {
            const getCmd = `wsk ${entity} get`;
            const rawCmd = commandTree.find(`/wsk/${entity}/${verb}`);
            if (rawCmd) {
                wsk.synonyms(entity).forEach(sentity => {
                    synVerbs.forEach(sverb => {
                        commandTree.listen(`/wsk/${sentity}/${sverb}`, verb === 'get' ? doGet(rawCmd.$) : doGuardedCmd(getCmd, rawCmd.$, sverb, wsk), { docs: `Get ${entity}` });
                    });
                });
            }
        }
    }

};
