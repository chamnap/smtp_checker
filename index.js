module.exports.find_email = function (firstName, lastName, domain, options, mainCallback) {

  // Handling options
  if (!firstName || !lastName || !domain) {
    throw new Error("Missing parameters in find_email.process()");
  }
  else if (typeof mainCallback === 'undefined' && options) {
    mainCallback = options;
    options = {};
  }

  // Default Values
  if (options && !options.sender)   options.sender = 'name@example.org';
  if (options && !options.fqdn)     options.fqdn = 'mail.example.org';
  if (options && !options.timeout)  options.timeout = 0;
  if (options && !options.port)     options.port = 25;
  if (options && !options.verbose)  options.verbose = false;

  var async       = require('async');
  var responseLog = '';

  async.waterfall(
    [
      possibleEmails(firstName, lastName, domain),
      getSMTPAddress,
      verifyEmail
    ],
    function(error, success) {
      console.log('error', error);
      console.log(success);
    }
  );

  function logging(value) {
    responseLog += value.toString();

    if(!options.verbose) return;
    console.log(value.toString().trim());
  }

  function possibleEmails(firstName, lastName, domain) {
    return function(callback) {
      var fs     = require('fs');
      var format = require('string-template');

      fs.readFile('./patterns.txt', function (error, data) {
        if (error) { return callback(error); }

        var content = data.toString().split('\n');
        var binding = {
          firstInitial: firstName[0],
          lastInitial:  lastName[0],
          firstName:    firstName,
          lastName:     lastName,
          domain:       domain
        };

        var results = [];
        content.forEach(function(pattern) {
          var result = format(pattern, binding);
          if (results.indexOf(result) == -1) {
            results.push(result);
          }
        });

        callback(null, results);
      });
    };
  }

  // Get the lowest priority MX Records to find the SMTP server
  function getSMTPAddress(possibleEmails, callback) {
    var dns = require('dns');

    if(options.dns) {
      try {
        if(Array.isArray(options.dns)) {
          dns.setServers(options.dns);
        } else {
          dns.setServers([options.dns]);
        }
      }
      catch(e) {
        throw new Error("[find_email.js]: Invalid DNS Options");
      }
    }

    dns.resolveMx(domain, function(error, addresses) {
      if (error || (typeof addresses === 'undefined')) {
        return callback(error);
      } else if (addresses && addresses.length <= 0) {
        return callback('No MX Records for this domain' + domain);
      }
      else {
        var index    = 0;
        var priority = 10000;

        for (var i = 0; i < addresses.length; i++) {
          if (addresses[i].priority < priority) {
            priority = addresses[i].priority;
            index = i;
          }
        }
        callback(null, possibleEmails, addresses[index].exchange);
      }
    });
  }

  function verifyEmail(possibleEmails, smtp_address, callback) {
    var net         = require('net');
    var format      = require('string-template');

    var socket      = net.createConnection(options.port, smtp_address);
    var response    = '';

    var completed   = false;
    var ended       = false;
    var stage       = 0;

    var foundEmails = [];
    var index       = 0;

    var command     = '';
    var commands    = [
      'EHLO {0}\r\n',
      'MAIL FROM:<{0}>\r\n',
      'RCPT TO:<{0}>\r\n',
      'QUIT\r\n'
    ]

    socket.on('data', function(data) {
      response    += data.toString();
      completed    = response.slice(-1) === '\n';

      logging(response.trim());

      if (completed) {
        switch(stage) {
          case 0: // EHLO
            if (response.indexOf('220') > -1 && !ended) {
              command = format(commands[stage], options.fqdn);
              socket.write(command, function() {
                stage       += 1;
                response     = '';
                logging(command);
              });
            } else {
              socket.end();
            }
            break;
          case 1: // MAIL FROM
            if (response.indexOf('250') > -1 && !ended) {
              command = format(commands[stage], options.sender);
              socket.write(command, function() {
                stage       += 1;
                response     = '';
                logging(command);
              });
            } else {
              socket.end();
            }
            break;
          case 2: // RCPT TO
            if (response.indexOf('250') > -1 && !ended) {
              command = format(commands[stage], possibleEmails[index]);
              socket.write(command, function() {
                stage       += 1;
                response     = '';
                logging(command);
              });
            } else {
              socket.end();
            }
            break;
          case 3: // RCPT Result
            if (response.indexOf('250') > -1) { // Verified
              foundEmails.push(possibleEmails[index]);
            }

            // Verify another
            response = '';
            index += 1;
            if (index < possibleEmails.length) {
              command = format(commands[2], possibleEmails[index]);
              socket.write(command, function() {
                response     = '';
                logging(command);
              });
            } else if(!ended) {
              command = commands[commands.length-1]; // QUIT
              stage = 4;
              socket.write(command);
              logging(command);
            }
            break;
          case 4: // QUIT
            socket.end();
        }
      }
    }).on('connect', function(data) {

    }).on('error', function(error) {
      ended = true;
      return callback(error, { success: false, emails: foundEmails, log: responseLog });
    }).on('end', function() {
      ended = true;
      return callback(null, { success: (foundEmails.length > 0) ? true : false, emails: foundEmails, log: responseLog });
    });
  }
}