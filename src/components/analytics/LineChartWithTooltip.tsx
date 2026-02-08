"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  Filler,
  TimeScale,
  ScriptableContext,
} from "chart.js"
import { motion } from "framer-motion"
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
)

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
  dates?: string[];
}

interface LineChartWithTooltipProps {
  title: string;
  datasets: Dataset[];
  dateRange: {
    from: string;
    to: string;
  };
  showPercentage?: boolean;
  dates?: string[];
}

export default function LineChartWithTooltip({
  title,
  datasets,
  dateRange,
  dates: explicitDates,
}: LineChartWithTooltipProps)
{
  const getDaysBetweenDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getYearsBetweenDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end.getFullYear() - start.getFullYear();
  };

  const getTimeUnit = () => {
    const days = getDaysBetweenDates(dateRange.from, dateRange.to);
    const years = getYearsBetweenDates(dateRange.from, dateRange.to);

    if (years >= 2) return 'year' as const;
    if (days > 90) return 'month' as const;
    if (days > 31) return 'week' as const;
    return 'day' as const;
  };

  const generateDateLabels = () => {
    const days = getDaysBetweenDates(dateRange.from, dateRange.to);
    const labels = [];
    const start = new Date(dateRange.from);

    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      labels.push(date.toISOString().split('T')[0]);
    }

    return labels;
  };

  const dateLabels = explicitDates && explicitDates.length > 0 ? explicitDates : generateDateLabels();
  const timeUnit = getTimeUnit();

  const chartData = {
    labels: dateLabels,
    datasets: datasets.map(dataset => {
      let finalData = dataset.data;

      if (!explicitDates || explicitDates.length === 0) {
        const totalDays = getDaysBetweenDates(dateRange.from, dateRange.to);
        const stepSize = Math.floor(totalDays / (dataset.data.length - 1));

        const distributedData = new Array(dateLabels.length).fill(null);
        dataset.data.forEach((value, index) => {
          const dayIndex = index * stepSize;
          if (dayIndex < dateLabels.length) {
            distributedData[dayIndex] = value;
          }
        });

        finalData = distributedData;
      }

      return {
        ...dataset,
        data: finalData,
        tension: 0.4,
        borderWidth: 2,
        fill: true,
        pointHoverBorderWidth: 2,
        pointBorderColor: dataset.borderColor,
        pointBackgroundColor: 'white',
        pointBorderWidth: 2,
        pointHoverBorderColor: dataset.borderColor,
        pointHoverBackgroundColor: 'white',
        backgroundColor: dataset.backgroundColor.replace(/[\d.]+\)$/, '0.05)'),
        spanGaps: true,
        datalabels: {
          display: false
        }
      };
    })
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 400
          },
          color: '#64748b'
        }
      },
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        intersect: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: 400
        },
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: 700
        },
        displayColors: true,
        callbacks: {
          title: (context: TooltipItem<"line">[]) => {
            const date = new Date(context[0].label);
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: function(context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          },
          labelPointStyle: function() {
            return {
              pointStyle: 'circle' as const,
              rotation: 0
            };
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timeUnit,
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
            year: 'yyyy'
          },
          tooltipFormat: 'PP'
        },
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500
          },
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear' as const,
        grid: {
          display: true,
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500
          },
          color: '#94a3b8',
          padding: 8,
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              }
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return value.toLocaleString();
            }
            return value;
          },
          display: true
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest' as const,
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 2,
        hoverRadius: 6,
        hitRadius: 8,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: function(context: ScriptableContext<"line">) {
          return context.dataset.borderColor as string;
        }
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="px-5 pb-4">
          <div className="h-[300px] w-full">
            {datasets?.length > 0 && datasets[0]?.data?.length > 0 ? (
              <Line
                options={options}
                data={chartData}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                No data available for chart
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
