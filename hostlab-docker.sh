#!/usr/bin/env bash
#
# HostLab in Docker
export VM_HOSTLAB_IP=192.168.56.101
export VM_HOSTLAB_FOLDER=/media/sf_gits/hostlab
export GITLAB_URL=git.majesnix.org
export GITLAB_TOKEN=
#export LDAP_URL=ldap://s1.classennetwork.com:389
#export BINDDN='cn=Administrator,ou=Administratoren,dc=classennetwork,dc=com'
#export BINDCREDENTIALS=
#export SEARCHBASE='dc=classennetwork,dc=com'
#export SEARCHFILTER='(userPrincipalName={{username}})'
#-e LDAP_URL=${LDAP_URL} \
#-e BINDDN=${BINDDN} \
#-e BINDCREDENTIALS=${BINDCREDENTIALS} \
#-e SEARCHBASE=${SEARCHBASE} \
#-e SEARCHFILTER=${SEARCHFILTER} \


docker run --name hostlab \
-it --rm \
-p ${VM_HOSTLAB_IP}:80:8080 \
-p 5858:5858 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v ${VM_HOSTLAB_FOLDER}:/home/node/app \
--link hostlab-mongo:mongo \
-e MONGO_URL=mongodb://mongo/hostlab \
-e GITLAB_TOKEN=${GITLAB_TOKEN} \
-e GITLAB_URL=${GITLAB_URL} \
hostlab \
nodemon -L --inspect=0.0.0.0:5858
