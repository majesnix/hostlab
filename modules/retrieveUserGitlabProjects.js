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

const slugify = require('slugify');
const snek = require('snekfetch');
const log = require('debug')('hostlab:module:retrieveUserGitlabProjects');

module.exports = async function(userGitlabId) {
  const {text} = await snek.get(
      `${process.env.GITLAB_URL}/api/v4/projects?private_token=${process.env.GITLAB_TOKEN}&sudo=${userGitlabId}&membership=true`);
  const projects = JSON.parse(text);

  const repositories = [];

  for (let project of projects) {
    let packagejson;
    try {
      packagejson = (await snek.head(
          `${process.env.GITLAB_URL}/api/v4/projects/${project.id}/repository/files/package.json?private_token=${process.env.GITLAB_TOKEN}&ref=master`))
          ? true
          : false;
    } catch (err) {
      // Catches snekfetch promise rejection (thrown when the project has no package.json), no need to process this.
    }

    if (!project.archived && packagejson) {
      let projBranches = JSON.parse(
          (await snek.get(project._links.repo_branches +
              `?private_token=${process.env.GITLAB_TOKEN}`)).text);

      repositories.push({
        id: project.id,
        name: project.name,
        path: project.path_with_namespace,
        repo_url: project.http_url_to_repo,
        branches: projBranches.map(e => e.name),
      });
    }
  }

  return repositories;
};
