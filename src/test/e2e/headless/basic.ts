/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import { suite, test, slow, timeout, skip } from 'mocha-typescript';
import * as assert from 'assert';
import { exec } from 'child-process-promise';

@suite('Basic Test - Headless')
class BasicHeadless {

    static async before() {
        process.chdir('src/test/e2e/headless/fixtures/basic');
    }

    @test('should add a project')
    async addProject() {
        if (process.env.CI !== 'true')
            return skip(this);

        const ok = await exec('fsh project add');
        assert.deepEqual(ok, 'ok');
        const list = await exec('fsh project list');
    }

}
