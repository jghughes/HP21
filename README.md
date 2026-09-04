# HP21

HP21 is an HP-21-inspired Reverse Polish Notation (RPN) calculator web app, built with TypeScript, HTML, and CSS.

## Install

Requires [Node.js](https://nodejs.org/) (which includes `npm`). To deploy, also install the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) and sign in with `az login`.

Install the project dependencies once after cloning:

```powershell
npm install
```

## Develop

Open the repository in VS Code and press <kbd>F5</kbd>. Select the Edge or Chrome launch configuration when prompted.

VS Code builds the app, starts the local server, and opens the calculator at `http://127.0.0.1:5500/index.html`.

## Housekeeping

Format the project with Prettier:

```powershell
npm run format
```

Check formatting, types, and the production build without modifying files:

```powershell
npm run check
```

## Deploy

From a terminal opened at the repository root, run:

```powershell
./deploy/publish.ps1
```

The script performs a clean build and publishes the static site to the configured Azure Storage account.

## Project Structure

| Path      | Purpose                                       |
| --------- | --------------------------------------------- |
| `src/`    | Calculator engine and browser UI source code. |
| `css/`    | Application stylesheets.                      |
| `assets/` | Bundled static assets, including fonts.       |
| `deploy/` | Azure deployment script.                      |
