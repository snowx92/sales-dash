import { ChartDataPoint } from './types';
import { TooltipItem } from 'chart.js';
import { useMemo } from 'react';

export type AggregationType = 'day' | 'week' | 'biweekly' | 'month' | 'quarter';

interface AggregatedDataPoint {
  label: string;
  value: number;
  startDate: string;
  endDate: string;
  originalData: ChartDataPoint[];
  percentageChange?: number;
}

interface ChartConfig {
  aggregationType?: AggregationType;
  showPercentageChange?: boolean;
  customColors?: {
    positive: string;
    negative: string;
    neutral: string;
  };
  dateFormat?: Intl.DateTimeFormatOptions;
  forcedYAxisRange?: { min: number; max: number };
}

/**
 * Calculate the difference in days between two dates
 */
const getDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get the week number of a date
 */
const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Format date for display based on aggregation type
 */
const formatDateLabel = (date: string, aggregationType: 'day' | 'week' | 'month'): string => {
  const dateObj = new Date(date);
  
  switch (aggregationType) {
    case 'day':
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week ${getWeekNumber(dateObj)}`;
    case 'month':
      return dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    default:
      return date;
  }
};

/**
 * Group data points by week
 */
const groupByWeek = (data: ChartDataPoint[]): AggregatedDataPoint[] => {
  const weekMap = new Map<string, AggregatedDataPoint>();

  data.forEach(point => {
    const date = new Date(point.date);
    const weekNum = getWeekNumber(date);
    const weekKey = `${date.getFullYear()}-W${weekNum}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        label: `Week ${weekNum}`,
        value: 0,
        startDate: point.date,
        endDate: point.date,
        originalData: []
      });
    }

    const weekData = weekMap.get(weekKey)!;
    weekData.value += point.value;
    weekData.originalData.push(point);
    weekData.endDate = point.date;
  });

  return Array.from(weekMap.values());
};

/**
 * Group data points by month
 */
const groupByMonth = (data: ChartDataPoint[]): AggregatedDataPoint[] => {
  const monthMap = new Map<string, AggregatedDataPoint>();

  data.forEach(point => {
    const date = new Date(point.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: 0,
        startDate: point.date,
        endDate: point.date,
        originalData: []
      });
    }

    const monthData = monthMap.get(monthKey)!;
    monthData.value += point.value;
    monthData.originalData.push(point);
    monthData.endDate = point.date;
  });

  return Array.from(monthMap.values()).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

/**
 * Format data points for daily view
 */
const formatDailyData = (data: ChartDataPoint[]): AggregatedDataPoint[] => {
  return data.map(point => ({
    label: formatDateLabel(point.date, 'day'),
    value: point.value,
    startDate: point.date,
    endDate: point.date,
    originalData: [point]
  }));
};

/**
 * Calculate percentage changes for data points
 */
const addPercentageChanges = (data: AggregatedDataPoint[]): AggregatedDataPoint[] => {
  return data.map((point, index) => {
    if (index === 0) {
      return { ...point, percentageChange: 0 };
    }
    const previousValue = data[index - 1].value;
    const percentageChange = calculatePercentageChange(point.value, previousValue);
    return { ...point, percentageChange };
  });
};

/**
 * Process chart data based on date range and configuration
 */
export const processChartData = (
  data: ChartDataPoint[],
  startDate: string,
  endDate: string,
  config?: ChartConfig
): AggregatedDataPoint[] => {
  const daysDiff = getDaysDifference(startDate, endDate);
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let aggregatedData: AggregatedDataPoint[];

  // Use specified aggregation type or determine automatically
  const aggregationType = config?.aggregationType || (() => {
    if (daysDiff <= 31) return 'day';
    if (daysDiff <= 60) return 'week';
    if (daysDiff <= 90) return 'biweekly';
    if (daysDiff <= 365) return 'month';
    return 'quarter';
  })();

  switch (aggregationType) {
    case 'day':
      aggregatedData = formatDailyData(sortedData);
      break;
    case 'week':
      aggregatedData = groupByWeek(sortedData);
      break;
    case 'biweekly':
      aggregatedData = groupByBiWeekly(sortedData);
      break;
    case 'quarter':
      aggregatedData = groupByQuarter(sortedData);
      break;
    default:
      aggregatedData = groupByMonth(sortedData);
  }

  return config?.showPercentageChange 
    ? addPercentageChanges(aggregatedData)
    : aggregatedData;
};

/**
 * Get appropriate chart options based on data aggregation
 */
