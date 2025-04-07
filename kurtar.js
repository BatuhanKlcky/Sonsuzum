// kurtar.js - PixiJS v8.9.1 Tam Uyumlu Son Sürüm (DÜZENLENMİŞ)

// Oyun değişkenleri
let app;
let character;
let scenes = {};
let currentScene;
const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0
};

// Ana oyun başlatma fonksiyonu
async function initGame() {
    try {
        // 1. PixiJS uygulamasını yeni v8 formatında oluştur
        app = new PIXI.Application({
            resizeTo: window,
            background: 0x0d1c2e,
            antialias: true
        });

        // 2. Canvas'ı gameContainer'a ekle
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) throw new Error("gameContainer bulunamadı!");
        gameContainer.appendChild(app.canvas);

        // 3. Assetleri yükle
        await loadAssets();

        // 4. Tüm sahneleri oluştur
        createScenes();

        // 5. İlk sahneyi yükle
        changeScene('forest');

        // 6. Kontrolleri ayarla
        setupControls();

        console.log("Oyun başarıyla başlatıldı!");

    } catch (error) {
        console.error("Oyun başlatma hatası:", error);
        showErrorScreen();
    }
}

// Asset yükleme fonksiyonu (düzeltilmiş)
async function loadAssets() {
    try {
        // Asset listesi (örnek URL'ler - gerçek dosya yollarınızla değiştirin)
        const assets = [
            { alias: 'character', src: 'assets/images/character.png' },
            { alias: 'forest_bg', src: 'assets/images/forest-bg.jpg' },
            { alias: 'clue', src: 'assets/images/clue.png' },
            { alias: 'village_bg', src: 'assets/images/village-bg.jpg' },
            { alias: 'chest', src: 'assets/images/chest.png' }
        ];

        // Assetleri PIXI.Assets ile yükle
        await PIXI.Assets.load(assets);
        
    } catch (error) {
        console.error("Asset yükleme hatası:", error);
        throw error;
    }
}

// Tüm sahneleri oluştur
function createScenes() {
    scenes = {
        forest: createForestScene(),
        village: createVillageScene(),
        maze: createMazeScene(),
        tower: createTowerScene()
    };
}

// Kontrolleri ayarla (optimize edilmiş)
function setupControls() {
    const keys = {};
    const speed = 5;
    
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    app.ticker.add(() => {
        if (!character) return;
        
        // Hareket kontrolü
        const moveX = (keys['ArrowLeft'] || keys['a'] ? -1 : 0) + (keys['ArrowRight'] || keys['d'] ? 1 : 0);
        const moveY = (keys['ArrowUp'] || keys['w'] ? -1 : 0) + (keys['ArrowDown'] || keys['s'] ? 1 : 0);
        
        character.x += moveX * speed;
        character.y += moveY * speed;
        
        // Ekran sınır kontrolü
        character.x = Math.max(0, Math.min(app.screen.width, character.x));
        character.y = Math.max(0, Math.min(app.screen.height, character.y));
    });
}

/********************** SAHNE OLUŞTURMA (GÜNCELLENMİŞ) **********************/

// 1. ORMAN SAHNESİ
function createForestScene() {
    const scene = new PIXI.Container();

    // Arkaplan
    const bg = new PIXI.Sprite(PIXI.Assets.get('forest_bg'));
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Karakter
    character = new PIXI.Sprite(PIXI.Assets.get('character'));
    character.anchor.set(0.5);
    character.position.set(100, app.screen.height / 2);
    character.scale.set(0.8);
    scene.addChild(character);

    // İzler (3 adet)
    for (let i = 0; i < 3; i++) {
        const clue = createClue(
            400 + i * 150,
            300 + (i % 2 === 0 ? -50 : 50)
        );
        scene.addChild(clue);
    }

    // Gizemli mesaj
    const message = new PIXI.Text({
        text: '"Onu geri istiyorsan, beni bul..."',
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4
        }
    });
    message.position.set(50, 50);
    scene.addChild(message);

    return scene;
}

// 2. KÖY SAHNESİ
function createVillageScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Sprite(PIXI.Assets.get('village_bg'));
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Sandık
    const chest = new PIXI.Sprite(PIXI.Assets.get('chest'));
    chest.anchor.set(0.5);
    chest.position.set(500, 400);
    chest.eventMode = 'static';
    chest.cursor = 'pointer';
    chest.on('pointerdown', openChest);
    scene.addChild(chest);

    return scene;
}

// 3. ZAMAN LABİRENTİ
function createMazeScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill(0x222222);
    scene.addChild(bg);
    
    // Labirent duvarları (örnek)
    const mazeWall = new PIXI.Graphics()
        .rect(100, 100, 200, 20)
        .fill(0x555555);
    scene.addChild(mazeWall);
    
    return scene;
}

// 4. KULE SAHNESİ
function createTowerScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill(0x111122);
    scene.addChild(bg);
    
    // Kule (örnek)
    const tower = new PIXI.Graphics()
        .rect(app.screen.width/2 - 50, 150, 100, 300)
        .fill(0x654321);
    scene.addChild(tower);
    
    return scene;
}

/********************** OYUN MEKANİKLERİ **********************/

function createClue(x, y) {
    const clue = new PIXI.Sprite(PIXI.Assets.get('clue'));
    clue.anchor.set(0.5);
    clue.position.set(x, y);
    clue.eventMode = 'static';
    clue.cursor = 'pointer';
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
    const msg = new PIXI.Text({
        text,
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: app.screen.width - 100
        }
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

/********************** HATA YÖNETİMİi **********************/

function showErrorScreen() {
    const errorScreen = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill(0x000000);
    
    const errorText = new PIXI.Text({
        text: 'Oyun yüklenirken hata oluştu!\nLütfen sayfayı yenileyin.',
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xff0000,
            align: 'center'
        }
    });
    errorText.anchor.set(0.5);
    errorText.position.set(app.screen.width / 2, app.screen.height / 2);
    
    errorScreen.addChild(errorText);
    app.stage.addChild(errorScreen);
}

// Global sahne değiştirme fonksiyonu
window.changeScene = function(sceneName) {
    if (scenes[sceneName]) {
        if (currentScene) app.stage.removeChild(currentScene);
        currentScene = scenes[sceneName];
        app.stage.addChild(currentScene);
        
        // Karakteri yeni sahneye taşı
        if (character && !currentScene.children.includes(character)) {
            currentScene.addChild(character);
        }
    }
};

// Oyunu başlat
window.addEventListener('DOMContentLoaded', initGame);
