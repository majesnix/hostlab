#!/bin/bash
#
# run gitlab in docker

export GITLAB_CONFIG=/media/sf_gits/hostlab/config/gitlab.rb

sudo docker run --name gitlab \
--detach --restart always \
--hostname gitlab.local \
--publish 10.71.34.101:10443:443 \
--publish 10.71.34.101:10080:80 \
--publish 10.71.34.101:10022:22 \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest

sudo sh -c 'echo "\n10.71.34.101\tgitlab.local" >> /etc/hosts'
sudo docker cp ${GITLAB_CONFIG} gitlab:/etc/gitlab/gitlab.rb
