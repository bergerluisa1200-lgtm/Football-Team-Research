import { PitchElement as PitchElementType } from "@/types/drill";

interface Props {
  element: PitchElementType;
}

export function PitchElementComponent({ element }: Props) {
  const color = element.color || "#ffffff";

  switch (element.type) {
    case "player":
      return (
        <g>
          <circle
            cx={element.x}
            cy={element.y}
            r="2.8"
            fill={color}
            stroke="white"
            strokeWidth="0.4"
          />
          {element.label && (
            <text
              x={element.x}
              y={element.y + 0.8}
              textAnchor="middle"
              fill="white"
              fontSize="2.2"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {element.label}
            </text>
          )}
        </g>
      );

    case "ball":
      return (
        <circle
          cx={element.x}
          cy={element.y}
          r="1.5"
          fill="white"
          stroke="#333"
          strokeWidth="0.3"
        />
      );

    case "cone":
      return (
        <g>
          <polygon
            points={`${element.x},${element.y - 2} ${element.x - 1.5},${element.y + 1} ${element.x + 1.5},${element.y + 1}`}
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="0.3"
          />
          {element.label && (
            <text
              x={element.x}
              y={element.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="2"
              fontFamily="sans-serif"
            >
              {element.label}
            </text>
          )}
        </g>
      );

    case "arrow":
      return (
        <g>
          <defs>
            <marker
              id={`arrowhead-${element.x}-${element.y}`}
              markerWidth="4"
              markerHeight="3"
              refX="3"
              refY="1.5"
              orient="auto"
            >
              <polygon points="0 0, 4 1.5, 0 3" fill={color} />
            </marker>
          </defs>
          <line
            x1={element.x}
            y1={element.y}
            x2={element.toX}
            y2={element.toY}
            stroke={color}
            strokeWidth="0.6"
            strokeDasharray={element.dashed ? "2 1" : undefined}
            markerEnd={`url(#arrowhead-${element.x}-${element.y})`}
          />
        </g>
      );

    case "run-path":
      return (
        <g>
          <defs>
            <marker
              id={`runhead-${element.x}-${element.y}`}
              markerWidth="4"
              markerHeight="3"
              refX="3"
              refY="1.5"
              orient="auto"
            >
              <polygon points="0 0, 4 1.5, 0 3" fill={color} />
            </marker>
          </defs>
          <line
            x1={element.x}
            y1={element.y}
            x2={element.toX}
            y2={element.toY}
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="1.5 1"
            markerEnd={`url(#runhead-${element.x}-${element.y})`}
            opacity={0.8}
          />
        </g>
      );

    default:
      return null;
  }
}
