/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const snek = require('snekfetch');
const log = require('debug')('hostlab:module:retrieveUserGitlabProjects');

/**
 * Retrieves the given gitlab repository (by gitlabID)
 * @param {number} repoId The ID of the gitlab repository
 * @returns {Promise<Object>}
 * @example
 * // Retrieves a specific repository of the Gitlab User with the repository ID 1
 * const info = await getGitlabRepository(1);
 */

module.exports = async function(repoId) {
  const {text} = await snek.get(
      `${process.env.GITLAB_URL}/api/v4/projects/${repoId}?private_token=${process.env.GITLAB_TOKEN}`);
  const repo = JSON.parse(text);

  return repo;
};
