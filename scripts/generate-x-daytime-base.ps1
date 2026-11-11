$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Join-Path $root 'public\og-photo.jpg'
$photo = [System.Drawing.Image]::FromFile($source)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object MimeType -eq 'image/jpeg' | Select-Object -First 1
$quality = [System.Drawing.Imaging.EncoderParameters]::new(1)
$quality.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
  [System.Drawing.Imaging.Encoder]::Quality, [long]90)
$navy = [System.Drawing.ColorTranslator]::FromHtml('#07183b')
$ink = [System.Drawing.SolidBrush]::new($navy)
$cream = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fffdf6'))
$yellow = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fff1a1'))
$headerFont = [System.Drawing.Font]::new('Noto Sans JP', 30, [System.Drawing.FontStyle]::Regular,
  [System.Drawing.GraphicsUnit]::Pixel)
$titleFont = [System.Drawing.Font]::new('Noto Sans JP', 59, [System.Drawing.FontStyle]::Bold,
  [System.Drawing.GraphicsUnit]::Pixel)
$labelFont = [System.Drawing.Font]::new('Noto Sans JP', 35, [System.Drawing.FontStyle]::Regular,
  [System.Drawing.GraphicsUnit]::Pixel)
$footerFont = [System.Drawing.Font]::new('Noto Sans JP', 31, [System.Drawing.FontStyle]::Regular,
  [System.Drawing.GraphicsUnit]::Pixel)
try {
  foreach ($lang in @('ja', 'en')) {
    foreach ($mode in @('comparison', 'movement', 'ranking', 'ride-comparison')) {
      $bmp = [System.Drawing.Bitmap]::new(1200, 1500)
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.SmoothingMode = 'AntiAlias'
        $g.TextRenderingHint = 'AntiAliasGridFit'
        $g.InterpolationMode = 'HighQualityBicubic'
        $g.Clear($navy)
        $g.DrawImage($photo, 18, 18, 1164, 655)
        $g.FillRectangle($cream, 18, 690, 1164, 792)
        $g.FillRectangle($yellow, 72, 1270, 1056, 82)
        $g.DrawString($(if ($lang -eq 'ja') { 'USJ待ち時間ナビ  |  非公式' } else {
          'USJ Wait Times  |  Unofficial' }), $headerFont, $ink, 60, 711)
        if ($mode -ne 'movement' -and $mode -ne 'ride-comparison') {
          $g.DrawString($(if ($lang -eq 'ja') { '今日のUSJ、待ち時間は？' } else {
            'USJ waits right now' }), $titleFont, $ink, 60, 790)
        }
        if ($mode -eq 'ride-comparison') {
          $g.DrawString($(if ($lang -eq 'ja') { '投稿時点' } else { 'At post time' }),
            $labelFont, $ink, 60, 1025)
          $g.DrawString($(if ($lang -eq 'ja') { "直近7日間の`n同時刻平均" } else {
            "Prior 7 days`nsame-time avg" }), $labelFont, $ink, 60, 1118)
        } elseif ($mode -eq 'comparison') {
          $g.DrawString($(if ($lang -eq 'ja') { '今日' } else { 'Now' }),
            $labelFont, $ink, 60, 1025)
          $g.DrawString($(if ($lang -eq 'ja') { "直近7日間の`n同時刻平均" } else {
            "Prior 7 days`nsame time" }), $labelFont, $ink, 60, 1118)
        } elseif ($mode -eq 'movement') {
          $g.DrawString($(if ($lang -eq 'ja') { '現在' } else { 'Now' }),
            $labelFont, $ink, 60, 1025)
          $g.DrawString($(if ($lang -eq 'ja') { '約20分前' } else { '~20 min ago' }),
            $labelFont, $ink, 60, 1145)
        }
        $g.DrawString($(if ($lang -eq 'ja') {
          '施設別の待ち時間・変化は投稿文のリンクへ'
        } else { 'Ride-by-ride wait trends: link in the post' }),
          $footerFont, $ink, 60, 1385)
        $folder = if ($lang -eq 'ja') { Join-Path $root 'public' } else {
          Join-Path $root 'preview\en' }
        $path = Join-Path $folder "x-card-daytime-$mode-base.jpg"
        $bmp.Save($path, $codec, $quality)
      } finally { $g.Dispose(); $bmp.Dispose() }
    }
  }
} finally {
  $footerFont.Dispose(); $labelFont.Dispose(); $titleFont.Dispose(); $headerFont.Dispose()
  $yellow.Dispose(); $cream.Dispose(); $ink.Dispose(); $quality.Dispose(); $photo.Dispose()
}
