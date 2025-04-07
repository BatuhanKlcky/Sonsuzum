//
const app = new PIXI.Application({
    width: 800,          // Oyun genişliği
    height: 600,         // Oyun yüksekliği
    backgroundColor: 0x2c3e50, // Arkaplan rengi (koyu mavi-gri)
    antialias: true      // Daha yumuşak kenarlar
});

// Canvas'ı HTML'e ekle
document.body.appendChild(app.view);

// Ekran boyutunu responsive yap
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});
