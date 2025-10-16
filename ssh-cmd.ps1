param(
    [string]$Command
)

$password = ConvertTo-SecureString "vFpyJS4FA" -AsPlainText -Force
$username = "ubuntu"
$server = "200.144.254.4"

# Executar comando SSH
$result = & plink -ssh -batch -pw vFpyJS4FA $username@$server $Command

Write-Output $result
