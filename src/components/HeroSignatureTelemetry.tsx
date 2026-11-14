import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Flame, Satellite, Layers, Radio, Sparkles, Sliders, Info, Eye } from 'lucide-react';
import { Language } from '../data/translations';

interface HeroSignatureTelemetryProps {
  language: Language;
}

interface PeatNode {
  id: string;
  name: string;
  region: string;
  lat: string;
  lng: string;
  xPct: number;
  yPct: number;
  tmag: string;
  status: 'safe' | 'warning' | 'critical';
  satPass: string;
}

const PEAT_NODES: PeatNode[] = [
  {
    id: 'riau',
    name: 'Kubah Gambut Giam Siak',
    region: 'Riau, Sumatra',
    lat: '0.85° N',
    lng: '101.78° E',
    xPct: 24,
    yPct: 44,
    tmag: '-28 cm',
    status: 'safe',
    satPass: 'Terra 10:30 WIB',
  },
  {
    id: 'kalteng',
    name: 'Kubah Gambut Sebangau',
    region: 'Kalimantan Tengah',
    lat: '2.21° S',
    lng: '113.92° E',
    xPct: 49,
    yPct: 56,
    tmag: '-48 cm',
    status: 'critical',
    satPass: 'Suomi-NPP 13:15 WIB',
  },
  {
    id: 'sumsel',
    name: 'Kubah Gambut OKI',
    region: 'Sumatera Selatan',
    lat: '3.32° S',
    lng: '104.91° E',
    xPct: 32,
    yPct: 62,
    tmag: '-38 cm',
    status: 'warning',
    satPass: 'Aqua 13:45 WIB',
  },
  {
    id: 'papua',
    name: 'Basin Gambut Mappi',
    region: 'Papua Selatan',
    lat: '6.45° S',
    lng: '139.34° E',
    xPct: 84,
    yPct: 68,
    tmag: '-18 cm',
    status: 'safe',
    satPass: 'NOAA-20 14:10 WIT',
  },
];

