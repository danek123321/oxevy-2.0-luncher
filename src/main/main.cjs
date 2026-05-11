const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { Client, Authenticator } = require('minecraft-launcher-core');
const fetch = require('node-fetch');

const projectRoot = path.resolve(__dirname, '../../../');
const gradlePropertiesPath = path.join(projectRoot, 'gradle.properties');
const distIndexPath = path.join(__dirname, '../../dist/index.html');
const configPath = path.join(app.getPath('userData'), 'launcher-config.json');
const defaultConfig = {
  minecraftVersion: '1.21.11',
  loaderVersion: '0.19.2',
  modName: 'Oxevy',
};

let gameProcess = null;

function getLauncherConfigPath() {
  return configPath;
}

function loadLauncherConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Failed to load launcher config:', error);
  }
  return {
    username: 'Player',
    memory: '4G',
    windowWidth: 960,
    windowHeight: 640,
    lastBuild: null,
  };
}

function saveLauncherConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save launcher config:', error);
    return false;
  }
}

function readGradleProperties() {
  if (!fs.existsSync(gradlePropertiesPath)) {
    return {};
  }

  return fs
    .readFileSync(gradlePropertiesPath, 'utf8')
    .split(/\r?\n/)
    .reduce((properties, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        return properties;
      }

      const separatorIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      properties[key] = value;
      return properties;
    }, {});
}

function getProjectConfig() {
  const properties = readGradleProperties();

  return {
    minecraftVersion: properties.minecraft_version || defaultConfig.minecraftVersion,
    loaderVersion: properties.loader_version || defaultConfig.loaderVersion,
    modName: properties.mod_name || defaultConfig.modName,
  };
}

function resolveModJar() {
  const buildLibs = path.join(projectRoot, 'build/libs');
  if (!fs.existsSync(buildLibs)) {
    return null;
  }

  const jars = fs
    .readdirSync(buildLibs)
    .filter((file) => file.endsWith('.jar') && !file.includes('-sources') && !file.includes('-dev'))
    .map((file) => path.join(buildLibs, file))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);

  return jars[0] || null;
}

function getGameRootDir() {
  return path.join(app.getPath('userData'), 'game');
}

function getLauncherConfig() {
  const projectConfig = getProjectConfig();
  const modJarPath = resolveModJar();

  return {
    ...projectConfig,
    modJarPath,
    modJarReady: Boolean(modJarPath),
    projectRoot,
    dataDirectory: getGameRootDir(),
    isRunning: Boolean(gameProcess && !gameProcess.killed),
  };
}

async function ensureFabricProfile(rootDir, minecraftVersion, loaderVersion) {
  const fabricVersion = `fabric-loader-${loaderVersion}-${minecraftVersion}`;
  const versionDirectory = path.join(rootDir, 'versions', fabricVersion);
  const versionJsonPath = path.join(versionDirectory, `${fabricVersion}.json`);

  if (fs.existsSync(versionJsonPath)) {
    return fabricVersion;
  }

  fs.mkdirSync(versionDirectory, { recursive: true });

  const response = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${minecraftVersion}/${loaderVersion}/profile/json`);
  if (!response.ok) {
    throw new Error(`Fabric metadata request failed with status ${response.status}.`);
  }

  const profileJson = await response.json();
  fs.writeFileSync(versionJsonPath, JSON.stringify(profileJson, null, 2));

  return fabricVersion;
}

async function deployModJar(modJarPath, modsDirectory, minecraftVersion, loaderVersion, rootDir) {
  if (!modJarPath) {
    throw new Error('No built mod jar found in build/libs. Run ./gradlew build first.');
  }

  fs.mkdirSync(modsDirectory, { recursive: true });
  fs.copyFileSync(modJarPath, path.join(modsDirectory, 'oxevy.jar'));

  const fabricApiPath = path.join(modsDirectory, 'fabric-api.jar');
  
  const fabricApiUrl = `https://cdn.modrinth.com/data/P7dR8mSH/versions/i5tSkVBH/fabric-api-0.141.3+1.21.11.jar`;
  
  try {
    console.log(`[launcher] Downloading Fabric API from: ${fabricApiUrl}`);
    const response = await fetch(fabricApiUrl);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(fabricApiPath, Buffer.from(buffer));
      console.log('[launcher] Fabric API installed successfully');
    } else {
      console.log(`[launcher] Failed to download Fabric API: ${response.status}`);
    }
  } catch (error) {
    console.log(`[launcher] Could not download Fabric API: ${error.message}`);
  }
}

