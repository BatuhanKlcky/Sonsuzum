// GENİŞLETİLMİŞ OYUN MEKANİKLERİ
const gameState = {
    collectedClues: 0,
    hasKey: false,
    memoriesFound: 0,
    currentObjective: "Ormanı keşfet ve gizemli ipuçlarını bul",
    gameStartTime: Date.now(),
    exploredAreas: [],
    puzzleProgress: {},
    inventory: []
};

// KARAKTER KONTROLLERİ (Detaylandırılmış)
function setupControls() {
    const keys = {};
    const speed = 3.5; // Daha yavaş hareket
    let isRunning = false;
    
    // Kontrol tuşları
    const controlKeys = {
        left: ['ArrowLeft', 'a'],
        right: ['ArrowRight', 'd'],
        up: ['ArrowUp', 'w'],
        down: ['ArrowDown', 's'],
        run: ['Shift'],
        interact: ['e', ' ']
    };

    window.addEventListener('keydown', (e) => {
        if (controlKeys.run.includes(e.key)) isRunning = true;
        controlKeys.left.includes(e.key) && (keys.left = true);
        controlKeys.right.includes(e.key) && (keys.right = true);
        controlKeys.up.includes(e.key) && (keys.up = true);
        controlKeys.down.includes(e.key) && (keys.down = true);
        
        // Etkileşim tuşu
        if (controlKeys.interact.includes(e.key)) checkInteractions();
    });

    window.addEventListener('keyup', (e) => {
        if (controlKeys.run.includes(e.key)) isRunning = false;
        controlKeys.left.includes(e.key) && (keys.left = false);
        controlKeys.right.includes(e.key) && (keys.right = false);
        controlKeys.up.includes(e.key) && (keys.up = false);
        controlKeys.down.includes(e.key) && (keys.down = false);
    });

    app.ticker.add(() => {
        if (!character) return;
        
        const currentSpeed = isRunning ? speed * 1.8 : speed;
        const moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
        const moveY = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
        
        // Çapraz hareket için normalizasyon
        const diagonalMultiplier = (moveX !== 0 && moveY !== 0) ? 0.7 : 1;
        
        character.x += moveX * currentSpeed * diagonalMultiplier;
        character.y += moveY * currentSpeed * diagonalMultiplier;
        
        // Sınır kontrolü
        character.x = Math.max(50, Math.min(app.screen.width - 50, character.x));
        character.y = Math.max(50, Math.min(app.screen.height - 100, character.y));
        
        // Keşif alanı kontrolü
        checkExploration();
    });
}

// KEŞİF MEKANİĞİ (Yeni eklenen)
function checkExploration() {
    if (!currentScene || !character) return;
    
    const explorationZones = {
        forest: [
            {x: 300, y: 200, radius: 120, id: 'forest1'},
            {x: 500, y: 350, radius: 100, id: 'forest2'},
            {x: 700, y: 250, radius: 150, id: 'forest3'}
        ],
        village: [
            {x: 400, y: 300, radius: 80, id: 'village1'},
            {x: 600, y: 400, radius: 90, id: 'village2'}
        ]
    };
    
    const currentZones = explorationZones[currentScene.name] || [];
    
    currentZones.forEach(zone => {
        const distance = Math.sqrt(
            Math.pow(character.x - zone.x, 2) + 
            Math.pow(character.y - zone.y, 2)
        );
        
        if (distance < zone.radius && !gameState.exploredAreas.includes(zone.id)) {
            gameState.exploredAreas.push(zone.id);
            showMessage(`Yeni alan keşfedildi: ${zone.id.replace(/\d+/g, '')} bölgesi`);
            
            // Keşif bonusu
            if (Math.random() > 0.7 && currentScene.name === 'forest') {
                addRandomClue(zone.x, zone.y);
            }
        }
    });
}

// RASTGELE İPUCU EKLEME (Yeni)
function addRandomClue(x, y) {
    if (gameState.collectedClues >= 10) return;
    
    const clueTypes = [
        { texture: 'clue1', value: 1 },
        { texture: 'clue2', value: 2 },
        { texture: 'rare_clue', value: 3 }
    ];
    
    const selectedType = Math.random() > 0.9 ? clueTypes[2] : 
                        Math.random() > 0.6 ? clueTypes[1] : clueTypes[0];
    
    const clue = createClue(
        x + (Math.random() * 100 - 50),
        y + (Math.random() * 100 - 50),
        selectedType.texture,
        selectedType.value
    );
    
    currentScene.addChild(clue);
}

// GELİŞMİŞ İPUCU SİSTEMİ
function createClue(x, y, texture = 'clue', value = 1) {
    const clue = new PIXI.Sprite(PIXI.Assets.get(texture));
    clue.anchor.set(0.5);
    clue.position.set(x, y);
    clue.interactionValue = value;
    
    clue.eventMode = 'static';
    clue.cursor = 'pointer';
    clue.on('pointerdown', () => {
        collectClue(clue);
    });
    
    return clue;
}

function collectClue(clue) {
    clue.visible = false;
    gameState.collectedClues += clue.interactionValue;
    
    // Dinamik ilerleme
    const requiredClues = 5 + Math.floor(gameState.memoriesFound * 1.5);
    
    if (gameState.collectedClues >= requiredClues) {
        gameState.collectedClues = 0;
        gameState.memoriesFound++;
        
        showMessage(`Yeni anı bulundu! (${gameState.memoriesFound}/6)`, () => {
            if (gameState.memoriesFound >= 6) {
                changeScene('final');
            } else {
                updateGameWorld();
            }
        });
    } else {
        showMessage(`İpucu bulundu! (${gameState.collectedClues}/${requiredClues})`);
    }
    
    updateGameState();
}

// OYUN DÜNYASINI GÜNCELLE
function updateGameWorld() {
    // Her anı bulunduğunda dünyayı değiştir
    switch(gameState.memoriesFound) {
        case 1:
            scenes.forest = createEnhancedForestScene();
            break;
        case 3:
            scenes.village = createEnhancedVillageScene();
            break;
    }
    
    changeScene(currentScene.name);
}

// OYUN SÜRESİ KONTROLÜ
function checkGameDuration() {
    const elapsedMinutes = (Date.now() - gameState.gameStartTime) / 60000;
    if (elapsedMinutes < 30 && gameState.memoriesFound >= 6) {
        // Oyun çok hızlı biterse ekstra görevler ekle
        gameState.currentObjective = "Tüm gizli bölgeleri keşfet!";
        gameState.memoriesFound = 5;
        showMessage("Ama henüz bitmedi! Daha keşfedilmemiş yerler var...");
    }
}

// SAHNELERİ GÜNCELLE (Daha karmaşık hale getir)
function createEnhancedForestScene() {
    const scene = createForestScene();
    
    // Ekstra engeller ekle
    const obstacles = [
        {x: 400, y: 300, width: 200, height: 20},
        {x: 200, y: 450, width: 150, height: 20}
    ];
    
    obstacles.forEach(obs => {
        const obstacle = new PIXI.Graphics()
            .rect(0, 0, obs.width, obs.height)
            .fill(0x4a3520);
        obstacle.position.set(obs.x, obs.y);
        obstacle.interactive = true;
        obstacle.on('pointerdown', () => {
            if (gameState.inventory.includes('axe')) {
                scene.removeChild(obstacle);
                showMessage("Engel kaldırıldı!");
            } else {
                showMessage("Bunu aşmak için bir baltaya ihtiyacım var");
            }
        });
        scene.addChild(obstacle);
    });
    
    return scene;
}
