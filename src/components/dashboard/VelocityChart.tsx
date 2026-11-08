'use client';

import React, { memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface VelocityChartProps {
  data: { day: string; hours: number; score: number }[];
  activeChartTab: 'hours' | 'score';
}

function VelocityChart({ data, activeChartTab }: VelocityChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7857FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7857FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#397BFF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#397BFF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#11182B',
              borderColor: 'rgba(120, 87, 255, 0.25)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          />
          {activeChartTab === 'hours' ? (
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#7857FF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#violetGradient)"
              name="Study Hours"
            />
          ) : (
            <Area
              type="monotone"
              dataKey="score"
              stroke="#397BFF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#blueGradient)"
              name="Readiness Score"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(VelocityChart);

