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
  const data = useMemo(
    () =>
      PILLARS.map((pillar) => {
        const item = result.pillarScores.find((candidate) => candidate.id === pillar.id);
        const hasScore = item?.score !== null && Number.isFinite(Number(item?.score));

        return {
          label: isMobile
            ? MOBILE_RADAR_LABELS[language]?.[pillar.id] ?? pillar.shortLabels[language]
            : pillar.shortLabels[language],
          score: hasScore ? roundedScore(item.score) : 0
        };
      }),
    [isMobile, language, result]
  );
  const chartConfig = isMobile
    ? {
        className: "h-[340px] w-full",
        margin: { top: 20, right: 48, bottom: 20, left: 48 },
        outerRadius: "88%",
        angleTick: { fill: "#1C3D2E", fontSize: 14, fontWeight: 500 },
        radiusTick: { fill: "#6B6B5F", fontSize: 12, dx: -7, dy: 6 }
      }
    : {
        className: "h-[340px] w-full sm:h-[560px]",
        margin: { top: 28, right: 44, bottom: 28, left: 44 },
        outerRadius: "80%",
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
