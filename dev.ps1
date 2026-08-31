#Requires -Version 7.0
<#
.SYNOPSIS
	Runs the HP21 dev cycle: build the TypeScript, ensure the local dev server is running,
	and print the URL to open in your browser.

.DESCRIPTION
	1. Runs `npm run build` (tsc --build) to compile src/ -> dist/.
	2. Checks whether the dev server (npm run serve / http-server) is already listening on
	   the configured port; if not, starts it in the background.
	3. Prints the URL to copy into your browser's address bar.

.PARAMETER Port
	Port the dev server listens on. Must match the "-p" value in package.json's "serve"
	script (default 5500).

.EXAMPLE
	./dev.ps1
#>
param(
	[int]$Port = 5500
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $scriptDir
try {
	Write-Host "Building TypeScript (npm run build)..." -ForegroundColor Cyan
	npm run build
	if ($LASTEXITCODE -ne 0) {
		throw "npm run build failed with exit code $LASTEXITCODE"
	}

	$portInUse = $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)

	if ($portInUse) {
		Write-Host "Dev server already running on port $Port." -ForegroundColor Yellow
	}
	else {
		Write-Host "Starting dev server (npm run serve) on port $Port..." -ForegroundColor Cyan
		$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue)
		if (-not $npmCmd) { $npmCmd = (Get-Command npm -ErrorAction Stop) }
		Start-Process -FilePath $npmCmd.Source -ArgumentList "run", "serve" -WorkingDirectory $scriptDir -WindowStyle Minimized

		Write-Host "Waiting for dev server to come up..." -ForegroundColor Cyan
		$maxAttempts = 40
		$attempt = 0
		while (-not $portInUse -and $attempt -lt $maxAttempts) {
			Start-Sleep -Milliseconds 250
			$portInUse = $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
			$attempt++
		}

		if (-not $portInUse) {
			throw "Dev server did not start listening on port $Port after waiting."
		}
	}

	$url = "http://127.0.0.1:$Port/index.html"
	Write-Host ""
	Write-Host "Open this URL in your browser:" -ForegroundColor Green
	Write-Host "  $url" -ForegroundColor White
}
finally {
	Pop-Location
}
