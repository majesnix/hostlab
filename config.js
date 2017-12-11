const config = {
  //Can be ldaps (636)
  'url': 'ldap://s1.classennetwork.com:389',

  //CN => Administrator USER, OU => Organization Unit, DC => Domain controller
  'bindDn': 'cn=Administrator,ou=Administratoren,dc=classennetwork,dc=com',

  //PASSWORD
  'bindCredentials': 'nAja6UpyBuster2007',

  //In which Organization Unit shall we search?
  'searchBase': 'dc=classennetwork,dc=com',

  //Search based on this input
  'searchFilter': '(userPrincipalName={{username}})',

  // URL for postgres login (for sequelize)
  'dbURL' : 'postgres://webentwicklung:webentwicklung@localhost:5432/webentwicklung',

  // Quotas (NOT IMPLEMENTED)
  'dbQuota': 5,
  'appQuota': 5,

  // Gitlab Credentials
  'gitlabURL': 'https://git.majesnix.org',
  'gitlabToken': 'uXtWtt5Tce2nwE2pAGQu',
  'gitlabAdmin': 'majesnix',
};

module.exports = config;