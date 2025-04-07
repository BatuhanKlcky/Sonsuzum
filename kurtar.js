// game.js - Romantik Macera Oyunu
document.addEventListener('DOMContentLoaded', () => {
    // 1. PIXI UYGULAMASINI BAŞLAT
    const app = new PIXI.Application({
        width: 1024,
        height: 768,
        backgroundColor: 0x0d1c2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1
    });
    document.body.appendChild(app.view);

    // 2. OYUN DEĞİŞKENLERİ
    let currentScene = 'forest';
    let character, clues = [];
    const scenes = {};
    const keys = {};

    // 3. ASSET YÜKLEME
    async function loadAssets() {
        try {
            // Gerçek assetlerinizle değiştirin
            await PIXI.Assets.load([
                { alias: 'character', src: 'assets/images/cd7b9c21-0d30-4b66-8856-6347c6d2e50b.png' },
                { alias: 'forest_bg', src: 'assets/images/forest-bg.jpg' },
                { alias: 'clue', src: 'assets/clue.png' }
            ]);
            initGame();
        } catch (err) {
            console.error("Asset yükleme hatası:", err);
            // Placeholder grafiklerle devam et
            createPlaceholderAssets();
        }
    }

    // 4. SAHNE OLUŞTURMA - ORMAN (1. Sahne)
    function createForestScene() {
        const scene = new PIXI.Container();
        
        // Arkaplan
        const bg = PIXI.Sprite.from('forest_bg');
        bg.width = app.screen.width;
        bg.height = app.screen.height;
        scene.addChild(bg);

        // Sis efekti
        const fog = new PIXI.Graphics();
        fog.beginFill(0xaaaaaa, 0.4);
        fog.drawRect(0, 0, app.screen.width, app.screen.height);
        scene.addChild(fog);

        // Karakter
        character = PIXI.Sprite.from('character');
        character.anchor.set(0.5);
        character.x = 200;
        character.y = app.screen.height / 2;
        character.scale.set(0.8);
        scene.addChild(character);

        // İzler (3 adet)
        for (let i = 0; i < 3; i++) {
            const clue = PIXI.Sprite.from('clue');
            clue.anchor.set(0.5);
            clue.x = 400 + i * 150;
            clue.y = 300 + Math.sin(i) * 100;
            clue.interactive = true;
            clue.on('pointerdown', () => collectClue(clue));
            scene.addChild(clue);
            clues.push(clue);
        }

        // Gizemli mesaj
        const message = new PIXI.Text('"Onu geri istiyorsan, beni bul..."', {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xf8f8f8,
            stroke: 0x0a0a0a,
            strokeThickness: 4
        });
        message.position.set(50, 50);
        scene.addChild(message);

        return scene;
    }

    // 5. OYUN MEKANİKLERİ
    function collectClue(clue) {
        clue.visible = false;
        clues = clues.filter(c => c !== clue);
        
        if (clues.length === 0) {
            const victoryText = new PIXI.Text('Tüm izleri topladın!', {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0x4fe34f
            });
            victoryText.anchor.set(0.5);
            victoryText.position.set(app.screen.width / 2, 100);
            app.stage.addChild(victoryText);
            
            // 3 saniye sonra mesajı kaldır
            setTimeout(() => app.stage.removeChild(victoryText), 3000);
        }
    }

    // 6. KONTROLLER
    function setupControls() {
        window.addEventListener('keydown', (e) => keys[e.key] = true);
        window.addEventListener('keyup', (e) => keys[e.key] = false);
        
        app.ticker.add(() => {
            if (!character) return;
            
            if (keys['ArrowLeft'] || keys['a']) character.x -= 5;
            if (keys['ArrowRight'] || keys['d']) character.x += 5;
            if (keys['ArrowUp'] || keys['w']) character.y -= 5;
            if (keys['ArrowDown'] || keys['s']) character.y += 5;
            
            // Sınır kontrolü
            character.x = Math.max(50, Math.min(character.x, app.screen.width - 50));
            character.y = Math.max(50, Math.min(character.y, app.screen.height - 50));
        });
    }

    // 7. PLACEHOLDER ASSETLER (Opsiyonel)
    function createPlaceholderAssets() {
        // Kırmızı kare karakter
        character = new PIXI.Graphics();
        character.beginFill(0xff3333);
        character.drawRect(0, 0, 50, 50);
        character.endFill();
        character.position.set(200, 400);
        app.stage.addChild(character);
        
        // Yeşil daire ipuçları
        for (let i = 0; i < 3; i++) {
            const clue = new PIXI.Graphics();
            clue.beginFill(0x33ff33);
            clue.drawCircle(0, 0, 20);
            clue.endFill();
            clue.x = 400 + i * 150;
            clue.y = 300 + Math.sin(i) * 100;
            clue.interactive = true;
            clue.on('pointerdown', () => collectClue(clue));
            app.stage.addChild(clue);
            clues.push(clue);
        }
    }

    // 8. OYUNU BAŞLAT
    function initGame() {
        scenes.forest = createForestScene();
        app.stage.addChild(scenes.forest);
        setupControls();
        
        // Debug bilgisi
        console.log('Oyun başlatıldı!');
    }

    // 9. ASSET YÜKLEMEYİ BAŞLAT
    loadAssets();
});
