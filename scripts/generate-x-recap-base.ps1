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
$panel = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f0f6fc'))
$yellow = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fff1a1'))
$line = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#d1e0ec'), 2)
$headerFont = [System.Drawing.Font]::new('Noto Sans JP', 30, [System.Drawing.FontStyle]::Regular,
  [System.Drawing.GraphicsUnit]::Pixel)
$footerFont = [System.Drawing.Font]::new('Noto Sans JP', 27, [System.Drawing.FontStyle]::Regular,
  [System.Drawing.GraphicsUnit]::Pixel)
try {
  foreach ($lang in @('ja', 'en')) {
    $bmp = [System.Drawing.Bitmap]::new(1200, 1500)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.SmoothingMode = 'AntiAlias'
      $g.TextRenderingHint = 'AntiAliasGridFit'
      $g.InterpolationMode = 'HighQualityBicubic'
      $g.Clear($navy)
      $g.DrawImage($photo, 18, 18, 1164, 655)
      $g.FillRectangle($cream, 18, 690, 1164, 792)
      $g.FillRectangle($panel, 60, 958, 1080, 339)
      $g.DrawLine($line, 75, 1071, 1125, 1071)
      $g.DrawLine($line, 75, 1184, 1125, 1184)
      $g.FillRectangle($yellow, 72, 1340, 1056, 89)
      $g.DrawString($(if ($lang -eq 'ja') { 'USJ待ち時間ナビ  |  非公式' } else {
        'USJ Wait Times  |  Unofficial' }), $headerFont, $ink, 60, 711)
      $g.DrawString($(if ($lang -eq 'ja') {
        '時間帯ごとの記録は投稿文のリンクへ'
      } else { 'Hourly records: link in the post' }),
        $footerFont, $ink, 60, 1434)
      $folder = if ($lang -eq 'ja') { Join-Path $root 'public' } else {
        Join-Path $root 'preview\en' }
      $bmp.Save((Join-Path $folder 'x-card-recap-base.jpg'), $codec, $quality)
    } finally { $g.Dispose(); $bmp.Dispose() }
  }
} finally {
  $footerFont.Dispose(); $headerFont.Dispose(); $line.Dispose()
  $yellow.Dispose(); $panel.Dispose(); $cream.Dispose(); $ink.Dispose()
  $quality.Dispose(); $photo.Dispose()
}
