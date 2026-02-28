"use client";

import { useState, useMemo } from "react";

interface Appointment {
  company_number: string;
  company_name: string;
  role: string;
}

interface Director {
  name: string;
  role: string;
  other_appointments: Appointment[];
}

interface Props {
  focalName: string;
  directors: Director[];
}

interface DirNode {
  id: string;
  name: string;
  role: string;
  appointments: Appointment[];
  x: number;
  y: number;
  angle: number;
}

interface CoNode {
  company_number: string;
  company_name: string;
  x: number;
  y: number;
  angle: number;
  directorIds: string[];
}

const CX = 300;
const CY = 255;
const INNER_R = 115;
const OUTER_R = 200;
const FOCAL_R = 32;
const DIR_R = 20;
const CO_R = 16;

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cpx = mx + (CX - mx) * 0.15;
  const cpy = my + (CY - my) * 0.15;
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
}

export default function DirectorGraph({ focalName, directors }: Props) {
  const [hovered, setHovered] = useState<{ type: "director" | "company"; id: string } | null>(null);

  const { dirNodes, coNodes } = useMemo(() => {
    const n = directors.length;
    const dirNodes: DirNode[] = directors.map((d, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      const seen = new Set<string>();
      const appointments = d.other_appointments.filter((a) => {
        if (seen.has(a.company_number)) return false;
        seen.add(a.company_number);
        return true;
      });
      return {
        id: d.name,
        name: d.name,
        role: d.role,
        appointments,
        x: CX + INNER_R * Math.cos(angle),
        y: CY + INNER_R * Math.sin(angle),
        angle,
      };
    });

    const companyMap = new Map<
      string,
      { company_number: string; company_name: string; directorIds: string[]; angles: number[] }
    >();
    for (const dir of dirNodes) {
      for (const appt of dir.appointments) {
        const existing = companyMap.get(appt.company_number);
        if (existing) {
          existing.directorIds.push(dir.id);
          existing.angles.push(dir.angle);
        } else {
          companyMap.set(appt.company_number, {
            company_number: appt.company_number,
            company_name: appt.company_name,
            directorIds: [dir.id],
            angles: [dir.angle],
          });
        }
      }
    }

    // Sort by most-connected first, then cap to keep the graph legible
    const CO_CAP = 20;
    const sorted = Array.from(companyMap.values())
      .sort((a, b) => b.directorIds.length - a.directorIds.length)
      .slice(0, CO_CAP)
      // Re-sort by mean director angle so nodes cluster near their directors
      .sort((a, b) => {
        const aAngle = a.angles.reduce((x, y) => x + y, 0) / a.angles.length;
        const bAngle = b.angles.reduce((x, y) => x + y, 0) / b.angles.length;
        return aAngle - bAngle;
      });

    // Distribute evenly so no two nodes share the same position
    const coNodes: CoNode[] = sorted.map((c, i, arr) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(arr.length, 1);
      return {
        company_number: c.company_number,
        company_name: c.company_name,
        x: CX + OUTER_R * Math.cos(angle),
        y: CY + OUTER_R * Math.sin(angle),
        angle,
        directorIds: c.directorIds,
      };
    });

    return { dirNodes, coNodes };
  }, [directors]);

  if (directors.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-[#3D5275]">
        No director data available
      </div>
    );
  }

  function dirOpacity(dir: DirNode): number {
    if (!hovered) return 1;
    if (hovered.type === "director") return hovered.id === dir.id ? 1 : 0.15;
    const co = coNodes.find((c) => c.company_number === hovered.id);
    return co?.directorIds.includes(dir.id) ? 1 : 0.15;
  }

  function coOpacity(co: CoNode): number {
    if (!hovered) return 1;
    if (hovered.type === "company") return hovered.id === co.company_number ? 1 : 0.15;
    const dir = dirNodes.find((d) => d.id === hovered.id);
    return dir?.appointments.some((a) => a.company_number === co.company_number) ? 1 : 0.15;
  }

  function focalEdgeOpacity(dir: DirNode): number {
    if (!hovered) return 0.4;
    if (hovered.type === "director") return hovered.id === dir.id ? 0.4 : 0.1;
    const co = coNodes.find((c) => c.company_number === hovered.id);
    return co?.directorIds.includes(dir.id) ? 0.4 : 0.1;
  }

  function dirCoEdgeOpacity(dirId: string, coNum: string): number {
    if (!hovered) return 0.3;
    if (hovered.type === "director") return hovered.id === dirId ? 0.3 : 0.05;
    return hovered.id === coNum ? 0.3 : 0.05;
  }

  const focalWords = focalName.split(" ");
  const focalLine1 = truncate(focalWords[0], 8);
  const focalLine2 = focalWords.length > 1 ? truncate(focalWords.slice(1).join(" "), 8) : null;

  return (
    <>
      <svg
        viewBox="0 0 600 510"
        className="w-full"
        role="img"
        aria-label={`Director network for ${focalName}`}
      >
        <defs>
          <style>{`
            @keyframes dirGraphNodeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes dirGraphPathIn {
              from { stroke-dashoffset: 300; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>

        {/* Focal → Director edges (blue = "is a director of this company") */}
        {dirNodes.map((dir, i) => (
          <path
            key={`focal-${dir.id}`}
            d={bezierPath(CX, CY, dir.x, dir.y)}
            fill="none"
            stroke="#4F7BFF"
            strokeWidth={1.5}
            strokeDasharray={300}
            opacity={focalEdgeOpacity(dir)}
            style={{
              animation: `dirGraphPathIn 500ms ease-out ${i * 30 + 100}ms both`,
              transition: "opacity 200ms",
            }}
          />
        ))}

        {/* Director → Company edges (green = "also holds a directorship at") */}
        {dirNodes.map((dir) =>
          dir.appointments.map((appt) => {
            const co = coNodes.find((c) => c.company_number === appt.company_number);
            if (!co) return null;
            return (
              <path
                key={`dir-co-${dir.id}-${appt.company_number}`}
                d={bezierPath(dir.x, dir.y, co.x, co.y)}
                fill="none"
                stroke="#22D3A0"
                strokeWidth={1}
                strokeDasharray={300}
                opacity={dirCoEdgeOpacity(dir.id, appt.company_number)}
                style={{
                  animation: `dirGraphPathIn 500ms ease-out 200ms both`,
                  transition: "opacity 200ms",
                }}
              />
            );
          })
        )}

        {/* Outer company nodes */}
        {coNodes.map((co, i) => (
          <g
            key={co.company_number}
            style={{
              animation: `dirGraphNodeIn 400ms ease-out ${(dirNodes.length + i) * 30 + 200}ms both`,
            }}
          >
            <g
              opacity={coOpacity(co)}
              style={{ transition: "opacity 200ms", cursor: "pointer" }}
              onMouseEnter={() => setHovered({ type: "company", id: co.company_number })}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered?.type === "company" && hovered.id === co.company_number && (
                <circle cx={co.x} cy={co.y} r={CO_R + 5} fill="none" stroke="#22D3A0" strokeWidth={1} opacity={0.3} />
              )}
              <circle cx={co.x} cy={co.y} r={CO_R} fill="#0D1F35" stroke="#4A7FAD" strokeWidth={1.5} />
              {(() => {
                const dx = co.x - CX;
                const dy = co.y - CY;
                const mag = Math.sqrt(dx * dx + dy * dy) || 1;
                const lx = co.x + (dx / mag) * (CO_R + 9);
                const ly = co.y + (dy / mag) * (CO_R + 9);
                const anchor = dx < -15 ? "end" : dx > 15 ? "start" : "middle";
                return (
                  <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize={8} fill="#7A8FAD">
                    {truncate(co.company_name, 18)}
                  </text>
                );
              })()}
            </g>
          </g>
        ))}

        {/* Director nodes */}
        {dirNodes.map((dir, i) => {
          const parts = dir.name.split(" ");
          const nameL1 = truncate(parts[0], 8);
          const nameL2 = parts.length > 1 ? truncate(parts[parts.length - 1], 8) : null;
          return (
            <g
              key={dir.id}
              style={{
                animation: `dirGraphNodeIn 400ms ease-out ${i * 30 + 100}ms both`,
              }}
            >
              <g
                opacity={dirOpacity(dir)}
                style={{ transition: "opacity 200ms", cursor: "pointer" }}
                onMouseEnter={() => setHovered({ type: "director", id: dir.id })}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered?.type === "director" && hovered.id === dir.id && (
                  <circle cx={dir.x} cy={dir.y} r={DIR_R + 5} fill="none" stroke="#22D3A0" strokeWidth={1} opacity={0.3} />
                )}
                <circle cx={dir.x} cy={dir.y} r={DIR_R} fill="#22D3A0" />
                <text textAnchor="middle" fontSize={7} fill="#0A1628" fontWeight="600">
                  <tspan x={dir.x} y={nameL2 ? dir.y - 3.5 : dir.y + 2.5} dominantBaseline="middle">{nameL1}</tspan>
                  {nameL2 && <tspan x={dir.x} y={dir.y + 4.5} dominantBaseline="middle">{nameL2}</tspan>}
                </text>
              </g>
            </g>
          );
        })}

        {/* Focal company node — always on top */}
        <g style={{ animation: "dirGraphNodeIn 400ms ease-out 0ms both" }}>
          <circle cx={CX} cy={CY} r={FOCAL_R} fill="#4F7BFF" />
          <text textAnchor="middle" fontSize={10} fontWeight="bold" fill="white">
            <tspan x={CX} y={focalLine2 ? CY - 4 : CY + 4}>{focalLine1}</tspan>
            {focalLine2 && <tspan x={CX} dy={13}>{focalLine2}</tspan>}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-xs text-[#7A8FAD]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-[#4F7BFF]" />
          Focal company
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-[#22D3A0]" />
          Director
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 shrink-0 rounded-full border border-[#4A7FAD] bg-[#0D1F35]" />
          Other company
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8" className="shrink-0"><line x1="0" y1="4" x2="20" y2="4" stroke="#4F7BFF" strokeWidth="1.5" /></svg>
          Director of focal company
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8" className="shrink-0"><line x1="0" y1="4" x2="20" y2="4" stroke="#22D3A0" strokeWidth="1.5" /></svg>
          Also holds directorship at
        </span>
      </div>
    </>
  );
}
