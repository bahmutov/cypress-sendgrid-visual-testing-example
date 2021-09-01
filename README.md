# cypress-sendgrid-visual-testing-example ![cypress version](https://img.shields.io/badge/cypress-8.3.1-brightgreen)
> Visual testing for HTML emails sent via SendGrid dynamic transactional templates

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

When running the tests locally if we want to send visual results to Percy we need the `PERCY_TOKEN` environment variable.

```shell
# without visual tests
$ npx cypress open
# with visual tests
$ PERCY_TOKEN=... npx percy exec -- npx cypress open
$ as-a cypress-sendgrid-visual-testing-example-percy npx percy exec -- npx cypress open
```