function isValidZipArchive(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size <= 0) {
    return false;
  }

  const descriptorLength = Math.min(stat.size, 65557);
  const file = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(descriptorLength);
    fs.readSync(file, buffer, 0, descriptorLength, stat.size - descriptorLength);

    for (let index = buffer.length - 4; index >= 0; index -= 1) {
      if (
        buffer[index] === 0x50 &&
        buffer[index + 1] === 0x4b &&
        buffer[index + 2] === 0x05 &&
        buffer[index + 3] === 0x06
      ) {
        return true;
      }
    }

    return false;
  } finally {
    fs.closeSync(file);
  }
}

function walkFiles(rootDir, visitor) {
  if (!fs.existsSync(rootDir)) {
    return;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const resolved = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(resolved, visitor);
      continue;
    }

    visitor(resolved);
  }
}

function repairGameArchives(rootDir) {
  const candidateDirs = ['libraries', 'versions']
    .map((segment) => path.join(rootDir, segment))
    .filter((candidate) => fs.existsSync(candidate));

  const repaired = [];
  for (const candidateDir of candidateDirs) {
    walkFiles(candidateDir, (filePath) => {
      if (!filePath.endsWith('.jar')) {
        return;
      }

      try {
        if (!isValidZipArchive(filePath)) {
          fs.rmSync(filePath, { force: true });
          repaired.push(filePath);
        }
      } catch (error) {
        console.warn(`[launcher] Failed to inspect archive ${filePath}:`, error.message);
      }
    });
  }

  return repaired;
}

function sendToRenderer(webContents, channel, payload) {
  if (!webContents.isDestroyed()) {
    webContents.send(channel, payload);
  }
}

