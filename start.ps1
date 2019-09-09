[Console]::InputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding

$date = [DateTime]::Now.ToString("yyyy-MM-dd")
$datetime = [DateTime]::Now.ToString("yyyy-MM-dd-HH-mm-ss")

New-Item "logs\$date" -ItemType Directory -ErrorAction Ignore
npm start >> "logs\$date\$datetime.log.txt"
