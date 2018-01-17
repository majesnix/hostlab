gitlab_rails['ldap_enabled'] = true
gitlab_rails['ldap_servers'] = YAML.load <<-EOS # remember to close this block with 'EOS' below
main: # 'main' is the GitLab 'provider ID' of this LDAP server

  label: 'HSRW'
  host: 'ldap'
  port: 389 # usually 636 for SSL
  uid: 'mail'
  bind_dn: 'cn=admin,dc=hostlab,dc=local'
  password: '12345'
  encryption: 'plain'
  timeout: 10
  active_directory: false
  allow_username_or_email_login: false
  block_auto_created_users: false
  base: 'dc=hostlab,dc=local'
  user_filter: ''

  # LDAP attributes that GitLab will use to create an account for the LDAP user.
  # The specified attribute can either be the attribute name as a string (e.g. 'mail'),
  # or an array of attribute names to try in order (e.g. ['mail', 'email']).
  # Note that the user's LDAP login will always be the attribute specified as `uid` above.
  attributes:
    # The username will be used in paths for the user's own projects
    # (like `gitlab.example.com/username/project`) and when mentioning
    # them in issues, merge request and comments (like `@username`).
    # If the attribute specified for `username` contains an email address,
    # the GitLab username will be the part of the email address before the '@'.
    username: ['mail', 'email']
    email:    ['mail', 'email']
    name:       'cn'
    first_name: 'cn'
    last_name:  'sn'

EOS
