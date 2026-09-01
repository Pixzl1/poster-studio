# Local installation guide

This guide explains how to run Poster Studio privately on a Windows, macOS, or Linux computer. No programming knowledge is required.

Poster Studio runs in a small Docker container and opens in your normal web browser. The application remains on your computer and is not published to the internet by these instructions. The provided image supports AMD/Intel computers and ARM64 devices such as Apple Silicon Macs.

## 1. Install Docker

Choose the instructions for your computer:

- **Windows:** install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
- **macOS:** install [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/).
- **Linux:** install [Docker Engine](https://docs.docker.com/engine/install/) for your distribution.

After installation, start Docker and wait until it reports that the Docker engine is running.

## 2. Start Poster Studio

Open a command window:

- **Windows:** open PowerShell.
- **macOS:** open Terminal from **Applications → Utilities**.
- **Linux:** open your preferred terminal.

Copy the complete command below, paste it into the command window, and press **Enter**:

```bash
docker run -d --name poster-studio --restart unless-stopped -p 127.0.0.1:3000:3000 -e APP_URL=http://localhost:3000 -e "MUSICBRAINZ_USER_AGENT=PosterStudio/1.0 (https://github.com/Pixzl1/poster-studio)" ghcr.io/pixzl1/poster-studio:latest
```

Docker downloads and starts Poster Studio automatically. The first start can take a few minutes depending on the internet connection.

## 3. Open Poster Studio

Open this address in a web browser:

**[http://localhost:3000](http://localhost:3000)**

The `127.0.0.1` setting in the installation command makes Poster Studio accessible only from the same computer.

## Everyday controls

Poster Studio starts automatically while Docker is running. These commands can also be used manually:

```bash
# Stop Poster Studio
docker stop poster-studio

# Start Poster Studio again
docker start poster-studio
```

## Update Poster Studio

Run these commands one after another:

```bash
docker pull ghcr.io/pixzl1/poster-studio:latest
docker rm -f poster-studio
docker run -d --name poster-studio --restart unless-stopped -p 127.0.0.1:3000:3000 -e APP_URL=http://localhost:3000 -e "MUSICBRAINZ_USER_AGENT=PosterStudio/1.0 (https://github.com/Pixzl1/poster-studio)" ghcr.io/pixzl1/poster-studio:latest
```

Artwork is not stored inside the container, so no server-side artwork is removed when the container is replaced. Open browser sessions are intentionally temporary.

## Uninstall Poster Studio

The following commands remove the Poster Studio container and its downloaded image:

```bash
docker rm -f poster-studio
docker image rm ghcr.io/pixzl1/poster-studio:latest
```

Docker itself can then be removed through the normal application or package management of the operating system if it is no longer needed.

## Troubleshooting

### The browser says the page cannot be reached

Make sure Docker is running, then enter:

```bash
docker start poster-studio
```

Wait a few seconds and reload [http://localhost:3000](http://localhost:3000).

### The container name is already in use

An earlier Poster Studio container already exists. Start it with:

```bash
docker start poster-studio
```

### Port 3000 is already in use

Replace the first `3000` in `127.0.0.1:3000:3000` with another port. For example, use `127.0.0.1:3010:3000` and then open `http://localhost:3010`.

---

# Lokale Installation

Diese Anleitung erklärt, wie Poster Studio privat auf einem Windows-, macOS- oder Linux-Computer ausgeführt wird. Programmierkenntnisse sind nicht erforderlich.

Poster Studio läuft in einem kleinen Docker-Container und wird im normalen Webbrowser geöffnet. Mit dieser Anleitung wird die Anwendung nicht im Internet veröffentlicht, sondern bleibt auf deinem Computer. Das bereitgestellte Image unterstützt AMD-/Intel-Computer und ARM64-Geräte wie Macs mit Apple Silicon.

## 1. Docker installieren

Wähle die Anleitung für deinen Computer:

- **Windows:** Installiere [Docker Desktop für Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
- **macOS:** Installiere [Docker Desktop für Mac](https://docs.docker.com/desktop/setup/install/mac-install/).
- **Linux:** Installiere [Docker Engine](https://docs.docker.com/engine/install/) für deine Distribution.

Starte Docker nach der Installation und warte, bis angezeigt wird, dass die Docker Engine läuft.

## 2. Poster Studio starten

Öffne ein Befehlsfenster:

- **Windows:** Öffne PowerShell.
- **macOS:** Öffne Terminal unter **Programme → Dienstprogramme**.
- **Linux:** Öffne das verwendete Terminal.

Kopiere den folgenden vollständigen Befehl, füge ihn in das Befehlsfenster ein und drücke **Enter**:

```bash
docker run -d --name poster-studio --restart unless-stopped -p 127.0.0.1:3000:3000 -e APP_URL=http://localhost:3000 -e "MUSICBRAINZ_USER_AGENT=PosterStudio/1.0 (https://github.com/Pixzl1/poster-studio)" ghcr.io/pixzl1/poster-studio:latest
```

Docker lädt und startet Poster Studio automatisch. Der erste Start kann abhängig von der Internetverbindung einige Minuten dauern.

## 3. Poster Studio öffnen

Öffne diese Adresse in einem Webbrowser:

**[http://localhost:3000](http://localhost:3000)**

Durch die Einstellung `127.0.0.1` ist Poster Studio nur auf demselben Computer erreichbar.

## Bedienung im Alltag

Poster Studio startet automatisch, solange Docker läuft. Mit diesen Befehlen kann der Container auch manuell gesteuert werden:

```bash
# Poster Studio beenden
docker stop poster-studio

# Poster Studio erneut starten
docker start poster-studio
```

## Poster Studio aktualisieren

Führe diese Befehle nacheinander aus:

```bash
docker pull ghcr.io/pixzl1/poster-studio:latest
docker rm -f poster-studio
docker run -d --name poster-studio --restart unless-stopped -p 127.0.0.1:3000:3000 -e APP_URL=http://localhost:3000 -e "MUSICBRAINZ_USER_AGENT=PosterStudio/1.0 (https://github.com/Pixzl1/poster-studio)" ghcr.io/pixzl1/poster-studio:latest
```

Bilder werden nicht im Container gespeichert. Beim Ersetzen des Containers werden daher keine serverseitig gespeicherten Bilder gelöscht. Geöffnete Browser-Sitzungen sind bewusst nur temporär.

## Poster Studio deinstallieren

Die folgenden Befehle entfernen den Poster-Studio-Container und das heruntergeladene Image:

```bash
docker rm -f poster-studio
docker image rm ghcr.io/pixzl1/poster-studio:latest
```

Falls Docker anschließend nicht mehr benötigt wird, kann es über die normale App- oder Paketverwaltung des Betriebssystems entfernt werden.

## Problemlösung

### Der Browser meldet, dass die Seite nicht erreichbar ist

Prüfe, ob Docker läuft, und gib anschließend diesen Befehl ein:

```bash
docker start poster-studio
```

Warte einige Sekunden und lade [http://localhost:3000](http://localhost:3000) erneut.

### Der Containername wird bereits verwendet

Es existiert bereits ein Poster-Studio-Container. Starte ihn mit:

```bash
docker start poster-studio
```

### Port 3000 wird bereits verwendet

Ersetze den ersten Port in `127.0.0.1:3000:3000` durch einen anderen Port. Verwende beispielsweise `127.0.0.1:3010:3000` und öffne anschließend `http://localhost:3010`.
