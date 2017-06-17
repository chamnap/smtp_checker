## SMTP Email Verification

This node module was inspired by [email-verify](https://github.com/bighappyworld/email-verify), but I **modified** and **added** some functionalities according to my needs. It was used in production for more than a year without any problems. Those changes are such as:

  1. Generate possible emails from first_name, last_name, and domain_name.

  2. Support catchAll.

  3. Support a list of emails to do verification.

  4. Support verbose mode.

### Warnings

You need to have a static IP which acts as like an SMTP server to do communication with other SMTP servers. It should have valid MX Records and PTR Records. Otherwise, your IP will be recorded as a spammer. Use [mxtoolbox.com](https://mxtoolbox.com) to monitor your IP.

### Usage

Run the following command to see available options:

    $ smtp_checker -h

Example:

    $ smtp_checker -e chamnapchhorn@gmail.com -v

```
220 mx.google.com ESMTP c24si3754682pfl.259 - gsmtp
EHLO mail.example.org

250-mx.google.com at your service, [203.223.47.204]
250-SIZE 157286400
250-8BITMIME
250-STARTTLS
250-ENHANCEDSTATUSCODES
250-PIPELINING
250-CHUNKING
250 SMTPUTF8
MAIL FROM:<name@example.org>

250 2.1.0 OK c24si3754682pfl.259 - gsmtp

RCPT TO:<serverisprobablycatchall@gmail.com>

550-5.1.1 The email account that you tried to reach does not exist. Please try
550-5.1.1 double-checking the recipient's email address for typos or
550-5.1.1 unnecessary spaces. Learn more at
550 5.1.1  https://support.google.com/mail/?p=NoSuchUser c24si3754682pfl.259 - gsmtp

RCPT TO:<chamnapchhorn@gmail.com>

250 2.1.5 OK c24si3754682pfl.259 - gsmtp
QUIT

221 2.0.0 closing connection c24si3754682pfl.259 - gsmtp

{
  found: true,
  emails: [ 'chamnapchhorn@gmail.com' ],
  response: '220 mx.google.com ESMTP i61si4119769plb.383 - gsmtpEHLO mail.example.org\r\n250-mx.google.com at your service, [203.223.47.204]\r\n250-SIZE 157286400\r\n250-8BITMIME\r\n250-STARTTLS\r\n250-ENHANCEDSTATUSCODES\r\n250-PIPELINING\r\n250-CHUNKING\r\n250 SMTPUTF8MAIL FROM:<name@example.org>\r\n250 2.1.0 OK i61si4119769plb.383 - gsmtp\r\nRCPT TO:<serverisprobablycatchall@gmail.com>\r\n550-5.1.1 The email account that you tried to reach does not exist. Please try\r\n550-5.1.1 double-checking the recipient\'s email address for typos or\r\n550-5.1.1 unnecessary spaces. Learn more at\r\n550 5.1.1  https://support.google.com/mail/?p=NoSuchUser i61si4119769plb.383 - gsmtp\r\nRCPT TO:<chamnapchhorn@gmail.com>\r\n250 2.1.5 OK i61si4119769plb.383 - gsmtpQUIT\r\n221 2.0.0 closing connection i61si4119769plb.383 - gsmtp',
  catchAll: false
}
```