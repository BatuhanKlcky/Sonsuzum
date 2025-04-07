// kurtar.js - PixiJS v8.9.1 Tam Uyumlu Son Sürüm

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
        app = new PIXI.Application();
        await app.init({
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
        // Asset listesi (kendi dosya yollarınızı ekleyin)
        const assets = [
            { name: 'character', url: 'assets/images/character.png' },
            { name: 'forest_bg', url: 'assets/images/forest-bg.jpg' },
            { name: 'clue', url: 'assets/immages/clue.png' },
            { name: 'village_bg', url: 'assets/images/village-bg.jpg' },
            { name: 'chest', url: 'assets/images/chest.png' }
        ];

        // Assetleri teker teker yükle
        for (const asset of assets) {
            try {
                await PIXI.Assets.load(asset.url);
            } catch (err) {
                console.warn(`${asset.name} yüklenemedi:`, err);
            }
        }
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

// Kontrolleri ayarla
function setupControls() {
    const keys = {};
    
    window.addEventListener('keydown', (e) => keys[e.key] = true);
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    app.ticker.add(() => {
        if (!character) return;
        
        if (keys['ArrowLeft'] || keys['a']) character.x -= 5;
        if (keys['ArrowRight'] || keys['d']) character.x += 5;
        if (keys['ArrowUp'] || keys['w']) character.y -= 5;
        if (keys['ArrowDown'] || keys['s']) character.y += 5;
    });
}

/********************** SAHNE OLUŞTURMA (GÜNCELLENMİŞ PIXIJS v8 SÖZDİZİMİ) **********************/

// 1. ORMAN SAHNESİ
function createForestScene() {
    const scene = new PIXI.Container();

    // Arkaplan (v8 uyumlu)
    const bgTexture = PIXI.Texture.from('assets/forest-bg.jpg');
    const bg = new PIXI.Sprite(bgTexture);
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Karakter (v8 uyumlu)
    const charTexture = PIXI.Texture.from('assets/character.png');
    character = new PIXI.Sprite(charTexture);
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

    // Gizemli mesaj (v8 uyumlu)
    const message = new PIXI.Text({
        text: '"Onu geri istiyorsan, beni bul..."',
        style: {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 4 }
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
    const bgTexture = PIXI.Texture.from('assets/village-bg.jpg');
    const bg = new PIXI.Sprite(bgTexture);
    bg.width = app.screen.width;
    bg.height = app.screen.height;
    scene.addChild(bg);

    // Sandık
    const chestTexture = PIXI.Texture.from('assets/chest.png');
    const chest = new PIXI.Sprite(chestTexture);
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
    
    // Arkaplan (v8 uyumlu grafik)
    const bg = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x222222 });
    scene.addChild(bg);
    
    return scene;
}

// 4. KULE SAHNESİ
function createTowerScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x111122 });
    scene.addChild(bg);
    
    return scene;
}

/********************** OYUN MEKANİKLERİ **********************/

function createClue(x, y) {
    const clueTexture = PIXI.Texture.from('assets/clue.png');
    const clue = new PIXI.Sprite(clueTexture);
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

/********************** HATA YÖNETİMİ **********************/

function showErrorScreen() {
    const errorScreen = new PIXI.Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000 });
    
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
    }
};

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    initGame().catch(error => {
        console.error("Başlatma hatası:", error);
    });
});
