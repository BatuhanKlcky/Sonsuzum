// kurtar.js - Romantik Macera Oyunu
let app;
let character;
let currentScene;
const scenes = {};
const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0
};

// Oyunu Başlat
function initGame() {
    app = new PIXI.Application({
        view: document.getElementById('gameContainer'),
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        antialias: true
    });

    // Assetleri yükle
    loadAssets().then(() => {
        createScenes();
        changeScene('forest');
        setupControls();
    });

    // Yeniden boyutlandırma
    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });
}

// Asset Yükleme
async function loadAssets() {
    // Gerçek assetlerinizi buraya ekleyin
    await PIXI.Assets.load([
        { alias: 'character', src: 'assets/character.png' },
        { alias: 'forest_bg', src: 'assets/forest-bg.jpg' },
        { alias: 'clue', src: 'assets/clue.png' },
        { alias: 'village_bg', src: 'assets/village-bg.jpg' }
    ]);
}

// Tüm sahneleri oluştur
function createScenes() {
    scenes.forest = createForestScene();
    scenes.village = createVillageScene();
    scenes.maze = createMazeScene();
    scenes.tower = createTowerScene();
}

// Kontrolleri ayarla
function setupControls() {
    const keys = {};
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    app.ticker.add(() => {
        if (!character) return;

        // Hareket kontrolü
        if (keys['ArrowLeft'] || keys['a']) character.x -= 5;
        if (keys['ArrowRight'] || keys['d']) character.x += 5;
        if (keys['ArrowUp'] || keys['w']) character.y -= 5;
        if (keys['ArrowDown'] || keys['s']) character.y += 5;
    });
}

// Sahne değiştirme
function changeScene(sceneName) {
    if (currentScene) app.stage.removeChild(currentScene);
    currentScene = scenes[sceneName];
    app.stage.addChild(currentScene);
}

/********************** SAHNELER **********************/

// 1. ORMAN SAHNESİ
function createForestScene() {
    const scene = new PIXI.Container();

    // Arkaplan
    const bg = PIXI.Sprite.from('forest_bg');
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Karakter
    character = PIXI.Sprite.from('character');
    character.anchor.set(0.5);
    character.x = 100;
    character.y = app.screen.height / 2;
    scene.addChild(character);

    // İzler (3 adet)
    for (let i = 0; i < 3; i++) {
        const clue = createClue(400 + i * 150, 300 + (i % 2 === 0 ? -50 : 50));
        scene.addChild(clue);
    }

    // Gizemli mesaj
    const message = new PIXI.Text('"Onu geri istiyorsan, beni bul..."', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 4
    });
    message.position.set(50, 50);
    scene.addChild(message);

    return scene;
}

// 2. KÖY SAHNESİ
function createVillageScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = PIXI.Sprite.from('village_bg');
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Sandık
    const chest = new PIXI.Graphics()
        .beginFill(0x8B4513)
        .drawRect(0, 0, 80, 60);
    chest.position.set(500, 400);
    chest.interactive = true;
    chest.on('pointerdown', openChest);
    scene.addChild(chest);

    return scene;
}

// 3. ZAMAN LABİRENTİ
function createMazeScene() {
    const scene = new PIXI.Container();
    // Labirent kodu buraya...
    return scene;
}

// 4. KULE SAHNESİ
function createTowerScene() {
    const scene = new PIXI.Container();
    // Kule kodu buraya...
    return scene;
}

/********************** OYUN MEKANİKLERİ **********************/

function createClue(x, y) {
    const clue = PIXI.Sprite.from('clue');
    clue.anchor.set(0.5);
    clue.position.set(x, y);
    clue.interactive = true;
    clue.on('pointerdown', () => collectClue(clue));
    return clue;
}

function collectClue(clue) {
    clue.visible = false;
    gameState.collectedClues++;
    
    if (gameState.collectedClues === 3) {
        showMessage('Tüm izleri topladın! Köye gitmelisin...', () => {
            changeScene('village');
        });
    }
}

function openChest() {
    if (gameState.collectedClues >= 3) {
        gameState.hasKey = true;
        showMessage('Bir anahtar buldun! Zaman labirentine git...', () => {
            changeScene('maze');
        });
    } else {
        showMessage('Daha fazla ipucuna ihtiyacım var...');
    }
}

function showMessage(text, callback) {
    const msg = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center'
    });
    msg.anchor.set(0.5);
    msg.position.set(app.screen.width / 2, 100);
    app.stage.addChild(msg);
    
    if (callback) {
        setTimeout(() => {
            app.stage.removeChild(msg);
            callback();
        }, 3000);
    }
}

/********************** SONLAR **********************/

function showGoodEnding() {
    const ending = new PIXI.Container();
    
    const bg = new PIXI.Graphics()
        .beginFill(0x4a4a8a)
        .drawRect(0, 0, app.screen.width, app.screen.height);
    ending.addChild(bg);
    
    const text = new PIXI.Text('"Hiçbir lanet, kalbimin sana olan bağlılığını silemez."', {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: app.screen.width - 100
    });
    text.anchor.set(0.5);
    text.position.set(app.screen.width / 2, app.screen.height / 2);
    ending.addChild(text);
    
    app.stage.addChild(ending);
}

function showBadEnding() {
    // Kötü son için benzer implementasyon
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', initGame);
