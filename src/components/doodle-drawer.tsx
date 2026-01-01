"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eraser,
  Pencil,
  Circle,
  Square,
  Minus,
  Type,
  Undo,
  Redo,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DoodleDrawerProps {
  onClose: () => void;
  onDoodleAdd: (doodleUrl: string) => void;
}

type DrawMode = "draw" | "erase" | "circle" | "rectangle" | "line" | "text";

interface DrawElement {
  type: "path" | "circle" | "rectangle" | "line" | "text";
  data: any;
  color: string;
  strokeWidth: number;
}

const colors = [
  "#000000", // Black
  "#4B5563", // Gray
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#10B981", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export const DoodleDrawer: React.FC<DoodleDrawerProps> = ({
  onClose,
  onDoodleAdd,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [drawMode, setDrawMode] = useState<DrawMode>("draw");
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [previewShape, setPreviewShape] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(
      svg.getScreenCTM()?.inverse(),
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  const addToHistory = (newElements: DrawElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1] || []);
    } else if (historyStep === 0) {
      setHistoryStep(-1);
      setElements([]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
    }
  };

  const startDrawing = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getCoordinates(e);

    if (drawMode === "text") {
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }

    setStartPoint(point);
    setIsDrawing(true);

    if (drawMode === "draw" || drawMode === "erase") {
      pointsRef.current = [point];
      setCurrentPath(`M ${point.x} ${point.y}`);
    }
  };

  const draw = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !startPoint) return;

    const point = getCoordinates(e);

    if (drawMode === "draw" || drawMode === "erase") {
      pointsRef.current.push(point);

      if (pointsRef.current.length > 3) {
        const points = pointsRef.current;
        const lastPoint = points[points.length - 1];
        const controlPoint = points[points.length - 2];
        const endPoint = {
          x: (controlPoint.x + lastPoint.x) / 2,
          y: (controlPoint.y + lastPoint.y) / 2,
        };

        setCurrentPath(
          (prev) =>
            `${prev} Q ${controlPoint.x} ${controlPoint.y}, ${endPoint.x} ${endPoint.y}`,
        );
      }
    } else if (drawMode === "circle") {
      const radius = Math.sqrt(
        Math.pow(point.x - startPoint.x, 2) +
          Math.pow(point.y - startPoint.y, 2),
      );
      setPreviewShape({ cx: startPoint.x, cy: startPoint.y, r: radius });
    } else if (drawMode === "rectangle") {
      setPreviewShape({
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y),
      });
    } else if (drawMode === "line") {
      setPreviewShape({
        x1: startPoint.x,
        y1: startPoint.y,
        x2: point.x,
        y2: point.y,
      });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const newElements = [...elements];

    if (drawMode === "draw" || drawMode === "erase") {
      if (currentPath) {
        newElements.push({
          type: "path",
          data: currentPath,
          color: drawMode === "erase" ? "white" : color,
          strokeWidth: lineWidth,
        });
      }
    } else if (drawMode === "circle" && previewShape) {
      newElements.push({
        type: "circle",
        data: previewShape,
        color,
        strokeWidth: lineWidth,
      });
    } else if (drawMode === "rectangle" && previewShape) {
      newElements.push({
        type: "rectangle",
        data: previewShape,
        color,
        strokeWidth: lineWidth,
      });
    } else if (drawMode === "line" && previewShape) {
      newElements.push({
        type: "line",
        data: previewShape,
        color,
        strokeWidth: lineWidth,
      });
    }

    setElements(newElements);
    addToHistory(newElements);
    setCurrentPath("");
    setPreviewShape(null);
    setIsDrawing(false);
    setStartPoint(null);
    pointsRef.current = [];
  };

  const addText = () => {
    if (!textInput.trim() || !textPosition) return;

    const newElements = [
      ...elements,
      {
        type: "text" as const,
        data: { x: textPosition.x, y: textPosition.y, text: textInput },
        color,
        strokeWidth: lineWidth,
      },
    ];

    setElements(newElements);
    addToHistory(newElements);
    setTextInput("");
    setTextPosition(null);
    setShowTextInput(false);
  };

  const clearCanvas = () => {
    const newElements: DrawElement[] = [];
    setElements(newElements);
    addToHistory(newElements);
    setCurrentPath("");
    setPreviewShape(null);
  };

  const saveDoodle = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;

    const rect = svg.getBoundingClientRect();
    clonedSvg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    clonedSvg.setAttribute("width", "100%");
    clonedSvg.setAttribute("height", "100%");
    clonedSvg.style.backgroundColor = "transparent";

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    onDoodleAdd(svgUrl);
    onClose();
  };

  const getCursor = () => {
    if (drawMode === "text") return "text";
    if (drawMode === "draw" || drawMode === "erase") return "crosshair";
    return "crosshair";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Draw a doodle</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-[4/3] bg-white rounded-xl border-2 border-stone-200 relative">
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ cursor: getCursor() }}
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            >
              {elements.map((element, i) => {
                if (element.type === "path") {
                  return (
                    <path
                      key={i}
                      d={element.data}
                      stroke={element.color}
                      strokeWidth={element.strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                } else if (element.type === "circle") {
                  return (
                    <circle
                      key={i}
                      cx={element.data.cx}
                      cy={element.data.cy}
                      r={element.data.r}
                      stroke={element.color}
                      strokeWidth={element.strokeWidth}
                      fill="none"
                    />
                  );
                } else if (element.type === "rectangle") {
                  return (
                    <rect
                      key={i}
                      x={element.data.x}
                      y={element.data.y}
                      width={element.data.width}
                      height={element.data.height}
                      stroke={element.color}
                      strokeWidth={element.strokeWidth}
                      fill="none"
                    />
                  );
                } else if (element.type === "line") {
                  return (
                    <line
                      key={i}
                      x1={element.data.x1}
                      y1={element.data.y1}
                      x2={element.data.x2}
                      y2={element.data.y2}
                      stroke={element.color}
                      strokeWidth={element.strokeWidth}
                      strokeLinecap="round"
                    />
                  );
                } else if (element.type === "text") {
                  return (
                    <text
                      key={i}
                      x={element.data.x}
                      y={element.data.y}
                      fill={element.color}
                      fontSize={element.strokeWidth * 3}
                      fontFamily="Arial, sans-serif"
                    >
                      {element.data.text}
                    </text>
                  );
                }
                return null;
              })}

              {/* Current drawing path */}
              {currentPath && (drawMode === "draw" || drawMode === "erase") && (
                <path
                  d={currentPath}
                  stroke={drawMode === "erase" ? "white" : color}
                  strokeWidth={lineWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Preview shapes */}
              {previewShape && drawMode === "circle" && (
                <circle
                  cx={previewShape.cx}
                  cy={previewShape.cy}
                  r={previewShape.r}
                  stroke={color}
                  strokeWidth={lineWidth}
                  fill="none"
                  opacity={0.5}
                />
              )}
              {previewShape && drawMode === "rectangle" && (
                <rect
                  x={previewShape.x}
                  y={previewShape.y}
                  width={previewShape.width}
                  height={previewShape.height}
                  stroke={color}
                  strokeWidth={lineWidth}
                  fill="none"
                  opacity={0.5}
                />
              )}
              {previewShape && drawMode === "line" && (
                <line
                  x1={previewShape.x1}
                  y1={previewShape.y1}
                  x2={previewShape.x2}
                  y2={previewShape.y2}
                  stroke={color}
                  strokeWidth={lineWidth}
                  strokeLinecap="round"
                  opacity={0.5}
                />
              )}
            </svg>

            {/* Text input overlay */}
            {showTextInput && textPosition && (
              <div
                className="absolute bg-white border-2 border-stone-300 rounded p-2 shadow-lg"
                style={{
                  left: `${(textPosition.x / 400) * 100}%`,
                  top: `${(textPosition.y / 300) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addText();
                    if (e.key === "Escape") {
                      setShowTextInput(false);
                      setTextInput("");
                    }
                  }}
                  placeholder="Type text..."
                  autoFocus
                  className="w-40"
                />
                <div className="flex gap-1 mt-2">
                  <Button size="sm" onClick={addText}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowTextInput(false);
                      setTextInput("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tools */}
          <div className="flex gap-2 items-center flex-wrap justify-center">
            <Button
              variant={drawMode === "draw" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("draw")}
              title="Draw"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={drawMode === "erase" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("erase")}
              title="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={drawMode === "circle" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("circle")}
              title="Circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={drawMode === "rectangle" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("rectangle")}
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={drawMode === "line" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("line")}
              title="Line"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant={drawMode === "text" ? "default" : "outline"}
              size="icon"
              onClick={() => setDrawMode("text")}
              title="Text"
            >
              <Type className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-stone-200" />

            <Popover>
              <PopoverTrigger asChild>
                <div className="relative w-10 h-10 group cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-stone-200 transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" sideOffset={5}>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        c === color ? "border-stone-900" : "border-stone-200"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="relative w-24 group">
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer"
              />
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white px-2 py-1 rounded text-xs">
                {lineWidth}px
              </div>
            </div>

            <div className="w-px h-8 bg-stone-200" />

            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={historyStep < 0}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button onClick={clearCanvas} variant="outline">
              Clear
            </Button>
          </div>

          <Button onClick={saveDoodle} className="w-full">
            Add Doodle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
