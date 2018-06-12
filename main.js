const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main-window.html'),
        protocol: 'file',
        slashes: true,
    }));

    mainWindow.on('closed', function(){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

//handlers

function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping Item',
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'add-window.html'),
        protocol: 'file',
        slashes: true,
    }));

    //garbage collection
    addWindow.on("close", () => {
        addWindow = null;
    });
}

//item add
ipcMain.on('item.add', function(e, item) {
    mainWindow.webContents.send('item.add', item);
    addWindow.close();
});

//maenu

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item.clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 
                            'Command+Q' :
                            'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ],
    }
];

//if mac
if(process.platform == "darwin") {
    mainMenuTemplate.unshift({});
}

//dev tools
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu: [
            {
                label: 'Toggle devtools',
                accelerator: process.platform == 'darwin' ? 
                            'Command+A' :
                            'Ctrl+A',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
};