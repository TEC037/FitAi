# adelante-bot.ps1
# Vigilante de inactividad: cuando el usuario lleva 1 segundo sin mover el
# raton ni el teclado a nivel global, escribe "adelante" + Enter en la ventana
# activa. Se usa para que el asistente continue de forma autonoma.
#
# Uso recomendado (evita bloqueos de ExecutionPolicy y cierres instantaneos):
#     adelante-bot.cmd          (doble clic; arranca minimizado)
# Para depurar (ventana visible, sin minimizar):
#     powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\adelante-bot.ps1
#
# Parametros:
#   -IdleSeconds  Segundos de inactividad antes de enviar (por defecto: 3)
#   -Cooldown     Segundos de espera entre envios para no inundar (por defecto: 25)
#   -LogFile      Ruta del log (por defecto: %TEMP%\adelante-bot.log)
param(
    [int]$IdleSeconds = 3,
    [int]$Cooldown = 300,
    [string]$LogFile = ""
)

$ErrorActionPreference = 'Stop'

if ($LogFile -eq "") { $LogFile = Join-Path $env:TEMP "adelante-bot.log" }

function Write-Log($Message) {
    $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $Message
    Write-Host $line
    try { Add-Content -LiteralPath $LogFile -Value $line } catch { }
}

# Guardia: no volver a registrar el tipo si ya existe en la sesion.
if (-not ('IdleDetector' -as [type])) {
    Add-Type @'
using System;
using System.Runtime.InteropServices;
public class IdleDetector {
    [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    public static uint GetIdleMillis() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        GetLastInputInfo(ref lii);
        return (uint)(Environment.TickCount - lii.dwTime);
    }
}
'@
}

try {
    $shell = New-Object -ComObject WScript.Shell
    $idleMs = $IdleSeconds * 1000

    Write-Log "adelante-bot: envia 'adelante' + Enter tras $IdleSeconds s de inactividad (cooldown $Cooldown s). Log: $LogFile"

    while ($true) {
        Start-Sleep -Milliseconds 250

        try {
            $idle = [IdleDetector]::GetIdleMillis()
            if ($idle -lt $idleMs) { continue }

            $shell.SendKeys('adelante{ENTER}')
            Write-Log "adelante + Enter enviado"
        } catch {
            # Un error transitorio no debe matar el bucle
            Write-Log ("Error transitorio: {0}" -f $_.Exception.Message)
        }

        # Espera de cooldown para no repetir mientras la IA trabaja o el usuario vuelve
        Start-Sleep -Seconds $Cooldown
    }
} catch {
    # Nunca cerrar sin dejar rastro: log del error + espera si la consola es visible.
    $msg = "Fallo al arrancar el bot: {0}" -f $_.Exception.Message
    Write-Host $msg
    try { Add-Content -LiteralPath $LogFile -Value ("[ERR] " + $msg) } catch { }
    if ([Environment]::UserInteractive) {
        Write-Host "Pulsa Enter para cerrar."
        Read-Host
    }
    exit 1
}