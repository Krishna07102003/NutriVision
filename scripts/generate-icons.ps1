# Generates Poshaniq brand icons (leaf on gradient tile) for PWA + Android.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function PF([single]$x, [single]$y, [single]$scale, [single]$ox, [single]$oy) {
  $px = ($x * $scale) + $ox
  $py = ($y * $scale) + $oy
  return New-Object System.Drawing.PointF($px, $py)
}

function New-LeafPath([single]$scale, [single]$ox, [single]$oy) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p1 = PF 47 16 $scale $ox $oy
  $p2 = PF 47.7 34.5 $scale $ox $oy
  $p3 = PF 38.2 45.5 $scale $ox $oy
  $p4 = PF 22.5 45.5 $scale $ox $oy
  $p5 = PF 20.4 45.5 $scale $ox $oy
  $p6 = PF 18.3 45.3 $scale $ox $oy
  $p7 = PF 16.4 44.6 $scale $ox $oy
  $p8 = PF 17.5 27.5 $scale $ox $oy
  $p9 = PF 28 17 $scale $ox $oy
  $p.StartFigure()
  $p.AddBezier($p1, $p2, $p3, $p4)
  $p.AddBezier($p4, $p5, $p6, $p7)
  $p.AddBezier($p7, $p8, $p9, $p1)
  $p.CloseFigure()
  return $p
}

function New-RoundRectPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.StartFigure()
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Draw-Mark([System.Drawing.Graphics]$g, [single]$scale, [single]$ox, [single]$oy) {
  # Leaf (white, ~96% opacity)
  $leaf = New-LeafPath $scale $ox $oy
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
  $g.FillPath($white, $leaf)
  $leaf.Dispose()
  $white.Dispose()

  # Vein (dark blue, 50% opacity, rounded caps)
  $v1 = PF 18.5 43.5 $scale $ox $oy
  $v2 = PF 24.5 33.9 $scale $ox $oy
  $v3 = PF 31.9 26.3 $scale $ox $oy
  $v4 = PF 40.5 21.5 $scale $ox $oy
  $vein = New-Object System.Drawing.Drawing2D.GraphicsPath
  $vein.AddBezier($v1, $v2, $v3, $v4)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(128, 0x02, 0x84, 0xC7), (3.0 * $scale))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawPath($pen, $vein)
  $vein.Dispose()
  $pen.Dispose()

  # IQ spark (white, ~92% opacity)
  $r = 4.6 * $scale
  $cx = (51 * $scale + $ox) - $r
  $cy = (13 * $scale + $oy) - $r
  $sb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
  $g.FillEllipse($sb, $cx, $cy, (2 * $r), (2 * $r))
  $sb.Dispose()
}

function Draw-Icon([System.Drawing.Graphics]$g, [int]$size, [string]$mode) {
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  if ($mode -eq 'fg') {
    # Adaptive foreground: leaf only, centered in the safe zone
    $sc = $size / 64.0 * 0.62
    $ox = $size / 2.0 - 36.0 * $sc
    $oy = $size / 2.0 - 27.0 * $sc
    Draw-Mark $g $sc $ox $oy
    return
  }

  $scale = $size / 64.0
  if ($mode -eq 'round') {
    $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
    $cw = $size - (3 * $scale)
    $clip.AddEllipse((1.5 * $scale), (1.5 * $scale), $cw, $cw)
    $g.SetClip($clip)
    $clip.Dispose()
  }

  $rect = New-Object System.Drawing.RectangleF(0, 0, [single]$size, [single]$size)
  $c1 = [System.Drawing.Color]::FromArgb(255, 0x38, 0xBD, 0xF8)
  $c2 = [System.Drawing.Color]::FromArgb(255, 0x0E, 0xA5, 0xE9)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)

  if ($mode -eq 'tile') {
    $tile = New-RoundRectPath (1 * $scale) (1 * $scale) (62 * $scale) (62 * $scale) (15 * $scale)
    $g.FillPath($brush, $tile)
    $tile.Dispose()
  }
  else {
    $g.FillRectangle($brush, 0, 0, $size, $size)
  }
  $brush.Dispose()

  Draw-Mark $g $scale 0 0
  $g.ResetClip()
}

function Save-Png([string]$path, [int]$size, [string]$mode) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  Draw-Icon $g $size $mode
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host ("wrote {0} ({1}px, {2})" -f $path, $size, $mode)
}

# --- PWA + favicon ---
Save-Png "$root/public/icon-192.png" 192 'tile'
Save-Png "$root/public/icon-512.png" 512 'tile'
Save-Png "$root/public/apple-touch-icon.png" 180 'tile'

# --- Android legacy launchers ---
$launcherSizes = @{ 'mdpi' = 48; 'hdpi' = 72; 'xhdpi' = 96; 'xxhdpi' = 144; 'xxxhdpi' = 192 }
foreach ($d in $launcherSizes.Keys) {
  $dir = "$root/android/app/src/main/res/mipmap-$d"
  Save-Png "$dir/ic_launcher.png" $launcherSizes[$d] 'tile'
  Save-Png "$dir/ic_launcher_round.png" $launcherSizes[$d] 'round'
}

# --- Android adaptive foregrounds (108dp grid) ---
$fgSizes = @{ 'mdpi' = 108; 'hdpi' = 162; 'xhdpi' = 216; 'xxhdpi' = 324; 'xxxhdpi' = 432 }
foreach ($d in $fgSizes.Keys) {
  Save-Png "$root/android/app/src/main/res/mipmap-$d/ic_launcher_foreground.png" $fgSizes[$d] 'fg'
}

# --- Adaptive icon background: brand gradient base color ---
Set-Content -Path "$root/android/app/src/main/res/values/ic_launcher_background.xml" -Value "<?xml version=`"1.0`" encoding=`"utf-8`"?>`n<resources>`n    <color name=`"ic_launcher_background`">#0EA5E9</color>`n</resources>" -Encoding UTF8
Write-Host "wrote android/app/src/main/res/values/ic_launcher_background.xml (#0EA5E9)"

Write-Host "All icons generated."
