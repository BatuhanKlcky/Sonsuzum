import { useEffect, useState } from "react";

export default function FlowerField() {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    const createFlower = (x, y) => {
      const flower = {
        id: Date.now() + Math.random(),
        x,
        y,
        size: Math.random() * 20 + 20,
        emoji: ["🌸", "🌼", "🌷", "🌻"][Math.floor(Math.random() * 4)],
      };
      setFlowers((prev) => [...prev, flower]);

      setTimeout(() => {
        setFlowers((prev) => prev.filter((f) => f.id !== flower.id));
      }, 3000);
    };

    const handleMove = (e) => {
      if (e.touches) {
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          createFlower(touch.clientX, touch.clientY);
        }
      } else {
        createFlower(e.clientX, e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute animate-flower-pop select-none"
          style={{
            left: f.x,
            top: f.y,
            fontSize: `${f.size}px`,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 0 4px rgba(255, 192, 203, 0.7))",
          }}
        >
          {f.emoji}
        </div>
      ))}
      <div className="falling-elements">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="leaf">🍃</div>
        ))}
      </div>

      <style jsx>{`
        @keyframes flower-pop {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.4);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-flower-pop {
          animation: flower-pop 3s ease-out forwards;
        }

        .falling-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        .leaf {
          position: absolute;
          top: -10%;
          left: ${Math.random() * 100}%;
          font-size: 20px;
          animation: fall linear infinite;
          animation-duration: ${Math.random() * 5 + 5}s;
        }

        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
