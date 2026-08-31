# HP21 — Retro RPN Calculator

A client-only, no-backend RPN (Reverse Polish Notation) calculator web app styled after the
Hewlett-Packard HP-21 (1970s). Built as plain modular TypeScript/HTML/CSS — no framework, no
bundler — designed to be deployed as static files to an Azure Storage `$web` static website.

This document explains the day-to-day **development cycle**: how to build the TypeScript,
launch a local dev server, and view the app in your browser — and how each step maps back to
the settings in [`package.json`](./package.json).

## Quick start

Once you've run `npm install` once (see [Prerequisites](#prerequisites)), the fastest way to
build, launch the dev server, and get the URL to open is a single command.

### VS Code (recommended)

1. Open the **HP21** folder in VS Code (**File > Open Folder...** and select `C:\Users\<you>\source\repos\HP21`).
2. Open a terminal (<kbd>Ctrl</kbd>+<kbd>`</kbd>) — it will start in the project root.
3. Run:

   ```powershell
   ./dev.ps1
   ```

4. Copy the URL it prints (`http://127.0.0.1:5500/index.html`) into your browser.

**VS Code tasks:** You can also use built-in VS Code tasks:

- Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> to run the **build** task (`npm run build`).
- Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> and search **"Run Task"** to run **serve** or **build and serve**.

### Visual Studio (legacy)

1. Open the **HP21** folder/solution if it isn't already open
   (**File > Open > Folder...** and select `C:\Users\<you>\source\repos\HP21`).
2. Open the **Developer PowerShell** terminal — this is a PowerShell prompt pre-configured with
   the right environment variables and already positioned in your project folder. You can get to
   it two ways:
   - **View menu:** `View` > `Terminal` (or press <kbd>Ctrl</kbd>+<kbd>`</kbd>). This opens the
     integrated terminal panel at the bottom of the Visual Studio window, defaulting to
     **Developer PowerShell**.
   - **Tools menu:** `Tools` > `Command Line` > `Developer PowerShell`.
3. Confirm the prompt's working directory is the `HP21` project folder (the one containing
   `package.json` and `dev.ps1`). If it isn't, `cd` into it, e.g.:

   ```powershell
   cd C:\Users\johng\source\repos\HP21
   ```

4. Run:

   ```powershell
   ./dev.ps1
   ```

5. Copy the URL it prints (`http://127.0.0.1:5500/index.html`) into your browser.

> **Prefer just pressing F5?** This project is an `.esproj` (Visual Studio's JavaScript/TypeScript
> project type), so you can also press <kbd>F5</kbd> (or the Debug ▶ button) in Visual Studio.
> That builds the app (`npm run build`), starts the dev server (`npm run serve`) via the `start`
> script, and launches your default debugger-attached browser at
> `http://127.0.0.1:5500/index.html` automatically — see
> [F5 debugging](#f5-debugging-in-visual-studio) below.

## Prerequisites

- [Node.js](https://nodejs.org/) (includes `npm`) installed and available on your `PATH`.
- Dependencies installed once per clone:

  ```powershell
  npm install
  ```

  This reads `package.json` and installs everything listed under `devDependencies`
  (`typescript`, `http-server`, `eslint`) into `node_modules/`. You only need to re-run this
  when `package.json`'s dependencies change.

## The dev cycle, step by step

### 1. Build the TypeScript

```powershell
npm run build
```

This runs the `build` script defined in `package.json`:

```json
"scripts": {
  "build": "tsc --build"
}
```

`tsc --build` compiles every `.ts` file under `src/` into a matching `.js` file under `dist/`
(e.g. `src/engine/calculator.ts` → `dist/engine/calculator.js`). The compiler's behavior is
controlled by [`tsconfig.json`](./tsconfig.json) — most importantly:

- `"rootDir": "./src"` and `"outDir": "./dist"` — tells `tsc` where source lives and where
  compiled output goes.
- `"module": "nodenext"` combined with `"type": "module"` in `package.json` — this is why every
  relative import in the `.ts` source files is written with an explicit `.js` extension
  (e.g. `import { Stack } from "./stack.js";"`), even though the source file is `stack.ts`. This
  looks unusual but is required so the _compiled_ `.js` files import each other correctly as
  native browser ES modules, with no bundler involved.

You need to re-run `npm run build` **every time you change a `.ts` file** — the browser only ever
loads the compiled `.js` files in `dist/`, never the `.ts` sources directly.

If you want a clean rebuild (e.g. after deleting/renaming source files), use:

```powershell
npm run clean   # tsc --build --clean, then deletes dist/ entirely
npm run build
```

> **Why delete `dist/` instead of just clearing the build cache?** `tsc --build --clean` removes
> the incremental build cache (`tsconfig.tsbuildinfo`) and outputs it still knows about, but it
> does **not** reliably delete `.js` files left behind after you rename or delete a `.ts` source
> file — those orphaned files stay in `dist/` and can get served/loaded as dead code. Day-to-day
> incremental `npm run build` is left alone (fast, safe for normal edits); `npm run clean` gives
> you a guaranteed-fresh `dist/` when you need one, and
> [`deploy/deploy-to-storage.ps1`](./deploy/deploy-to-storage.ps1) always runs a full clean before
> building so stale files never get published to Azure Storage.

#### Linting

```powershell
npm run lint
```

This runs `eslint .` using [`eslint.config.js`](./eslint.config.js). Note: this currently only
lints plain `.js` files (e.g. this config file itself) — `typescript-eslint`, the plugin that
would let ESLint understand `.ts` syntax, requires `typescript <6.1`, but this project
intentionally tracks the latest `typescript` (7.x). Type errors in `.ts` files are still fully
caught by `npm run build` (`tsc`); ESLint will pick up `.ts` linting once `typescript-eslint`
adds TypeScript 7 support.

### 2. Launch the local dev server

```powershell
npm run serve
```

This runs the `serve` script defined in `package.json`:

```json
"scripts": {
  "serve": "http-server -p 5500 -c-1"
}
```

- `http-server` is a zero-config static file server (installed as a `devDependency`) that serves
  the current folder (the `HP21` project root — where `index.html` lives) over plain HTTP.
- `-p 5500` — serves on port `5500`.
- `-c-1` — disables HTTP caching, so the browser always fetches the freshest files instead of
  reusing old cached copies while you're actively developing.

**Why you can't just double-click `index.html`:** the app uses native ES modules
(`<script type="module" src="dist/ui/app.js">`), and browsers block ES module imports from
loading over the `file://` protocol for security reasons. The keypad/display simply won't render
if you open the file directly — you must serve it over `http://`.

Leave this command running in its own terminal — it will keep serving requests until you press
`Ctrl+C` to stop it.

### 3. Open the app in your browser

Once `npm run serve` is running, open:

```
http://127.0.0.1:5500/index.html
```

(`http://localhost:5500/index.html` works identically.) The port `5500` here must match the
`-p 5500` argument in the `serve` script above — if you ever change that port in `package.json`,
update the URL you browse to as well.

### Putting it together

A typical edit/test loop looks like this:

1. Edit a file under `src/engine/` or `src/ui/` (or a `.css`/`index.html` file — those don't need
   building, just a browser refresh).
2. Run `npm run build` to recompile any changed `.ts` files into `dist/`.
3. Make sure `npm run serve` is still running (start it if it isn't — see Step 2 above).
4. Refresh `http://127.0.0.1:5500/index.html` in your browser.

#### One-command shortcut: `dev.ps1`

Steps 2–3 (and the URL from step 4) are automated by [`dev.ps1`](./dev.ps1):

```powershell
./dev.ps1
```

This script:

1. Runs `npm run build`.
2. Checks whether something is already listening on port `5500`. If not, it starts
   `npm run serve` in the background (minimized window) and waits for it to come up.
3. Prints the URL (`http://127.0.0.1:5500/index.html`) to the console so you can copy it into
   your browser.

It's safe to run repeatedly — if the dev server is already running, it just rebuilds and prints
the URL again instead of starting a second server. If you changed the port in the `serve` script
in `package.json`, pass the matching port: `./dev.ps1 -Port 5500`.

> **Tip:** Because browsers cache JavaScript modules aggressively, if your changes don't seem to
> appear after a normal refresh, do a hard refresh (`Ctrl+Shift+R` / `Ctrl+F5`), or open DevTools
> and enable "Disable cache" while the DevTools panel is open.

### F5 debugging in Visual Studio

[`HP21.esproj`](./HP21.esproj) uses Visual Studio's JavaScript/TypeScript project SDK, which
supports launching and debugging npm-based web apps directly with <kbd>F5</kbd> — no need to
manually run `dev.ps1` or `npm run serve` first. This is wired up by two things:

- `package.json`'s **`start`** script — `"start": "npm run build && npm run serve"` — is the
  command Visual Studio's JS/TS tooling runs by convention when you press F5.
- [`Properties/launchSettings.json`](./Properties/launchSettings.json) — tells Visual Studio
  which browser URL to open and attach the debugger to
  (`http://127.0.0.1:5500/index.html`), matching the port in the `serve` script.

To use it: open `HP21.slnx` in Visual Studio and press <kbd>F5</kbd> (or click the green
**Debug ▶** button). Visual Studio will build the TypeScript, start `http-server`, and open your
default debugger-attached browser at the app's URL. Set breakpoints directly in the `.ts` source
files under `src/` — because `tsconfig.json` has `"sourceMap": true`, the browser's debugger
(and Visual Studio's) can map running `dist/**/*.js` code back to the original `.ts` lines.

If you change the port in the `serve` script in `package.json`, update `launchUrl` in
`launchSettings.json` to match.

## Project layout quick reference

| Path                             | What it is                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/engine/`                    | Framework-free, DOM-free calculator logic (stack, operations, formatting, settings).                   |
| `src/ui/`                        | Browser/DOM code — keypad rendering, display rendering, keyboard input, app bootstrap.                 |
| `dist/`                          | Compiled JavaScript output (generated by `npm run build` — do not hand-edit).                          |
| `css/`                           | Hand-authored stylesheets (not compiled — edited directly, just refresh the browser).                  |
| `index.html`                     | Static page shell; loads `dist/ui/app.js` as the single ES module entry point.                         |
| `assets/fonts/`                  | Bundled segment-style display font (DSEG7).                                                            |
| `deploy/deploy-to-storage.ps1`   | Builds the project and uploads `dist/`, `css/`, and `index.html` to an Azure Storage `$web` container. |
| `dev.ps1`                        | One-command local dev helper: builds, starts the dev server if needed, and prints the browser URL.     |
| `Properties/launchSettings.json` | Tells Visual Studio's F5 debugger which URL/browser to launch against the dev server.                  |

#### Code formatting

```powershell
npm run format
```

This runs `prettier --write .` to automatically format all TypeScript, JSON, and CSS files according to the project's style guide (defined in [`.prettierrc`](./.prettierrc)). VS Code can be configured to auto-format on save:

1. Install the **Prettier** VS Code extension (`esbenp.prettier-vscode`).
2. Create a `.vscode/settings.json` file (or open the existing one) with:

   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   }
   ```

Now whenever you save a file, it will be automatically formatted to match the project's conventions.

## Deploying

HP21 is designed to be deployed as a static website to Azure Storage's `$web` container. The
build output (`dist/`, `css/`, `index.html`) contains all you need — no server-side code or
database — and can be served directly from blob storage.

### Prerequisites for deployment

- **Azure CLI** (`az`) installed and available on your `PATH`.
- An Azure Storage account with **static website hosting enabled**. See [Configure an Azure Storage account for static website hosting](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to-enable) for setup instructions.
- Authentication via `az login` — you must be logged in with credentials that have permission to upload blobs to the storage account.
- Storage account name and resource group name (see `.env.example` for required parameters).

### Deployment script

Use [`deploy/deploy-to-storage.ps1`](./deploy/deploy-to-storage.ps1) to build and deploy:

```powershell
./deploy/deploy-to-storage.ps1 -StorageAccountName mystorageacct -ResourceGroupName my-rg
```

The script:

1. Runs `npm run clean` and `npm run build` to ensure a fresh build with no orphaned files.
2. Uploads `dist/`, `css/`, and `index.html` to the `$web` container.
3. Reports the static website URL (typically `https://<storageaccount>.z5.web.core.windows.net/`).

### Step-by-step deployment

1. **Log in to Azure** (if not already logged in):

   ```powershell
   az login
   ```

2. **Verify your storage account has static website hosting enabled:**

   ```powershell
   az storage account show --name <storageaccount> --resource-group <resourcegroup> --query staticWebsite
   ```

   If the result shows `null`, enable it:

   ```powershell
   az storage blob service-properties update --account-name <storageaccount> --static-website --index-document index.html
   ```

3. **Build and deploy:**

   ```powershell
   ./deploy/deploy-to-storage.ps1 -StorageAccountName <storageaccount> -ResourceGroupName <resourcegroup>
   ```

   The script will output the public URL where the app is now live.

4. **Test the deployment:**

   Open the URL printed by the script (e.g., `https://mystorageacct.z5.web.core.windows.net/index.html`) in your browser.

### Troubleshooting deployment

- **"The account does not have sufficient permissions"** — ensure you're logged in with `az login` and have the `Storage Blob Data Contributor` role on the storage account.
- **"Static website is not enabled"** — run the `az storage blob service-properties update` command above to enable it.
- **Changes don't appear after deployment** — ensure `npm run clean` has cleared `dist/`; old cached files in blob storage may be stale. Try a hard browser refresh (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>).

### Custom domain and HTTPS

Once deployed, you can configure a custom domain and enable HTTPS via Azure's CDN service. See [Host a static website in Azure Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website) for instructions.
