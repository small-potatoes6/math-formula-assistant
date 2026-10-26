param(
  [Parameter(Mandatory = $true)]
  [string]$ImagePath,
  [string]$Language = 'zh-Hans'
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]

$asTaskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object {
    $_.Name -eq 'AsTask' -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  } |
  Select-Object -First 1

function Wait-WinRtOperation {
  param(
    [object]$Operation,
    [Type]$ResultType
  )

  $asTask = $asTaskMethod.MakeGenericMethod($ResultType)
  $task = $asTask.Invoke($null, @($Operation))
  $task.Wait()
  return $task.Result
}

$resolvedPath = (Resolve-Path -LiteralPath $ImagePath).Path
$file = Wait-WinRtOperation `
  ([Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedPath)) `
  ([Windows.Storage.StorageFile])
$stream = Wait-WinRtOperation `
  ($file.OpenReadAsync()) `
  ([Windows.Storage.Streams.IRandomAccessStreamWithContentType])
$decoder = Wait-WinRtOperation `
  ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) `
  ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Wait-WinRtOperation `
  ($decoder.GetSoftwareBitmapAsync()) `
  ([Windows.Graphics.Imaging.SoftwareBitmap])

$ocrLanguage = New-Object Windows.Globalization.Language -ArgumentList $Language
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($ocrLanguage)
if (-not $engine) {
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
}
if (-not $engine) {
  throw "No Windows OCR engine is available for $Language"
}

$result = Wait-WinRtOperation `
  ($engine.RecognizeAsync($bitmap)) `
  ([Windows.Media.Ocr.OcrResult])
$result.Text
