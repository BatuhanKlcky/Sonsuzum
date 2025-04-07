// kurtar.js - PixiJS v8.9.1 Uyumlu Tam Oyun Kodu

// Oyun durum değişkenleri
let app;
let character;
let currentScene;
const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0
};

// Ana oyun başlatma fonksiyonu (async olarak tanımlandı)
async function initGame() {
    try {
        // 1. PixiJS uygulamasını yeni v8.x.x formatında oluştur
        app = new PIXI.Application();
        await app.init({
            resizeTo: window,
            backgroundColor: 0x0d1c2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });

        // 2. Canvas'ı gameContainer'a ekle (yeni .canvas property)
        document.getElementById('gameContainer').appendChild(app.canvas);

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
        console.error("Oyun başlatılırken hata oluştu:", error);
        showErrorScreen();
    }
}

// Asset yükleme fonksiyonu
async function loadAssets() {
    try {
        await PIXI.Assets.init({ manifest: {
            bundles: [
                {
                    name: "main",
                    assets: [
                        { alias: "character", src: "assets/character.png" },
                        { alias: "forest_bg", src: "assets/forest-bg.jpg" },
                        { alias: "clue", src: "assets/clue.png" },
                        { alias: "village_bg", src: "assets/village-bg.jpg" },
                        { alias: "chest", src: "assets/chest.png" }
                    ]
                }
            ]
        }});

        await PIXI.Assets.loadBundle("main");
        
    } catch (error) {
        console.error("Asset yükleme hatası:", error);
        // Placeholder assetler oluştur
        createPlaceholderAssets();
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
    
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        // Mobil menüyü gizle
        if (e.key === 'Escape') document.getElementById('gameMenu').style.display = 'none';
    });
    
    window.addEventListener('keyup', (e) => keys[e.key] = false);

    // Oyun döngüsü
    app.ticker.add(() => {
        if (!character) return;
        
        // Hareket kontrolü
        if (keys['ArrowLeft'] || keys['a']) character.x -= 5;
        if (keys['ArrowRight'] || keys['d']) character.x += 5;
        if (keys['ArrowUp'] || keys['w']) character.y -= 5;
        if (keys['ArrowDown'] || keys['s']) character.y += 5;
        
        // Sınır kontrolü
        character.x = Math.max(30, Math.min(character.x, app.screen.width - 30));
        character.y = Math.max(30, Math.min(character.y, app.screen.height - 30));
    });
}

/********************** SAHNE OLUŞTURMA FONKSİYONLARI **********************/

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
    const chest = PIXI.Sprite.from('chest');
    chest.anchor.set(0.5);
    chest.position.set(500, 400);
    chest.interactive = true;
    chest.cursor = 'pointer';
    chest.on('pointerdown', openChest);
    scene.addChild(chest);

    return scene;
}

// 3. ZAMAN LABİRENTİ (Basit implementasyon)
function createMazeScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Graphics()
        .beginFill(0x222222)
        .drawRect(0, 0, app.screen.width, app.screen.height);
    scene.addChild(bg);
    
    // Labirent tasarımı buraya gelecek
    // ...
    
    return scene;
}

// 4. KULE SAHNESİ (Basit implementasyon)
function createTowerScene() {
    const scene = new PIXI.Container();
    
    // Arkaplan
    const bg = new PIXI.Graphics()
        .beginFill(0x111122)
        .drawRect(0, 0, app.screen.width, app.screen.height);
    scene.addChild(bg);
    
    // Final sahnesi tasarımı buraya gelecek
    // ...
    
    return scene;
}

/********************** OYUN MEKANİKLERİ **********************/

function createClue(x, y) {
    const clue = PIXI.Sprite.from('clue');
    clue.anchor.set(0.5);
    clue.position.set(x, y);
    clue.interactive = true;
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
    const msg = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: app.screen.width - 100
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

/********************** YARDIMCI FONKSİYONLAR **********************/

function createPlaceholderAssets() {
    // Karakter için placeholder
    character = new PIXI.Graphics()
        .beginFill(0xFF69B4)
        .drawCircle(0, 0, 30)
        .endFill();
    character.position.set(100, app.screen.height / 2);
    app.stage.addChild(character);
}

function showErrorScreen() {
    const errorScreen = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(0, 0, app.screen.width, app.screen.height)
        .endFill();
    
    const errorText = new PIXI.Text('Oyun yüklenirken hata oluştu!\nLütfen sayfayı yenileyin.', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xff0000,
        align: 'center'
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
    } else {
        console.error("Sahne bulunamadı:", sceneName);
    }
};

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    initGame().catch(error => {
        console.error("Başlatma hatası:", error);
    });
});
