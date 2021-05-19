# cypress-sendgrid-visual-testing-example
> Visual testing for HTML emails sent via SendGrid design templates

## Prerequisites

SendGrid account with API key and a verified email sender, see [this doc](https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/)

## Install

```shell
$ npm install
```

## Run

Start the server locally with injected `SENDGRID_API_KEY` and `SENDGRID_FROM` environment variables.

```
SENDGRID_API_KEY=... SENDGRID_FROM=... npm start
```

**Tip:** use [as-a](https://github.com/bahmutov/as-a) utility

```shell
$ as-a cypress-sendgrid-visual-testing-example npm start
```
