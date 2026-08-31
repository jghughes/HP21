#Requires -Version 7.0
<#
.SYNOPSIS
	Builds the HP21 TypeScript app and uploads the static site content to an Azure Storage
	static website $web container.

.DESCRIPTION
	Assumes the user has already authenticated via 'az login'. Runs a full clean build
	(`npm run clean` then `npm run build`) so no stale/orphaned files from renamed or
	deleted source files are published, then uses `az storage blob upload-batch` to
	sync dist/, index.html, and css/ to $web.

.PARAMETER StorageAccountName
	Name of the Azure Storage account with static website hosting enabled.

.PARAMETER ResourceGroupName
	Resource group containing the storage account.

.EXAMPLE
	./deploy/deploy-to-storage.ps1 -StorageAccountName mystorageacct -ResourceGroupName my-rg
#>
param(
	[Parameter(Mandatory = $true)]
	[string]$StorageAccountName,

	[Parameter(Mandatory = $true)]
	[string]$ResourceGroupName
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Resolve-Path (Join-Path $scriptDir "..")

Write-Host "Cleaning previous build output..." -ForegroundColor Cyan
Push-Location $projectDir
try {
	npm run clean
	if ($LASTEXITCODE -ne 0) {
		throw "npm run clean failed with exit code $LASTEXITCODE"
	}
}
finally {
	Pop-Location
}

Write-Host "Building TypeScript project..." -ForegroundColor Cyan
Push-Location $projectDir
try {
	npm run build
	if ($LASTEXITCODE -ne 0) {
		throw "npm run build failed with exit code $LASTEXITCODE"
	}
}
finally {
	Pop-Location
}

Write-Host "Resolving storage account key..." -ForegroundColor Cyan
$accountKey = az storage account keys list `
	--account-name $StorageAccountName `
	--resource-group $ResourceGroupName `
	--query "[0].value" -o tsv

if (-not $accountKey) {
	throw "Failed to resolve an account key for storage account '$StorageAccountName'."
}

function Publish-Folder {
	param(
		[string]$SourcePath,
		[string]$Destination
	)

	if (-not (Test-Path $SourcePath)) {
		Write-Warning "Skipping upload, path not found: $SourcePath"
		return
	}

	Write-Host "Uploading '$SourcePath' -> `$web/$Destination" -ForegroundColor Cyan
	az storage blob upload-batch `
		--account-name $StorageAccountName `
		--account-key $accountKey `
		--destination '$web' `
		--destination-path $Destination `
		--source $SourcePath `
		--overwrite
}

Publish-Folder -SourcePath (Join-Path $projectDir "dist") -Destination "dist"
Publish-Folder -SourcePath (Join-Path $projectDir "css") -Destination "css"

Write-Host "Uploading index.html -> `$web/index.html" -ForegroundColor Cyan
az storage blob upload `
	--account-name $StorageAccountName `
	--account-key $accountKey `
	--container-name '$web' `
	--file (Join-Path $projectDir "index.html") `
	--name "index.html" `
	--overwrite

Write-Host "Deployment complete." -ForegroundColor Green
