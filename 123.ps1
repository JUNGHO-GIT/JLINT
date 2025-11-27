param(
    [string]$OriginRepo = "JUNGHO-GIT/JLINT",
    [string]$PrivateRepo = "JUNGHO-GIT/JLINT_PRIVATE",
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "ERROR: GITHUB_TOKEN not found." -ForegroundColor Red
    exit 1
}

function Set-DefaultBranch {
    param(
        [string]$Repo,
        [string]$Branch
    )

    $url = "https://api.github.com/repos/$Repo"
    $body = @{ default_branch = $Branch } | ConvertTo-Json
    $headers = @{
        Authorization = "token $Token"
        Accept        = "application/vnd.github+json"
    }

    Write-Host ">>> Setting default branch of $Repo → $Branch"
    Invoke-RestMethod -Uri $url -Method PATCH -Headers $headers -Body $body
}

Write-Host ">>> Step 0. remove 'origin' remote if exists"

git remote get-url origin *> $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> Removing remote 'origin'"
    git remote remove origin
}

Write-Host ">>> Step 1. ensure remotes exist and set url"

$publicUrl = "https://github.com/$OriginRepo.git"
$privateUrl = "https://github.com/$PrivateRepo.git"

git remote get-url public *> $null 2>&1
if ($LASTEXITCODE -eq 0) {
    git remote set-url public $publicUrl
}
else {
    git remote add public $publicUrl
}

git remote get-url private *> $null 2>&1
if ($LASTEXITCODE -eq 0) {
    git remote set-url private $privateUrl
}
else {
    git remote add private $privateUrl
}

Write-Host ">>> Step 2. push HEAD to target branches (public/public/main, private/private/main)"

git push public HEAD:"public/main"
git push private HEAD:"private/main"

Write-Host ">>> Step 3. set default branches via GitHub API (public/main, private/main)"

Set-DefaultBranch -Repo $OriginRepo -Branch "public/main"
Set-DefaultBranch -Repo $PrivateRepo -Branch "private/main"

Write-Host ">>> Step 4. delete all remote branches except public/main on 'public'"

$publicRefs = git ls-remote --heads public
$publicRefs -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) {
        return
    }

    $parts = $line -split "\s+"
    if ($parts.Length -lt 2) {
        return
    }

    $ref = $parts[1]
    $name = $ref -replace "^refs/heads/", ""

    if ($name -ne "public/main") {
        Write-Host ">>> Deleting remote branch 'public/$name'"
        git push public --delete $name *> $null 2>&1
    }
}

Write-Host ">>> Step 5. delete all remote branches except private/main on 'private'"

$privateRefs = git ls-remote --heads private
$privateRefs -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) {
        return
    }

    $parts = $line -split "\s+"
    if ($parts.Length -lt 2) {
        return
    }

    $ref = $parts[1]
    $name = $ref -replace "^refs/heads/", ""

    if ($name -ne "private/main") {
        Write-Host ">>> Deleting remote branch 'private/$name'"
        git push private --delete $name *> $null 2>&1
    }
}

Write-Host ">>> Step 6. prune and fetch"

git fetch --all --prune

Write-Host ">>> Step 7. setup local branches public/main, private/main"

git branch -D "public/main" *> $null 2>&1
git branch -D "private/main" *> $null 2>&1

git checkout -B "public/main" "public/public/main"
git branch --set-upstream-to="public/public/main" "public/main"

git checkout -B "private/main" "private/private/main"
git branch --set-upstream-to="private/private/main" "private/main"

git checkout "public/main"

Write-Host ">>> Step 8. delete all local branches except public/main, private/main"

$localBranches = git for-each-ref refs/heads --format="%(refname:short)"
$localBranches -split "`n" | ForEach-Object {
    $branchName = $_.Trim()
    if (-not $branchName) {
        return
    }

    if (
        $branchName -ne "public/main" -and
        $branchName -ne "private/main"
    ) {
        Write-Host ">>> Deleting local branch '$branchName'"
        git branch -D $branchName *> $null 2>&1
    }
}

Write-Host "`n----------------------------------------"
Write-Host "[LOCAL BRANCHES]"
git branch -vv

Write-Host "`n----------------------------------------"
Write-Host "[REMOTE public]"
git ls-remote --heads public

Write-Host "`n----------------------------------------"
Write-Host "[REMOTE private]"
git ls-remote --heads private

Write-Host "`n----------------------------------------"
Write-Host "[STATUS]"
git status -sb
