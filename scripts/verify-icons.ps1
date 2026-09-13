Add-Type -AssemblyName System.Drawing
$base = Split-Path -Parent $PSScriptRoot

$b = [System.Drawing.Bitmap]::FromFile("$base\public\icon-512.png")
Write-Host ("icon-512 corner(10,10):  " + $b.GetPixel(10,10).ToString())
Write-Host ("icon-512 corner(300,10): " + $b.GetPixel(300,10).ToString())
Write-Host ("icon-512 leaf(210,260):  " + $b.GetPixel(210,260).ToString())
Write-Host ("icon-512 spark(406,104): " + $b.GetPixel(406,104).ToString())
$b.Dispose()

$b2 = [System.Drawing.Bitmap]::FromFile("$base\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png")
Write-Host ("fg corner(5,5):     " + $b2.GetPixel(5,5).ToString())
Write-Host ("fg center(216,260): " + $b2.GetPixel(216,260).ToString())
$b2.Dispose()

$b3 = [System.Drawing.Bitmap]::FromFile("$base\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png")
Write-Host ("launcher corner: " + $b3.GetPixel(3,3).ToString())
Write-Host ("launcher leaf:   " + $b3.GetPixel(70,90).ToString())
$b3.Dispose()
