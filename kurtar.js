// Oyun Başlatıcı ve Yükleyici
let app, player, tileMap = [], tileSize = 32;
const mapWidth = 30, mapHeight = 20;
let keys = {};

const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0,
    currentScene: 'forest',
    scenes: {}
};

window.addEventListener('DOMContentLoaded', async () => {
    app = new PIXI.Application();
    await app.init({ width: tileSize * mapWidth, height: tileSize * mapHeight, background: '#1d1f2b' });
    document.body.appendChild(app.canvas);
    await loadAssets();
    setupMap();
    createPlayer();
    setupControls();
    setupGameLoop();
});

// Asset Yükleme
async function loadAssets() {
    await PIXI.Assets.init({
        manifest: {
            bundles: [{
                name: 'main',
                assets: [
                    { alias: 'character', src: 'assets/images/character.png' },
                    { alias: 'chest', src: 'assets/images/chest.png' },
                    { alias: 'clue', src: 'assets/images/clue.png' },
                    { alias: 'key', src: 'assets/images/key.png' },
                    { alias: 'tile_grass', src: 'assets/tiles/grass.png' },
                    { alias: 'tile_stone', src: 'assets/tiles/stone.png' },
                    { alias: 'tile_door', src: 'assets/tiles/door.png' }
                ]
            }]
        }
    });
    await PIXI.Assets.loadBundle('main');
}

// Harita Oluşturma
function setupMap() {
    for (let y = 0; y < mapHeight; y++) {
        tileMap[y] = [];
        for (let x = 0; x < mapWidth; x++) {
            const tileSprite = new PIXI.Sprite(PIXI.Assets.get('tile_grass'));
            tileSprite.x = x * tileSize;
            tileSprite.y = y * tileSize;
            tileSprite.width = tileSize;
            tileSprite.height = tileSize;
            tileMap[y][x] = tileSprite;
            app.stage.addChild(tileSprite);
        }
    }

    // Örnek engel & ipuçları
    const stone = new PIXI.Sprite(PIXI.Assets.get('tile_stone'));
    stone.x = 10 * tileSize;
    stone.y = 10 * tileSize;
    stone.width = tileSize;
    stone.height = tileSize;
    app.stage.addChild(stone);

    const clue = new PIXI.Sprite(PIXI.Assets.get('clue'));
    clue.x = 5 * tileSize;
    clue.y = 5 * tileSize;
    clue.width = tileSize;
    clue.height = tileSize;
    clue.eventMode = 'static';
    clue.cursor = 'pointer';
    clue.on('pointerdown', () => {
        clue.visible = false;
        gameState.collectedClues++;
        showMessage("Bir ipucu buldun! Toplam: " + gameState.collectedClues);
    });
    app.stage.addChild(clue);
}

// Karakter Oluşturma
function createPlayer() {
    player = new PIXI.Sprite(PIXI.Assets.get('character'));
    player.x = 2 * tileSize;
    player.y = 2 * tileSize;
    player.width = tileSize;
    player.height = tileSize;
    app.stage.addChild(player);
}

// Kontroller
function setupControls() {
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);
}

// Oyun Döngüsü
function setupGameLoop() {
    const speed = 2;
    app.ticker.add(() => {
        let dx = 0, dy = 0;
        if (keys['ArrowLeft'] || keys['a']) dx = -speed;
        if (keys['ArrowRight'] || keys['d']) dx = speed;
        if (keys['ArrowUp'] || keys['w']) dy = -speed;
        if (keys['ArrowDown'] || keys['s']) dy = speed;

        const newX = player.x + dx;
        const newY = player.y + dy;

        const tile = getTileAt(newX, newY);
        if (tile) {
            player.x = newX;
            player.y = newY;
        }
    });
}

// Harita İçinde Koordinat Kontrolü
function getTileAt(x, y) {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    if (row < 0 || col < 0 || row >= mapHeight || col >= mapWidth) return null;
    return tileMap[row][col];
}

// Mesaj Gösterici
function showMessage(text) {
    const msg = new PIXI.Text(text, {
        fontSize: 18,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 4
    });
    msg.x = 10;
    msg.y = 10;
    app.stage.addChild(msg);
    setTimeout(() => app.stage.removeChild(msg), 3000);
}
