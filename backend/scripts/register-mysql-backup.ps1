param(
    [ValidatePattern('^([01][0-9]|2[0-3]):[0-5][0-9]$')]
    [string]$Time = '02:00',
    [switch]$OnlyWhenLoggedOn
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$node = (Get-Command node.exe -CommandType Application).Source
$backupScript = Join-Path $PSScriptRoot 'mysql-backup.cjs'
$action = New-ScheduledTaskAction -Execute $node -Argument ('"{0}" backup' -f $backupScript) -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At ([DateTime]::Today.Add([TimeSpan]::Parse($Time)))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 15)
$account = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$logonType = if ($OnlyWhenLoggedOn) { 'Interactive' } else { 'S4U' }
$principal = New-ScheduledTaskPrincipal -UserId $account -LogonType $logonType -RunLevel Limited

Register-ScheduledTask -TaskName 'Sinstock MySQL Backup' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Backup diário do banco MySQL do Sinstock.' | Out-Null
Get-ScheduledTaskInfo -TaskName 'Sinstock MySQL Backup'
