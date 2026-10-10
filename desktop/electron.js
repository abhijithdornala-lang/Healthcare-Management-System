
const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const APP_URL = "http://localhost:8080/";
let mainWindow;
let backendProcess = null;
let startedBackend = false;
let quitting = false;

function isServerReady() {
    return new Promise((resolve) => {
        const request = http.get(APP_URL, (response) => {
            response.resume();
            resolve(true);
        });

        request.setTimeout(1500, () => {
            request.destroy();
            resolve(false);
        });

        request.on("error", () => resolve(false));
    });
}

async function waitForServer(timeoutMs) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        if (await isServerReady()) return true;
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
}

function getBackendJar() {
    if (app.isPackaged) {
        return path.join(
            process.resourcesPath,
            "backend",
            "healthcare-management-system-1.0.0.jar"
        );
    }

    return path.join(
        __dirname,
        "..",
        "backend",
        "target",
        "healthcare-management-system-1.0.0.jar"
    );
}

function startBackend() {
    const jarPath = getBackendJar();

    backendProcess = spawn("java", ["-jar", jarPath], {
        windowsHide: true,
        stdio: "ignore"
    });

    startedBackend = true;

    backendProcess.on("error", (error) => {
        console.error("Could not start Java backend:", error.message);
    });

    backendProcess.on("exit", (code) => {
        console.log("Java backend exited with code:", code);
        backendProcess = null;
    });
}

async function createWindow() {
    // Reuse a server that is already running, if available.
    if (!(await waitForServer(2000))) {
        startBackend();

        const ready = await waitForServer(60000);

        if (!ready) {
            dialog.showErrorBox(
                "Healthcare Management System",
                "The Java backend did not start.\n\nCheck that Java and MySQL are installed and that port 8080 is available."
            );

            app.quit();
            return;
        }
    }

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: "Healthcare Management System",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadURL(APP_URL);
}

app.whenReady().then(createWindow);

app.on("before-quit", () => {
    quitting = true;

    if (startedBackend && backendProcess) {
        backendProcess.kill();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && !quitting) {
        createWindow();
    }
});