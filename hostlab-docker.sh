#!/usr/bin/env bash
#
# HostLab in Docker

export VM_HOSTLAB_IP=192.168.56.101
export VM_HOSTLAB_FOLDER=/media/sf_hostlab
export GITLAB_URL=gitlab.local
export GITLAB_TOKEN=YwPEnQeyq3f1Rn54dNJx

sudo docker run --name hostlab \
-it --rm \
-p ${VM_HOSTLAB_IP}:80:8080 \
-p 5858:5858 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v ${VM_HOSTLAB_FOLDER}:/home/node/app \
--link hostlab-mongo:mongo \
--link gitlab:gitlab.local \
-e MONGO_URL=mongodb://mongo/hostlab \
-e GITLAB_TOKEN=${GITLAB_TOKEN} \
-e GITLAB_URL=${GITLAB_URL} \
hostlab \
nodemon -L --inspect=0.0.0.0:5858
