// kurtar.js - Dinamik Haritalı Güncel Sürüm

// 1. GEREKLİ ARAÇLAR
const SimplexNoise = class {
    constructor() { /* Gürültü fonksiyonu implementasyonu */ }
    noise2D(x, y) { /* Perlin gürültü hesabı */ }
};

// 2. ANA OYUN DEĞİŞKENLERİ
let app, character, dynamicMap;
const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0,
    exploredTiles: []
};

// 3. DİNAMİK HARİTA SINIFI (Yeni eklenen)
class DynamicMap {
    constructor() {
        this.container = new PIXI.Container();
        this.gridSize = 64;
        this.mapWidth = 25;
        this.mapHeight = 15;
        this.tileTypes = {
            ground: { color: 0x6a8c5e, walkable: true },
            water: { color: 0x4a8bb5, walkable: false },
            obstacle: { color: 0x5a4a3a, walkable: false }
        };
        this.generateMap();
    }

    generateMap() {
        const noise = new SimplexNoise();
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const value = noise.noise2D(x/8, y/8);
                const tileType = value > 0.2 ? 'ground' : 
                                value > -0.3 ? 'water' : 'obstacle';
                this.createTile(x, y, tileType);
            }
        }
        this.addDecorations();
    }

    createTile(x, y, type) {
        const tile = new PIXI.Graphics()
            .rect(0, 0, this.gridSize, this.gridSize)
            .fill(this.tileTypes[type].color);
        
        tile.position.set(x * this.gridSize, y * this.gridSize);
        tile.interactive = true;
        tile.on('pointerdown', () => this.handleTileClick(x, y, type));
        this.container.addChild(tile);
    }

    addDecorations() {
        // ... dekorasyon ekleme kodu ...
    }

    handleTileClick(x, y, type) {
        if (!this.tileTypes[type].walkable) {
            showMessage("Bu alana gidilemez!");
        } else {
            character.targetPosition = { x: x * this.gridSize + this.gridSize/2, 
                                       y: y * this.gridSize + this.gridSize/2 };
        }
    }
}

// 4. OYUN BAŞLATMA
async function initGame() {
    app = new PIXI.Application();
    await app.init({ resizeTo: window, background: 0x0d1c2e });
    
    document.getElementById('gameContainer').appendChild(app.canvas);
    
    // Dinamik harita oluştur
    dynamicMap = new DynamicMap();
    app.stage.addChild(dynamicMap.container);
    
    // Karakter oluştur
    character = new PIXI.Sprite(PIXI.Texture.WHITE);
    character.tint = 0xff0000;
    character.anchor.set(0.5);
    character.width = character.height = 30;
    character.position.set(400, 300);
    dynamicMap.container.addChild(character);
    
    // Kontrolleri ayarla
    setupControls();
}

// 5. KONTROL SİSTEMİ (Güncellendi)
function setupControls() {
    const keys = {};
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);
    
    app.ticker.add(() => {
        // Hareket mantığı
        const speed = 3;
        if (keys.ArrowUp) character.y -= speed;
        if (keys.ArrowDown) character.y += speed;
        if (keys.ArrowLeft) character.x -= speed;
        if (keys.ArrowRight) character.x += speed;
        
        // Harita sınır kontrolü
        character.x = Math.max(30, Math.min(dynamicMap.mapWidth * dynamicMap.gridSize - 30, character.x));
        character.y = Math.max(30, Math.min(dynamicMap.mapHeight * dynamicMap.gridSize - 30, character.y));
        
        // Keşif kontrolü
        checkExploration();
    });
}

// 6. KEŞİF MEKANİĞİ
function checkExploration() {
    const tileX = Math.floor(character.x / dynamicMap.gridSize);
    const tileY = Math.floor(character.y / dynamicMap.gridSize);
    const tileId = `${tileX},${tileY}`;
    
    if (!gameState.exploredTiles.includes(tileId)) {
        gameState.exploredTiles.push(tileId);
        if (Math.random() > 0.7) spawnClue(tileX, tileY);
    }
}

// 7. DİĞER FONKSİYONLAR (showMessage, changeScene vb.) aynı kalacak

// Oyunu başlat
window.addEventListener('DOMContentLoaded', initGame);
