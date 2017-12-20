#!/bin/bash
#
# reset ldap

export LDAP_IP='192.168.56.101'
export LDAPSEED_FILE=/media/sf_gits/hostlab/ldapseed.ldif

docker stop hostlab-ldap
docker rm hostlab-ldap

sudo rm -R /srv/openldap/config/*
sudo rm -R /srv/openldap/data/*

docker run --name hostlab-ldap \
-d \
-e LDAP_DOMAIN=hostlab.local \
-e LDAP_ADMIN_PASSWORD=12345 \
-v /srv/openldap/data:/var/lib/ldap \
-v /srv/openldap/config:/etc/ldap/slapd.d \
-p ${VM_HOSTLAB_IP}:389:389 \
-v ${LDAPSEED_FILE}:/container/service/slapd/assets/config/bootstrap/ldif/custom/users.ldif:ro \
osixia/openldap:1.1.11 \
--copy-service
