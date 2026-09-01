#Requires -Version 7.0
<#
.SYNOPSIS
	Builds the HP21 TypeScript app and uploads the static site content to an Azure Storage
	static website $web container.

.DESCRIPTION
	Assumes the user has already authenticated via 'az login'. Validates that the storage
	account has static website hosting enabled, runs a full clean build (`npm run clean`
	then `npm run build`) so no stale/orphaned files from renamed or deleted source files
	are published, removes TypeScript source maps to reduce storage costs, then uses
	`az storage blob upload-batch` to sync dist/, index.html, and css/ to $web.
	
	On successful completion, displays the public URL of the deployed static website.

.PARAMETER StorageAccountName
	Name of the Azure Storage account with static website hosting enabled.

.PARAMETER ResourceGroupName
	Resource group containing the storage account.

.EXAMPLE
	./deploy/deploy-to-storage.ps1 -StorageAccountName mystorageacct -ResourceGroupName my-rg
#>
param(
    [string]$StorageAccountName = "coldstorageaccount",
    [string]$ResourceGroupName = "jgh-canada-central-resource-group"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Resolve-Path (Join-Path $scriptDir "..")

# Helper function: Validate that static website hosting is enabled
function Test-StaticWebsiteEnabled {
	param([string]$StorageAccountName, [string]$AccountKey)
	
	Write-Host "Validating static website hosting is enabled..." -ForegroundColor Cyan
	
	# Use the account key explicitly; AAD login often lacks the data-plane RBAC role this read requires
	$siteProps = az storage blob service-properties show `
		--account-name $StorageAccountName `
		--account-key $AccountKey `
		--query "staticWebsite" | ConvertFrom-Json
	
	if ($LASTEXITCODE -ne 0) {
		throw "Failed to read static website properties for storage account '$StorageAccountName' (exit code $LASTEXITCODE)."
	}
	
	if (-not $siteProps -or -not $siteProps.enabled) {
		throw @"
Static website hosting is not enabled on storage account '$StorageAccountName'.

To enable it, run:
  az storage blob service-properties update `
    --account-name $StorageAccountName `
    --static-website `
    --index-document index.html

Then re-run this deployment script.
"@
	}
	
	Write-Host "✓ Static website hosting is enabled" -ForegroundColor Green
}

# Helper function: Remove TypeScript source map files to reduce storage costs
function Remove-SourceMaps {
	param([string]$DistPath)
	
	Write-Host "Cleaning up TypeScript source maps..." -ForegroundColor Cyan
	
	$mapFiles = @(Get-ChildItem -Path $DistPath -Recurse -Filter "*.map" -ErrorAction SilentlyContinue)
	
	if ($mapFiles.Count -gt 0) {
		foreach ($file in $mapFiles) {
			Remove-Item -Path $file.FullName -Force
			Write-Host "  Removed: $($file.FullName -replace [regex]::Escape($DistPath), 'dist')" -ForegroundColor Gray
		}
		Write-Host "✓ Removed $($mapFiles.Count) source map file(s)" -ForegroundColor Green
	}
	else {
		Write-Host "✓ No source maps found" -ForegroundColor Green
	}
}

# Helper function: Construct the public URL for the deployed static website
function Get-StorageWebsiteUrl {
	param([string]$StorageAccountName)
	
	return "https://${StorageAccountName}.blob.core.windows.net/`$web/HP21/index.html"
}

Write-Host "Resolving storage account key..." -ForegroundColor Cyan
$accountKey = az storage account keys list `
	--account-name $StorageAccountName `
	--resource-group $ResourceGroupName `
	--query "[0].value" -o tsv

if (-not $accountKey) {
	throw "Failed to resolve an account key for storage account '$StorageAccountName'."
}

Write-Host "Validating storage account configuration..." -ForegroundColor Cyan
Test-StaticWebsiteEnabled -StorageAccountName $StorageAccountName -AccountKey $accountKey

Write-Host ""

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

Remove-SourceMaps -DistPath (Join-Path $projectDir "dist")
Write-Host ""

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
	
	if ($LASTEXITCODE -ne 0) {
		throw "Failed to upload '$SourcePath' to `$web/$Destination (exit code $LASTEXITCODE)"
	}
}

Publish-Folder -SourcePath (Join-Path $projectDir "dist") -Destination "HP21/dist"
Publish-Folder -SourcePath (Join-Path $projectDir "css") -Destination "HP21/css"

Write-Host "Uploading index.html -> `$web/HP21/index.html" -ForegroundColor Cyan
az storage blob upload `
	--account-name $StorageAccountName `
	--account-key $accountKey `
	--container-name '$web' `
	--file (Join-Path $projectDir "index.html") `
	--name "HP21/index.html" `
	--overwrite

if ($LASTEXITCODE -ne 0) {
	throw "Failed to upload index.html to `$web/HP21/index.html (exit code $LASTEXITCODE)"
}

Write-Host ""
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host ""
Write-Host "The HP21 calculator is now live at:" -ForegroundColor Green
$websiteUrl = Get-StorageWebsiteUrl -StorageAccountName $StorageAccountName
Write-Host "  $websiteUrl" -ForegroundColor White
Write-Host ""
Write-Host "Note: It may take a few minutes for the site to be fully available." -ForegroundColor Yellow
