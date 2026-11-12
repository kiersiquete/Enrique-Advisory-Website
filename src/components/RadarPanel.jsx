import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Text,
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
  const reducedMotion = useViewportMatch("(prefers-reduced-motion: reduce)");
  const data = useMemo(
    () =>
      PILLARS.map((pillar) => {
        const item = result.pillarScores.find((candidate) => candidate.id === pillar.id);
        const hasScore =
          item?.score !== null && item?.scored > 0 && Number.isFinite(Number(item?.score));

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
        margin: { top: 30, right: 56, bottom: 30, left: 56 },
        outerRadius: "94%",
        angleTick: { fill: "#32535D", fontSize: 12, fontWeight: 500 },
        radiusTick: { fill: "#32535D", fontSize: 12, dx: -7, dy: 6 }
      }
    : {
        margin: { top: 18, right: 68, bottom: 18, left: 68 },
        outerRadius: "94%",
        angleTick: { fill: "#32535D", fontSize: 14, fontWeight: 500 },
        radiusTick: { fill: "#32535D", fontSize: 13, dx: -10, dy: 8 }
      };

  return (
    <div className="radar-panel mx-auto aspect-square w-full max-w-[650px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          outerRadius={chartConfig.outerRadius}
          margin={chartConfig.margin}
        >
          <PolarGrid stroke="#B7C9B9" />
          <PolarAngleAxis
            dataKey="label"
            tick={({ x, y, textAnchor, payload }) => (
              <Text
                x={x}
                y={y}
                textAnchor={textAnchor}
                verticalAnchor="middle"
                width={isMobile ? 52 : 80}
                className="recharts-polar-angle-axis-tick-value"
                {...chartConfig.angleTick}
              >
                {payload.value}
              </Text>
            )}
            tickLine={false}
            tickSize={isMobile ? 4 : 8}
          />
          <PolarRadiusAxis
            angle={78}
            domain={[0, 100]}
            axisLine={false}
            tick={chartConfig.radiusTick}
            tickCount={isMobile ? 3 : 6}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(50, 83, 93, 0.14)",
              color: "#32535D"
            }}
          />
          <Radar
            dataKey="score"
            stroke="#32535D"
            fill="#32535D"
            fillOpacity={0.24}
            strokeWidth={2}
            isAnimationActive={!reducedMotion}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
