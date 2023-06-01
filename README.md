# Lokalise TMS GitHub Action
Scienta's take on translation management, using [Lokalise](https://lokalise.com/)

## Workflow
This project contains a GitHub Action which can be used in various actions to create a Translation Management flow.

At Scienta, we use the following flow:
- On `PR create` a GitHub action checks if the PR (HEAD ref) contains new translations, compared to the TMS (Lokalise). The new translations are stored in a Github Actions Artifact and a comment is added to the PR.
- On `PR merge` the stored translations are added to the TMS and can be translated by translators.
- On `release` all keys are retrieved from the TMS and translation files are generated

## Usage
Checkout the various test-workflows in the `./test-workflows` directory. This Action can be used as a GitHub Action step. You have to specify the command you want to execute.

## Configuration
Create a valid [configuration.ts](src%2Flib%2Fconfiguration%2Fconfiguration.ts) to have this GitHub Action work properly.

## Testing
To run this action locally, please install [Act](https://github.com/nektos/act) to `./bin/act` (Default location of install script of Act).

- Populate the `.env` file based on the `.env.template`.
- Edit the `payload` json files if needed in `./test-workflows`
- Tinker around with the `./test-workflows/.translate-actionrc.yml` run command file.

Run:
```bash
npm run build && npm run command:extract-translations
npm run build && npm run command:add-snapshot
npm run build && npm run command:create-translation-files
```
