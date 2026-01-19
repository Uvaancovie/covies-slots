
import React from 'react';
import { LineWin } from '../types';
import { GAME_CONFIG } from '../core/config';

interface WinLineOverlayProps {
  lineWins: LineWin[];
}

const WinLineOverlay: React.FC<WinLineOverlayProps> = ({ lineWins }) => {
  // Grid dimensions for SVG mapping
  // Grid is 5 cols x 5 rows
  // Col width = 20% (100/5)
  // Row height = 20% (100/5)
  // Center X = ColIndex * 20 + 10
  // Center Y = RowIndex * 20 + 10

  const getCoordinates = (row: number, col: number) => {
    const x = col * 20 + 10;
    const y = row * 20 + 10;
    return `${x},${y}`;
  };

  const colors = [
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg className="w-full h-full" preserveAspectRatio="none">
        {lineWins.map((win, index) => {
          const color = colors[index % colors.length];
          const pathPoints = win.positions.map(([row, col]) => getCoordinates(row, col)).join(' ');
          
          return (
            <g key={`${win.lineIndex}-${index}`}>
              <polyline
                points={pathPoints}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60 drop-shadow-md"
              />
              <polyline
                points={pathPoints}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WinLineOverlay;
