$BASE = "http://localhost:5000"
$API  = "$BASE/api/v1"
$pass = 0
$fail = 0
$results = @()

function Test-API {
    param($name, $expected, $actual, $body = $null)
    if ($actual -eq $expected) {
        $script:pass++
        $results += "  [PASS] $name"
    } else {
        $script:fail++
        $results += "  [FAIL] $name  (expected $expected, got $actual)"
        if ($body) { $results += "         Body: $body" }
    }
}

function Invoke-API {
    param($method, $url, $body = $null, $session = $null)
    try {
        $params = @{ Method = $method; Uri = $url; ContentType = "application/json"; ErrorAction = "Stop" }
        if ($body)    { $params.Body = ($body | ConvertTo-Json -Depth 5) }
        if ($session) { $params.WebSession = $session }
        return Invoke-RestMethod @params
    } catch {
        return $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    }
}

function Invoke-APIWithSession {
    param($method, $url, $session, $body = $null)
    try {
        $params = @{ Method = $method; Uri = $url; ContentType = "application/json"; WebSession = $session; ErrorAction = "Stop" }
        if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
        return Invoke-RestMethod @params
    } catch {
        return $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CUSTOMER QUERY MANAGEMENT - API TESTS   " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# ─────────────────────────────────────────────────
Write-Host "`n[ BASE ROUTES ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-API GET "$BASE/"
Test-API "GET /  returns Hello from backend" $true $r.success

$r = Invoke-API GET "$BASE/health"
Test-API "GET /health  server is running" $true $r.success

$r = Invoke-API GET "$API"
Test-API "GET /api/v1  API index" $true $r.success

$r = Invoke-API GET "$BASE/nonexistent-route"
Test-API "GET /unknown  404 not found" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - VALIDATION ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-API POST "$API/auth/login" @{}
Test-API "POST /auth/login  empty body → 422" $false $r.success

$r = Invoke-API POST "$API/auth/login" @{ email = "notanemail"; password = "x" }
Test-API "POST /auth/login  invalid email → 422" $false $r.success

$r = Invoke-API POST "$API/auth/login" @{ email = "admin@cqms.com"; password = "wrongpassword" }
Test-API "POST /auth/login  wrong password → 401" $false $r.success

$r = Invoke-API POST "$API/auth/register" @{}
Test-API "POST /auth/register  empty body → 422" $false $r.success

$r = Invoke-API POST "$API/auth/register" @{ name = "x"; email = "bademail"; password = "short" }
Test-API "POST /auth/register  invalid fields → 422" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - LOGIN (Admin) ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$r = Invoke-RestMethod -Method POST -Uri "$API/auth/login" `
    -ContentType "application/json" `
    -Body (@{ email = "admin@cqms.com"; password = "Admin@1234" } | ConvertTo-Json) `
    -SessionVariable adminSession -ErrorAction Stop

Test-API "POST /auth/login  Admin login succeeds" $true $r.success
Test-API "POST /auth/login  token NOT in response body" $null $r.data.token
Test-API "POST /auth/login  user data returned" "admin@cqms.com" $r.data.user.email
Test-API "POST /auth/login  user role is Admin" "Admin" $r.data.user.role

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - LOGIN (Support) ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$supportSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$r2 = Invoke-RestMethod -Method POST -Uri "$API/auth/login" `
    -ContentType "application/json" `
    -Body (@{ email = "sarah@cqms.com"; password = "Support@1234" } | ConvertTo-Json) `
    -SessionVariable supportSession -ErrorAction Stop

Test-API "POST /auth/login  Support login succeeds" $true $r2.success
Test-API "POST /auth/login  Support role correct" "Support" $r2.data.user.role

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - LOGIN (User) ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$userSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$r3 = Invoke-RestMethod -Method POST -Uri "$API/auth/login" `
    -ContentType "application/json" `
    -Body (@{ email = "john@example.com"; password = "User@1234" } | ConvertTo-Json) `
    -SessionVariable userSession -ErrorAction Stop

Test-API "POST /auth/login  User login succeeds" $true $r3.success
Test-API "POST /auth/login  User role correct" "User" $r3.data.user.role

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - PROTECTED ROUTES ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-API GET "$API/auth/me"
Test-API "GET /auth/me  no cookie → 401" $false $r.success

$r = Invoke-APIWithSession GET "$API/auth/me" $adminSession
Test-API "GET /auth/me  with cookie → returns user" $true $r.success
Test-API "GET /auth/me  correct email" "admin@cqms.com" $r.data.user.email

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - LIST & PAGINATION ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-API GET "$API/queries"
Test-API "GET /queries  no auth → 401" $false $r.success

$r = Invoke-APIWithSession GET "$API/queries" $adminSession
Test-API "GET /queries  authenticated → success" $true $r.success
Test-API "GET /queries  has docs array" $true ($r.data.queries -is [array])
Test-API "GET /queries  has pagination meta" $true ($r.meta.totalDocuments -gt 0)
Test-API "GET /queries  has totalPages" $true ($r.meta.totalPages -gt 0)
Test-API "GET /queries  has currentPage" 1 $r.meta.currentPage

$r = Invoke-APIWithSession GET "$API/queries?page=1&limit=5" $adminSession
Test-API "GET /queries?limit=5  returns 5 or fewer" $true ($r.data.queries.Count -le 5)

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - SEARCH ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/queries?search=login" $adminSession
Test-API "GET /queries?search=login  returns results" $true ($r.data.queries.Count -ge 1)

$r = Invoke-APIWithSession GET "$API/queries?search=zzznoresults999" $adminSession
Test-API "GET /queries?search=zzznoresults999  returns 0 results" 0 $r.data.queries.Count

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - FILTERING ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/queries?status=Open" $adminSession
Test-API "GET /queries?status=Open  all docs are Open" $true (($r.data.queries | Where-Object { $_.status -ne "Open" }).Count -eq 0)

$r = Invoke-APIWithSession GET "$API/queries?priority=Urgent" $adminSession
Test-API "GET /queries?priority=Urgent  all docs are Urgent" $true (($r.data.queries | Where-Object { $_.priority -ne "Urgent" }).Count -eq 0)

$r = Invoke-APIWithSession GET "$API/queries?category=Technical" $adminSession
Test-API "GET /queries?category=Technical  all docs are Technical" $true (($r.data.queries | Where-Object { $_.category -ne "Technical" }).Count -eq 0)

$r = Invoke-APIWithSession GET "$API/queries?status=InvalidStatus" $adminSession
Test-API "GET /queries?status=invalid  → 422 validation error" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - SORTING ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/queries?sort=newest" $adminSession
Test-API "GET /queries?sort=newest  succeeds" $true $r.success

$r = Invoke-APIWithSession GET "$API/queries?sort=oldest" $adminSession
Test-API "GET /queries?sort=oldest  succeeds" $true $r.success

$r = Invoke-APIWithSession GET "$API/queries?sort=priority" $adminSession
Test-API "GET /queries?sort=priority  succeeds" $true $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - STATS ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/queries/stats" $adminSession
Test-API "GET /queries/stats  succeeds" $true $r.success
Test-API "GET /queries/stats  has total" $true ($r.data.stats.total -gt 0)
Test-API "GET /queries/stats  has byStatus" $true ($null -ne $r.data.stats.byStatus)
Test-API "GET /queries/stats  total >= sum of statuses" $true ($r.data.stats.total -ge ($r.data.stats.byStatus.open + $r.data.stats.byStatus.inProgress + $r.data.stats.byStatus.resolved + $r.data.stats.byStatus.closed + $r.data.stats.byStatus.rejected))

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - CREATE ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession POST "$API/queries" $adminSession @{
    customerName  = "Test Customer API"
    customerEmail = "testapi@example.com"
    customerPhone = "+1-555-9999"
    subject       = "Test query created via API test"
    description   = "This is a test description that is long enough to pass validation"
    priority      = "High"
    category      = "Technical"
}
Test-API "POST /queries  create succeeds" $true $r.success
Test-API "POST /queries  returns query with _id" $true ($null -ne $r.data.query._id)
Test-API "POST /queries  status defaults to Open" "Open" $r.data.query.status
Test-API "POST /queries  priority set correctly" "High" $r.data.query.priority
Test-API "POST /queries  createdBy populated" $true ($null -ne $r.data.query.createdBy)
$newQueryId = $r.data.query._id

# validation errors
$r = Invoke-APIWithSession POST "$API/queries" $adminSession @{ customerName = "x" }
Test-API "POST /queries  missing required fields → 422" $false $r.success

$r = Invoke-APIWithSession POST "$API/queries" $userSession @{
    customerName  = "User Created Query"
    customerEmail = "user@test.com"
    subject       = "User created this ticket"
    description   = "Description long enough to pass validation requirements here"
    category      = "General"
}
Test-API "POST /queries  User role can create query" $true $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - GET SINGLE ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/queries/$newQueryId" $adminSession
Test-API "GET /queries/:id  found by ID" $true $r.success
Test-API "GET /queries/:id  correct ID returned" $newQueryId $r.data.query._id

$r = Invoke-APIWithSession GET "$API/queries/000000000000000000000000" $adminSession
Test-API "GET /queries/:id  non-existent ID → 404" $false $r.success

$r = Invoke-APIWithSession GET "$API/queries/notanid" $adminSession
Test-API "GET /queries/:id  invalid ObjectId → 400" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - UPDATE ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId" $adminSession @{
    subject  = "Updated subject from API test"
    priority = "Urgent"
}
Test-API "PATCH /queries/:id  update succeeds" $true $r.success
Test-API "PATCH /queries/:id  subject updated" "Updated subject from API test" $r.data.query.subject
Test-API "PATCH /queries/:id  priority updated" "Urgent" $r.data.query.priority
Test-API "PATCH /queries/:id  updatedBy populated" $true ($null -ne $r.data.query.updatedBy)

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - STATUS & PRIORITY ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/status" $adminSession @{ status = "In Progress" }
Test-API "PATCH /queries/:id/status  Admin can update status" $true $r.success
Test-API "PATCH /queries/:id/status  status changed" "In Progress" $r.data.query.status

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/status" $userSession @{ status = "Resolved" }
Test-API "PATCH /queries/:id/status  User role → 403" $false $r.success

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/status" $adminSession @{ status = "BadStatus" }
Test-API "PATCH /queries/:id/status  invalid status → 422" $false $r.success

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/priority" $supportSession @{ priority = "Low" }
Test-API "PATCH /queries/:id/priority  Support can update priority" $true $r.success
Test-API "PATCH /queries/:id/priority  priority changed" "Low" $r.data.query.priority

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - ASSIGN ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$agentsR = Invoke-APIWithSession GET "$API/users/agents" $adminSession
$supportAgentId = $agentsR.data.agents[0]._id
Test-API "GET /users/agents  returns support agents" $true ($agentsR.data.agents.Count -gt 0)

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/assign" $adminSession @{ assignedTo = $supportAgentId }
Test-API "PATCH /queries/:id/assign  assign succeeds" $true $r.success
Test-API "PATCH /queries/:id/assign  assignedTo populated" $true ($null -ne $r.data.query.assignedTo)

$userId = $r3.data.user._id
$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/assign" $adminSession @{ assignedTo = $userId }
Test-API "PATCH /queries/:id/assign  cannot assign to User role → 403" $false $r.success

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/assign" $userSession @{ assignedTo = $supportAgentId }
Test-API "PATCH /queries/:id/assign  User role cannot assign → 403" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - SOFT DELETE & RESTORE ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession DELETE "$API/queries/$newQueryId" $userSession
Test-API "DELETE /queries/:id  User role → 403" $false $r.success

$r = Invoke-APIWithSession DELETE "$API/queries/$newQueryId" $adminSession
Test-API "DELETE /queries/:id  Admin soft delete succeeds" $true $r.success

$r = Invoke-APIWithSession GET "$API/queries/$newQueryId" $adminSession
Test-API "GET /queries/:id  deleted query not found by default" $false $r.success

$r = Invoke-APIWithSession PATCH "$API/queries/$newQueryId/restore" $adminSession
Test-API "PATCH /queries/:id/restore  Admin restore succeeds" $true $r.success

$r = Invoke-APIWithSession GET "$API/queries/$newQueryId" $adminSession
Test-API "GET /queries/:id  query accessible again after restore" $true $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ QUERIES - BULK OPERATIONS ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$allR = Invoke-APIWithSession GET "$API/queries?limit=3" $adminSession
$bulkIds = $allR.data.queries | Select-Object -ExpandProperty _id

$r = Invoke-APIWithSession POST "$API/queries/bulk-delete" $adminSession @{ ids = $bulkIds }
Test-API "POST /queries/bulk-delete  Admin bulk delete succeeds" $true $r.success
Test-API "POST /queries/bulk-delete  correct count returned" $bulkIds.Count $r.data.deletedCount

$r = Invoke-APIWithSession POST "$API/queries/bulk-restore" $adminSession @{ ids = $bulkIds }
Test-API "POST /queries/bulk-restore  Admin bulk restore succeeds" $true $r.success

$r = Invoke-APIWithSession POST "$API/queries/bulk-delete" $userSession @{ ids = $bulkIds }
Test-API "POST /queries/bulk-delete  User role → 403" $false $r.success

$r = Invoke-APIWithSession POST "$API/queries/bulk-delete" $adminSession @{ ids = @() }
Test-API "POST /queries/bulk-delete  empty ids → 422" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ USERS - ADMIN ONLY ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession GET "$API/users" $adminSession
Test-API "GET /users  Admin gets all users" $true $r.success
Test-API "GET /users  returns user array" $true ($r.data.users -is [array])
Test-API "GET /users  has pagination meta" $true ($r.meta.totalDocuments -gt 0)

$r = Invoke-APIWithSession GET "$API/users" $userSession
Test-API "GET /users  User role → 403" $false $r.success

$r = Invoke-APIWithSession GET "$API/users" $supportSession
Test-API "GET /users  Support role → 403" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ USERS - GET BY ID ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$adminId = $r2.data.user._id
if (-not $adminId) { $adminId = (Invoke-APIWithSession GET "$API/auth/me" $adminSession).data.user._id }
$meR = Invoke-APIWithSession GET "$API/auth/me" $adminSession
$adminId = $meR.data.user._id

$r = Invoke-APIWithSession GET "$API/users/$adminId" $adminSession
Test-API "GET /users/:id  Admin get user by ID" $true $r.success

$r = Invoke-APIWithSession GET "$API/users/000000000000000000000000" $adminSession
Test-API "GET /users/:id  non-existent → 404" $false $r.success

$r = Invoke-APIWithSession GET "$API/users/$adminId" $userSession
Test-API "GET /users/:id  User role → 403" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - DUPLICATE REGISTER ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-API POST "$API/auth/register" @{
    name     = "Duplicate User"
    email    = "admin@cqms.com"
    password = "Admin@1234"
}
Test-API "POST /auth/register  duplicate email → 409" $false $r.success

# ─────────────────────────────────────────────────
Write-Host "`n[ AUTH - LOGOUT ]" -ForegroundColor Yellow
# ─────────────────────────────────────────────────

$r = Invoke-APIWithSession POST "$API/auth/logout" $adminSession
Test-API "POST /auth/logout  succeeds" $true $r.success

$r = Invoke-APIWithSession GET "$API/auth/me" $adminSession
Test-API "GET /auth/me  after logout cookie cleared → 401" $false $r.success

# ─────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
$results | ForEach-Object {
    if ($_ -match "\[PASS\]") {
        Write-Host $_ -ForegroundColor Green
    } else {
        Write-Host $_ -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "  Total : $($pass + $fail)" -ForegroundColor White
Write-Host "  Passed: $pass" -ForegroundColor Green
Write-Host "  Failed: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "============================================" -ForegroundColor Cyan
