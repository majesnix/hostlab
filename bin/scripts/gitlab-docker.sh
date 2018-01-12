#!/bin/bash
#
# run gitlab in docker

export EXTERNAL_IP=192.168.56.102
export GITLAB_CONFIG=/media/sf_hostlab/config/gitlab.rb

sudo docker run --name gitlab \
--detach --restart always \
--hostname gitlab.local \
--publish ${EXTERNAL_IP}:443:443 \
--publish ${EXTERNAL_IP}:80:80 \
--publish ${EXTERNAL_IP}:22:22 \
--volume /srv/gitlab/config:/etc/gitlab \
--volume /srv/gitlab/logs:/var/log/gitlab \
--volume /srv/gitlab/data:/var/opt/gitlab \
gitlab/gitlab-ce:latest

sudo sh -c 'echo "\n${EXTERNAL_IP}\tgitlab.local" >> /etc/hosts'
sudo docker cp ${GITLAB_CONFIG} gitlab:/etc/gitlab/gitlab.rb
