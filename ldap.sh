#!/bin/bash
#
# run ldap in docker

docker run \
--detach \
--restart always \
--name hostlab-ldap \
--publish 127.0.0.12:389:389 \
--env LDAP_DOMAIN="hostlab.local" \
--env LDAP_ADMIN_PASSWORD="12345" \
--volume /srv/openldap/data:/var/lib/ldap \
--volume /srv/openldap/config:/etc/ldap/slapd.d \
--volume ldapseed.ldif:/container/service/slapd/assets/config/bootstrap/ldif/custom/testuser.ldif:ro \
osixia/openldap:1.1.10 \
--copy-service
