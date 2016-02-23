#!/usr/bin/env node

var program      = require('commander');
var smtp_checker = require('./index.js');

program
  .version('0.1.0')
  .option('-f, --first_name [value]',       'first name')
  .option('-l, --last_name [value]',        'last name')
  .option('-d, --domain_name [value]',      'domain name')
  .option('-e, --possible_emails [value]',  'possible emails')
  .option('-c, --catch_all [value]',        'catch_all')
  .option('-s, --sender [value]',           'email address to use as sender in SMTP connections, defaults to `contact@pixelrecruiting.com` [*recommend to avoid spam]')
  .option('-F, --fqdn [value]',             'domain, used as part of the HELO, defaults to `mail.pixelrecruiting.com`')
  .option('-D, --dns [value]',              'ip address, or array of ip addresses (splitted by comma), used to set the servers of the dns check, defaults to 8.8.8.8 and 8.8.4.4')
  .option('-t, --timeout [value]',          'integer, socket timeout defaults to 0 which is no timeout', parseInt)
  .option('-p, --port [value]',             'integer, port to connect with defaults to 25', parseInt)
  .option('-v, --verbose [value]',          'verbose mode')
  .parse(process.argv);

var options = {
  firstName:      program.first_name,
  lastName:       program.last_name,
  domainName:     program.domain_name,
  catchAll:       (program.catch_all == undefined) ? true : (program.catch_all == 'true' || program.catch_all == true),
  possibleEmails: (program.possible_emails == undefined) ? [] : program.possible_emails.split(','),
  sender:         program.sender,
  fqdn:           program.fqdn,
  dns:            program.dns,
  timeout:        program.timeout,
  port:           program.port,
  verbose:        program.verbose
};

smtp_checker.find(options, function(error, info) {
  if (error) {
    console.error(error);
  }
  else {
    console.log(info);
  }
});