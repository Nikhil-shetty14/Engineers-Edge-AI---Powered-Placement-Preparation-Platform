'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { SuggestRelevantJobsOutput } from '@/ai/flows/suggest-relevant-jobs';

export default function JobSuggestions({
  suggestions,
}: {
  suggestions: SuggestRelevantJobsOutput;
}) {
  const skillMapData = suggestions.skillMap
    .map((item) => ({ name: item.skill, value: item.importance }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const chartConfig: ChartConfig = {
    value: {
      label: 'Importance',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-headline font-bold">
          Suggested Job Roles
        </h2>
        {suggestions.jobRoles.map((job, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-headline">{job.title}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {job.company} - {job.location}
                  </p>
                </div>
                <Badge
                  variant={job.relevanceScore > 7 ? 'default' : 'secondary'}
                >
                  Relevance: {job.relevanceScore}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-headline font-bold mb-4">
          Dynamic Skill Map
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Top 10 In-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <RechartsBarChart layout="vertical" data={skillMapData}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <XAxis type="number" hide />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  layout="vertical"
                  fill="var(--color-value)"
                  radius={4}
                />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
