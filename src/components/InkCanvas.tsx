import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Trash2, Send, X } from 'lucide-react';

interface InkCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInk: (imageDataUrl: string) => void;
}

const COLORS = [
  '#ff007f', // Hot Scene Pink
  '#00f0ff', // Cyanide Cyan
  '#39ff14', // Acid Lime
  '#e11d48', // Blood Red
  '#c084fc', // Velvet Purple
  '#ffffff', // Ghost White
  '#000000', // Pitch Black
];

export const InkCanvas: React.FC<InkCanvasProps> = ({ isOpen, onClose, onSendInk }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff007f');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = isEraser ? '#0a0a0f' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSendInk(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-bounce-in select-none">
      <div className="bg-zinc-900 rounded-3xl shadow-2xl border-2 border-rose-500/40 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black px-4 py-3 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-rose-400" />
            <span className="font-extrabold text-sm text-zinc-100 font-mono">Sharpie Scribble & Graffiti</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          {/* Colors */}
          <div className="flex items-center space-x-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-125 ${
                  color === c && !isEraser ? 'ring-2 ring-rose-500 scale-110 border-white' : 'border-zinc-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Tools & Stroke Width */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-1.5 rounded transition border ${
                isEraser
                  ? 'bg-rose-950 text-rose-300 border-rose-500'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
              title="Eraser"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>

            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-200 font-mono"
            >
              <option value="2">Fine (2px)</option>
              <option value="4">Sharpie (4px)</option>
              <option value="8">Marker (8px)</option>
              <option value="16">Fat Cap (16px)</option>
            </select>

            <button
              onClick={clearCanvas}
              className="p-1.5 rounded bg-zinc-900 text-rose-400 hover:bg-rose-950 border border-zinc-700 transition"
              title="Clear Pad"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="p-3 bg-black flex justify-center">
          <canvas
            ref={canvasRef}
            width={380}
            height={220}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="rounded-xl border border-zinc-800 shadow-inner cursor-crosshair touch-none"
          />
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-zinc-900 flex items-center justify-between border-t border-zinc-800">
          <span className="text-[11px] text-zinc-500 font-mono">Doodle lyrics, hearts, or angst</span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:bg-zinc-800 transition font-mono"
            >
              Discard
            </button>
            <button
              onClick={handleSend}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition font-mono"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Scribble</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