export const getChartOptions = (
  data: AggregatedDataPoint[],
  startDate: string,
  endDate: string,
  config?: ChartConfig
) => {
  const daysDiff = getDaysDifference(startDate, endDate);
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (context: TooltipItem<'line'>[]) => {
            const dataPoint = data[context[0].dataIndex];
            const dateFormat = config?.dateFormat || {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            };

            if (daysDiff <= 31) {
              return new Date(dataPoint.startDate).toLocaleDateString('en-US', dateFormat);
            }
            return `${dataPoint.label}\n${new Date(dataPoint.startDate).toLocaleDateString()} - ${new Date(dataPoint.endDate).toLocaleDateString()}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const dataPoint = data[context.dataIndex];
            const value = context.raw as number;
            const lines = [`Value: ${value.toLocaleString()}`];
            
            if (config?.showPercentageChange && dataPoint.percentageChange !== undefined) {
              lines.push(`Change: ${dataPoint.percentageChange.toFixed(1)}%`);
            }
            
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: daysDiff > 31 ? 0 : 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        },
        ...(config?.forcedYAxisRange && {
          min: config.forcedYAxisRange.min,
          max: config.forcedYAxisRange.max
        }),
        ticks: {
          callback: (value: number) => value.toLocaleString()
        }
      }
    }
  };
};

/**
 * Calculate percentage change between two values
 */
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Get the quarter number and year
 */
const getQuarter = (date: Date): { quarter: number; year: number } => {
  const month = date.getMonth();
  return {
    quarter: Math.floor(month / 3) + 1,
    year: date.getFullYear()
  };
};

/**
 * Group data points by bi-weekly periods
 */
const groupByBiWeekly = (data: ChartDataPoint[]): AggregatedDataPoint[] => {
  const biWeeklyMap = new Map<string, AggregatedDataPoint>();

  data.forEach(point => {
    const date = new Date(point.date);
    const weekNum = getWeekNumber(date);
    const biWeeklyNum = Math.floor((weekNum - 1) / 2);
    const biWeeklyKey = `${date.getFullYear()}-B${biWeeklyNum}`;

    if (!biWeeklyMap.has(biWeeklyKey)) {
      biWeeklyMap.set(biWeeklyKey, {
        label: `Weeks ${biWeeklyNum * 2 + 1}-${biWeeklyNum * 2 + 2}`,
        value: 0,
        startDate: point.date,
        endDate: point.date,
        originalData: []
      });
    }

    const biWeeklyData = biWeeklyMap.get(biWeeklyKey)!;
    biWeeklyData.value += point.value;
    biWeeklyData.originalData.push(point);
    biWeeklyData.endDate = point.date;
  });

  return Array.from(biWeeklyMap.values()).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

/**
 * Group data points by quarters
 */
const groupByQuarter = (data: ChartDataPoint[]): AggregatedDataPoint[] => {
  const quarterMap = new Map<string, AggregatedDataPoint>();

  data.forEach(point => {
    const date = new Date(point.date);
    const { quarter, year } = getQuarter(date);
    const quarterKey = `${year}-Q${quarter}`;

    if (!quarterMap.has(quarterKey)) {
      quarterMap.set(quarterKey, {
        label: `Q${quarter} ${year}`,
        value: 0,
        startDate: point.date,
        endDate: point.date,
        originalData: []
      });
    }

    const quarterData = quarterMap.get(quarterKey)!;
    quarterData.value += point.value;
    quarterData.originalData.push(point);
    quarterData.endDate = point.date;
  });

  return Array.from(quarterMap.values()).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

export type { AggregatedDataPoint, ChartConfig };

/**
 * Custom hook for processing chart data
 */
export const useChartData = (
  data: ChartDataPoint[],
  startDate: string,
  endDate: string,
  config?: ChartConfig
) => {
  return useMemo(() => {
    const processedData = processChartData(data, startDate, endDate, config);
    const options = getChartOptions(processedData, startDate, endDate, config);
    
    return {
      data: processedData,
      labels: processedData.map(d => d.label),
      values: processedData.map(d => d.value),
      percentageChanges: processedData.map(d => d.percentageChange),
      options,
      aggregationType: config?.aggregationType || (
        getDaysDifference(startDate, endDate) <= 31 ? 'day' :
        getDaysDifference(startDate, endDate) <= 60 ? 'week' :
        getDaysDifference(startDate, endDate) <= 90 ? 'biweekly' :
        getDaysDifference(startDate, endDate) <= 365 ? 'month' :
        'quarter'
      )
    };
  }, [data, startDate, endDate, config]);
}; 