function createWindow() {
  const devServerArg = process.argv.find((argument) => argument.startsWith('--dev-server='));
  const devServerUrl = devServerArg ? devServerArg.replace('--dev-server=', '') : null;
  const win = new BrowserWindow({
    width: 960,
    height: 640,
    frame: false,
    resizable: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (!app.isPackaged) {
    if (devServerUrl) {
      win.loadURL(devServerUrl);
      return;
    }

    if (fs.existsSync(distIndexPath)) {
      win.loadFile(distIndexPath);
      return;
    }

    win.loadURL('http://127.0.0.1:3000');
    return;
  }

  win.loadFile(distIndexPath);
}

app.whenReady().then(createWindow);

const OXEVY_DOWNLOAD_URL = 'https://github.com/danek123321/oxevy-2.0/releases/download/BETA-0.5/oxevy-2.0-BETA-0.5.jar';
const MOD_FILENAME = 'oxevy.jar';

function isOxevyInstalled() {
  const projectConfig = getProjectConfig();
  const modJarPath = resolveModJar();
  return modJarPath !== null;
}

async function downloadOxevyMod(rootDir) {
  const modsDir = path.join(rootDir, 'mods');
  fs.mkdirSync(modsDir, { recursive: true });

  const modPath = path.join(modsDir, MOD_FILENAME);
  const response = await fetch(OXEVY_DOWNLOAD_URL);
  if (!response.ok) {
    throw new Error(`Failed to download Oxevy: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(modPath, Buffer.from(buffer));
  return modPath;
}

ipcMain.handle('get-launcher-config', async () => getLauncherConfig());
ipcMain.handle('check-installation', async () => getLauncherConfig());

ipcMain.handle('check-oxevy-installed', async () => {
  return { installed: isOxevyInstalled() };
});

ipcMain.handle('download-oxevy', async () => {
  try {
    const rootDir = getGameRootDir();
    const modPath = await downloadOxevyMod(rootDir);
    return { success: true, path: modPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-user-config', async () => loadLauncherConfig());

ipcMain.handle('save-user-config', async (event, config) => {
  const currentConfig = loadLauncherConfig();
  const updatedConfig = { ...currentConfig, ...config };
  return saveLauncherConfig(updatedConfig);
});

ipcMain.handle('launch-game', async (event, { username, memory }) => {
  if (gameProcess && !gameProcess.killed) {
    return { success: false, error: 'Minecraft is already running.' };
  }

  // Load username and memory from config if not provided
  const userConfig = loadLauncherConfig();
  const finalUsername = username || userConfig.username || 'Player';
  const finalMemory = memory || userConfig.memory || '4G';

  const rootDir = getGameRootDir();
  const modsDir = path.join(rootDir, 'mods');
  const projectConfig = getProjectConfig();
  const modJarPath = resolveModJar();

  try {
    sendToRenderer(event.sender, 'launch-state', { state: 'preparing' });

    // Create oxevy config directory with default files
    const oxevyDir = path.join(rootDir, 'oxevy');
    fs.mkdirSync(oxevyDir, { recursive: true });
    
    const defaultConfigFiles = {
      'commands.json': '[]',
      'modules.json': '{}',
      'friends.json': '[]'
    };
    
    for (const [filename, defaultContent] of Object.entries(defaultConfigFiles)) {
      const filePath = path.join(oxevyDir, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultContent);
        console.log(`[launcher] Created ${filename}`);
      }
    }

    await deployModJar(modJarPath, modsDir, projectConfig.minecraftVersion, projectConfig.loaderVersion, rootDir);
    const repairedArchives = repairGameArchives(rootDir);
    if (repairedArchives.length > 0) {
      console.log('[launcher] Removed invalid game archives:', repairedArchives);
      sendToRenderer(event.sender, 'launch-progress', {
        task: 0,
        total: 0,
        type: 'repair',
        repairedArchives,
      });
    }

    const fabricVersion = await ensureFabricProfile(
      rootDir,
      projectConfig.minecraftVersion,
      projectConfig.loaderVersion
    );

    const auth = await Authenticator.getAuth(String(finalUsername).trim() || 'Player');
    const launcher = new Client();

    launcher.on('progress', (payload) => sendToRenderer(event.sender, 'launch-progress', payload));
    launcher.on('debug', (message) => console.log('[DEBUG]', message));
    launcher.on('data', (message) => console.log('[DATA]', message));
    launcher.on('close', (code) => {
      gameProcess = null;
      sendToRenderer(event.sender, 'launch-state', { state: 'closed', code });
    });

    const launchedProcess = await launcher.launch({
      authorization: auth,
      root: rootDir,
      version: {
        number: projectConfig.minecraftVersion,
        type: 'release',
        custom: fabricVersion,
      },
      memory: { max: finalMemory, min: '2G' },
      overrides: { detached: false },
    });

    if (!launchedProcess) {
      throw new Error('Minecraft did not start. Confirm that Java 21 is installed and available on PATH.');
    }

    gameProcess = launchedProcess;
    sendToRenderer(event.sender, 'launch-state', { state: 'running' });

    return { success: true };
  } catch (error) {
    gameProcess = null;
    console.error('Launch failed:', error);
    sendToRenderer(event.sender, 'launch-state', { state: 'error', message: error.message });
    return { success: false, error: error.message };
  }
});

ipcMain.handle('force-stop', async () => {
  if (!gameProcess || gameProcess.killed) {
    return { success: false, error: 'Minecraft is not running.' };
  }

  gameProcess.kill('SIGTERM');
  return { success: true };
});

ipcMain.on('close-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.close();
  }
  app.quit();
});

app.on('will-quit', () => {
  app.exit(0);
});

ipcMain.on('minimize-window', () => BrowserWindow.getFocusedWindow()?.minimize());
