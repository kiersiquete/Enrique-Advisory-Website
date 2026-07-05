import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { PILLARS } from "../data/assessment.js";
import { roundedScore } from "../utils/results.js";

const MOBILE_RADAR_LABELS = {
  en: {
    "family-governance": "Bodies",
    management: "Mgmt."
  },
  es: {
    "family-governance": "Órganos",
    "next-generation": "Sig. gen."
  }
};

function useViewportMatch(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

export default function RadarPanel({ result, language }) {
  const isMobile = useViewportMatch("(max-width: 640px)");
  const useCompactLabels = useViewportMatch("(max-width: 1180px)");
  const data = useMemo(
    () =>
      PILLARS.map((pillar) => {
        const item = result.pillarScores.find((candidate) => candidate.id === pillar.id);
        const hasScore = item?.score !== null && Number.isFinite(Number(item?.score));

        return {
          label: isMobile || useCompactLabels
            ? MOBILE_RADAR_LABELS[language]?.[pillar.id] ?? pillar.shortLabels[language]
            : pillar.shortLabels[language],
          score: hasScore ? roundedScore(item.score) : 0
        };
      }),
    [isMobile, language, result, useCompactLabels]
  );
  const chartConfig = isMobile
    ? {
        className: "h-[380px] w-full",
        margin: { top: 14, right: 54, bottom: 14, left: 54 },
        outerRadius: "94%",
        angleTick: { fill: "#1C3D2E", fontSize: 14, fontWeight: 500 },
        radiusTick: { fill: "#6B6B5F", fontSize: 12, dx: -7, dy: 6 }
      }
    : {
        className: "h-[420px] w-full sm:h-[650px]",
        margin: { top: 18, right: 68, bottom: 18, left: 68 },
        outerRadius: "94%",
        angleTick: { fill: "#1C3D2E", fontSize: 14, fontWeight: 500 },
        radiusTick: { fill: "#6B6B5F", fontSize: 13, dx: -10, dy: 8 }
      };

  return (
    <div className={chartConfig.className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          outerRadius={chartConfig.outerRadius}
          margin={chartConfig.margin}
        >
          <PolarGrid stroke="#ded7ca" />
          <PolarAngleAxis
            dataKey="label"
            tick={chartConfig.angleTick}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={78}
            domain={[0, 100]}
            axisLine={false}
            tick={chartConfig.radiusTick}
            tickCount={6}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(28, 61, 46, 0.14)",
              color: "#2A2A2A"
            }}
          />
          <Radar
            dataKey="score"
            stroke="#1C3D2E"
            fill="#1C3D2E"
            fillOpacity={0.24}
            strokeWidth={2}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
