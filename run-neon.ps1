# Runs the Spring Boot backend against the linked Neon database.
# Reads DATABASE_URL_UNPOOLED from .env.local (git-ignored) and converts it to JDBC settings.
$line = Get-Content "$PSScriptRoot\.env.local" | Where-Object { $_ -match '^DATABASE_URL_UNPOOLED=' } | Select-Object -First 1
$url = ($line -replace '^DATABASE_URL_UNPOOLED=', '').Trim('"', "'")
if ($url -notmatch '^postgres(ql)?://([^:]+):([^@]+)@([^/]+)/([^?]+)') { throw "Could not parse DATABASE_URL_UNPOOLED" }
$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:DB_USER = $Matches[2]
$env:DB_PASSWORD = [uri]::UnescapeDataString($Matches[3])
$env:DB_URL = "jdbc:postgresql://$($Matches[4])/$($Matches[5])?sslmode=require"
Set-Location "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