export const HeroSignatureTelemetry: React.FC<HeroSignatureTelemetryProps> = ({ language }) => {
  const isIndo = language === 'id';
  const [activeMode, setActiveMode] = useState<'orbital' | 'footprint'>('orbital');
  const [activeNode, setActiveNode] = useState<PeatNode>(PEAT_NODES[1]); // default Sebangau
  const [sensorFilter, setSensorFilter] = useState<'all' | 'modis' | 'viirs' | 'harmonized'>('all');

  // Canvas State for Footprint Laboratory
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const firePosRef = useRef({ x: 200, y: 150 });
  const animFrameRef = useRef<number | null>(null);
  const idleAngleRef = useRef(0);

  // Mouse & Touch Handler for Footprint Canvas
  const updateFirePosition = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(rect.width - 40, clientX - rect.left));
    const y = Math.max(40, Math.min(rect.height - 40, clientY - rect.top));
    firePosRef.current = { x, y };
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    if (activeMode !== 'footprint') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;

      // Idle motion if user is not dragging
      if (!isInteracting) {
        idleAngleRef.current += 0.02;
        const centerX = width / 2;
        const centerY = height / 2;
        firePosRef.current = {
          x: centerX + Math.cos(idleAngleRef.current) * 45,
          y: centerY + Math.sin(idleAngleRef.current * 1.5) * 28,
        };
      }

      const { x: fx, y: fy } = firePosRef.current;

      // Clear with dark telemetry background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw faint coordinate grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw 5.5km Equal-Area Harmonized Cell
      if (sensorFilter === 'all' || sensorFilter === 'harmonized') {
        const cellSize = 130;
        const cellX = Math.floor(fx / cellSize) * cellSize;
        const cellY = Math.floor(fy / cellSize) * cellSize;

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.85)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
        ctx.strokeRect(cellX, cellY, cellSize, cellSize);

        // Corner tick marks
        const tick = 8;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        // top-left
        ctx.beginPath();
        ctx.moveTo(cellX, cellY + tick);
        ctx.lineTo(cellX, cellY);
        ctx.lineTo(cellX + tick, cellY);
        ctx.stroke();
        // top-right
        ctx.beginPath();
        ctx.moveTo(cellX + cellSize - tick, cellY);
        ctx.lineTo(cellX + cellSize, cellY);
        ctx.lineTo(cellX + cellSize, cellY + tick);
        ctx.stroke();
        // bottom-left
        ctx.beginPath();
        ctx.moveTo(cellX, cellY + cellSize - tick);
        ctx.lineTo(cellX, cellY + cellSize);
        ctx.lineTo(cellX + tick, cellY + cellSize);
        ctx.stroke();
        // bottom-right
        ctx.beginPath();
        ctx.moveTo(cellX + cellSize - tick, cellY + cellSize);
        ctx.lineTo(cellX + cellSize, cellY + cellSize);
        ctx.lineTo(cellX + cellSize, cellY + cellSize - tick);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText('WANAREKSA 5.5 KM EQUAL-AREA', cellX + 6, cellY + 16);
      }

      // Draw MODIS 1000m Footprint
      if (sensorFilter === 'all' || sensorFilter === 'modis') {
        const modisRadius = 55;
        ctx.beginPath();
        ctx.arc(fx, fy, modisRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
        ctx.fill();

        ctx.fillStyle = '#fb923c';
        ctx.font = '9px monospace';
        ctx.fillText('MODIS 1.0 km nadir (1 pt)', fx - 50, fy - modisRadius - 5);
      }

      // Draw VIIRS 375m Sub-pixel Detections (7 discrete points for the single fire line)
      if (sensorFilter === 'all' || sensorFilter === 'viirs') {
        const offsets = [
          { dx: -24, dy: -10 },
          { dx: -12, dy: 14 },
          { dx: 0, dy: -6 },
          { dx: 14, dy: 8 },
          { dx: 26, dy: -12 },
          { dx: -4, dy: 22 },
          { dx: 20, dy: -24 },
        ];

        offsets.forEach((off, i) => {
          const vx = fx + off.dx;
          const vy = fy + off.dy;

          // VIIRS 375m mini box
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(vx - 9, vy - 9, 18, 18);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(vx - 9, vy - 9, 18, 18);

          // Center pulsing pip
          ctx.beginPath();
          ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();

          ctx.fillStyle = '#fca5a5';
          ctx.font = '8px monospace';
          ctx.fillText(`V${i + 1}`, vx - 5, vy + 16);
        });

        ctx.fillStyle = '#f87171';
        ctx.font = '9px monospace';
        ctx.fillText('VIIRS 375 m: 7 DETEKSI TERPISAH', fx - 70, fy + 48);
      }

      // Physical Fire Origin (Smoldering Peat Front)
      const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 22);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(251, 146, 60, 0.9)');
      grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.6)');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(fx, fy, 22, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Crosshair on Fire
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx - 12, fy);
      ctx.lineTo(fx + 12, fy);
      ctx.moveTo(fx, fy - 12);
      ctx.lineTo(fx, fy + 12);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, isInteracting, sensorFilter]);

  // Adjust canvas pixel density
  useEffect(() => {
    if (activeMode !== 'footprint' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth || 440;
      canvas.height = parent.clientHeight || 320;
      firePosRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    }
  }, [activeMode]);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-700/80 bg-neutral-950 shadow-2xl flex flex-col aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] group">
      
      {/* Top Header: Mode Selector & Telemetry Banner */}
      <div className="relative z-30 p-3 sm:p-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => setActiveMode('orbital')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              activeMode === 'orbital'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>{isIndo ? 'Radar Orbital' : 'Orbital Sweep'}</span>
          </button>

          <button
            onClick={() => setActiveMode('footprint')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              activeMode === 'footprint'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{isIndo ? 'Fisika Footprint' : 'Footprint Lab'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">LEO 705 KM</span>
          <span className="text-neutral-600">&bull;</span>
          <span className="text-sky-400 font-bold">TERRA &bull; NPP</span>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* VIEW 1: Orbital Telemetry HUD */}
        {activeMode === 'orbital' && (
          <div className="relative w-full h-full">
            {/* Background Earth Satellite Imagery */}
            <img
              src="/terra_hero_satellite_earth.jpg"
              alt="NASA Terra and Suomi-NPP Earth Observation Satellite Fleet over Indonesia"
              className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-102"
              loading="eager"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/40 pointer-events-none" />

            {/* Radar Scanline & Conical Sweep */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="w-[180%] h-[180%] rounded-full border border-sky-500/10 animate-radar-sweep relative">
                <div className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left bg-gradient-to-br from-sky-400/15 via-sky-500/5 to-transparent rounded-tr-full" />
              </div>
            </div>

            {/* Interactive Peatland Hotspot Nodes */}
            {PEAT_NODES.map((node) => {
              const isSelected = activeNode.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  style={{ left: `${node.xPct}%`, top: `${node.yPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group/pin z-20 transition-all cursor-pointer ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                  title={`${node.name} (${node.region})`}
                >
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        node.status === 'critical'
                          ? 'bg-red-400'
                          : node.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 border border-white/80 shadow-md ${
                        node.status === 'critical'
                          ? 'bg-red-500'
                          : node.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                    />
                  </span>
                </button>
              );
            })}

            {/* Active Node Telemetry Card Overlay */}
            <div className="absolute bottom-3 left-3 right-3 z-30 p-3 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-700/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                    {activeNode.region}
                  </span>
                  <span className="text-neutral-500">&bull;</span>
                  <span className="text-[10px] font-mono text-neutral-300">
                    {activeNode.lat}, {activeNode.lng}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {activeNode.name}
                </h4>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">TMAG Gambut</span>
                  <strong className={`font-bold ${
                    activeNode.status === 'critical'
                      ? 'text-red-400'
                      : activeNode.status === 'warning'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}>
                    {activeNode.tmag}
                  </strong>
                </div>

                <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">Lintasan Sensor</span>
                  <strong className="text-neutral-200">
                    {activeNode.satPass}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: Interactive Footprint Physics Simulator Canvas */}
        {activeMode === 'footprint' && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <canvas
              ref={canvasRef}
              onMouseDown={() => setIsInteracting(true)}
              onMouseUp={() => setIsInteracting(false)}
              onMouseLeave={() => setIsInteracting(false)}
              onMouseMove={(e) => updateFirePosition(e.clientX, e.clientY)}
              onTouchStart={() => setIsInteracting(true)}
              onTouchEnd={() => setIsInteracting(false)}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  updateFirePosition(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              className="w-full h-full cursor-crosshair touch-none"
            />

            {/* In-Canvas Filter Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950/80 px-2 py-1 rounded border border-neutral-800">
                {isIndo ? 'Sentuh/Geser Titik Api' : 'Drag Fire Position'}
              </span>

              <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-lg border border-neutral-800 text-[10px] font-mono">
                <button
                  onClick={() => setSensorFilter('all')}
                  className={`px-2 py-0.5 rounded transition ${
                    sensorFilter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSensorFilter('modis')}
                  className={`px-2 py-0.5 rounded transition ${
                    sensorFilter === 'modis' ? 'bg-orange-600 text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  MODIS (1km)
                </button>
                <button
                  onClick={() => setSensorFilter('viirs')}
                  className={`px-2 py-0.5 rounded transition ${
                    sensorFilter === 'viirs' ? 'bg-red-600 text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  VIIRS (375m)
                </button>
                <button
                  onClick={() => setSensorFilter('harmonized')}
                  className={`px-2 py-0.5 rounded transition ${
                    sensorFilter === 'harmonized' ? 'bg-sky-600 text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  Wanareksa
                </button>
              </div>
            </div>

            {/* Bottom Live Calculation HUD */}
            <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 flex items-center justify-between text-[10px] font-mono pointer-events-none">
              <div className="flex items-center gap-3">
                <span className="text-orange-400">
                  MODIS: <strong>1 Titik</strong>
                </span>
                <span className="text-neutral-600">vs</span>
                <span className="text-red-400">
                  VIIRS: <strong>7 Titik (Bias 300%)</strong>
                </span>
              </div>
              <span className="text-sky-400 font-bold">
                Fusi 5.5 km = 1 Peristiwa
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
