$uri = 'https://ttfcw5hak8.execute-api.us-east-1.amazonaws.com/prod/bookings'

function SaveReq($method,$hdr,$body,$out){
  $sb = [System.Text.StringBuilder]::new()
  $sb.AppendLine("---- $method ----") | Out-Null
  try{
    $r = Invoke-WebRequest -Uri $uri -Method $method -Headers $hdr -Body $body -UseBasicParsing -TimeoutSec 20
    $sb.AppendLine("Status: $($r.StatusCode)") | Out-Null
    $sb.AppendLine("Headers:") | Out-Null
    $r.Headers.GetEnumerator() | ForEach-Object { $sb.AppendLine("  $($_.Name): $($_.Value)") | Out-Null }
    $sb.AppendLine("Body:") | Out-Null
    $sb.AppendLine($r.Content) | Out-Null
  } catch {
    $sb.AppendLine("Error: $($_.Exception.Message)") | Out-Null
    if ($_.Exception.Response) {
      $resp = $_.Exception.Response
      $sb.AppendLine("Response Status: $($resp.StatusCode)") | Out-Null
      try{
        $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $bodyText = $sr.ReadToEnd()
        $sb.AppendLine("Response Body:") | Out-Null
        $sb.AppendLine($bodyText) | Out-Null
        $sb.AppendLine("Response Headers:") | Out-Null
        $resp.Headers | ForEach-Object { $sb.AppendLine("  $_") | Out-Null }
      } catch { $sb.AppendLine("Failed to read response stream: $($_.Exception.Message)") | Out-Null }
    }
  }
  Set-Content -Path $out -Value $sb.ToString()
}

$baseOut = Join-Path $PSScriptRoot ".."
$optionsOut = Join-Path $baseOut "bookings-options.txt"
$getOut = Join-Path $baseOut "bookings-get.txt"
$postOut = Join-Path $baseOut "bookings-post.txt"

$hdr = @{ Origin = 'https://vist-jo.com' }
SaveReq -method OPTIONS -hdr $hdr -body $null -out $optionsOut
SaveReq -method GET -hdr $hdr -body $null -out $getOut
$hdr2 = @{ Origin = 'https://vist-jo.com'; 'Content-Type' = 'application/json' }
SaveReq -method POST -hdr $hdr2 -body '{}' -out $postOut
Write-Output "Saved to files: $optionsOut, $getOut, $postOut"