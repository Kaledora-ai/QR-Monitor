"use client";
import { useEffect, useState } from "react";

const CITIES = [
  { c: "São Paulo · SP", x: 64, y: 70 },
  { c: "Campinas · SP", x: 30, y: 38 },
  { c: "Rio de Janeiro · RJ", x: 76, y: 34 },
  { c: "Curitiba · PR", x: 22, y: 66 },
  { c: "Belo Horizonte · MG", x: 58, y: 20 },
  { c: "Santos · SP", x: 40, y: 80 },
];

// Um mini QR decorativo (não é um código real)
const PATTERN = [
  "1111111010101111111",
  "1000001001101000001",
  "1011101011001011101",
  "1011101000101011101",
  "1011101011101011101",
  "1000001010001000001",
  "1111111010101111111",
  "0000000011000000000",
  "1101011101110100110",
  "0110100100101011011",
  "1011111011010010101",
  "0100100110001101100",
  "1111111001101011010",
  "0000000011011001101",
  "1111111010110110011",
  "1000001001001011100",
  "1011101011110100111",
  "1011101010011011001",
  "1111111011101100110",
];

export function HeroRadar() {
  const [tick, setTick] = useState(0);
  const [count, setCount] = useState(1284);
  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setCount((v) => v + 1 + Math.floor(Math.random() * 3));
    }, 1600);
    return () => clearInterval(t);
  }, []);
  const active = [CITIES[tick % CITIES.length], CITIES[(tick + 2) % CITIES.length], CITIES[(tick + 4) % CITIES.length]];

  return (
    <div className="relative mx-auto w-full max-w-[460px] aspect-square select-none" aria-hidden="true">
      {/* anéis do radar */}
      <div className="absolute inset-0 rounded-full border border-signal/15" />
      <div className="absolute inset-[12%] rounded-full border border-signal/15" />
      <div className="absolute inset-[26%] rounded-full border border-signal/20" />
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="radar-sweep absolute inset-0 rounded-full" />
      </div>
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-signal/10" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-signal/10" />

      {/* pings de leituras */}
      {active.map((p, i) => (
        <div key={`${p.c}-${tick}-${i}`} className="absolute rise" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <span className={`ping-dot relative block h-2.5 w-2.5 rounded-full ${i === 0 ? "text-ping bg-ping" : "text-signal bg-signal"}`} />
          {i === 0 && (
            <span className="absolute left-4 -top-2 whitespace-nowrap rounded-full bg-deep/90 border border-edge px-2.5 py-1 text-[11px] text-ink">
              Nova leitura · {p.c}
            </span>
          )}
        </div>
      ))}

      {/* QR central */}
      <div className="floaty absolute inset-[30%] rounded-3xl bg-white p-[7%] shadow-[0_0_80px_-10px_#6ff5c655]">
        <svg viewBox="0 0 19 19" className="w-full h-full" shapeRendering="crispEdges">
          {PATTERN.flatMap((row, y) =>
            row.split("").map((v, x) => (v === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0a0f1f" /> : null))
          )}
        </svg>
      </div>

      {/* contador */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-right-2 card !rounded-2xl px-4 py-3 bg-deep/90 backdrop-blur">
        <p className="text-[11px] uppercase tracking-widest text-mute">Leituras este mês</p>
        <p className="font-mono text-2xl font-bold text-signal tabular-nums">{count.toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}
