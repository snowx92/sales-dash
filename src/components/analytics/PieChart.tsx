/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from "chart.js"
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels"
import { motion } from "framer-motion"
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
    }[]
  }
}

export default function PieChart({ data }: PieChartProps) {


  // Modern color palette with gradients
  const modernColors = [
    ['rgba(255, 99, 132, 0.9)', 'rgba(255, 99, 132, 0.5)'],
    ['rgba(54, 162, 235, 0.9)', 'rgba(54, 162, 235, 0.5)'],
    ['rgba(255, 206, 86, 0.9)', 'rgba(255, 206, 86, 0.5)'],
    ['rgba(75, 192, 192, 0.9)', 'rgba(75, 192, 192, 0.5)'],
    ['rgba(153, 102, 255, 0.9)', 'rgba(153, 102, 255, 0.5)'],
    ['rgba(255, 159, 64, 0.9)', 'rgba(255, 159, 64, 0.5)']
  ]

  // Safely create gradients with error handling
  const gradients = data.labels.map((label, i) => {

    try {
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) {

        return modernColors[i % modernColors.length][0];
      }
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, modernColors[i % modernColors.length][0]);
      gradient.addColorStop(1, modernColors[i % modernColors.length][1]);

      return gradient;
    } catch (error) {

      return modernColors[i % modernColors.length][0]; // Fallback to solid color
    }
  });

  const enhancedData = {
    ...data,
    datasets: data.datasets.map(dataset => {

      
      return {
        ...dataset,
        backgroundColor: gradients,
        borderColor: 'white',
        borderWidth: 2,
        hoverBorderWidth: 0,
        hoverOffset: 15,
      };
    })
  };



  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "bold"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function (tooltipItem: TooltipItem<"pie">) {
            try {
              const label = tooltipItem.label || "";
              const value = (tooltipItem.raw as number) || 0;
              const total = (tooltipItem.dataset.data as number[]).reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1) + "%";
              return ` ${label}: ${value.toLocaleString()} (${percentage})`;
            } catch (error) {
              return "Error displaying tooltip";
            }
          },
        },
      },
      datalabels: {
        formatter: (value: number, context: Context) => {
          try {
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100);
            return percentage > 5 ? percentage.toFixed(1) + "%" : "";
          } catch (error) {

            return "";
          }
        },
        color: 'white',
        font: {
          weight: "bold",
          size: 14,
          family: "'Inter', sans-serif",
        },
        textShadow: '0px 0px 4px rgba(0, 0, 0, 0.35)',
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  } as const;



  return (
    <motion.div 
      className="h-[300px] w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Pie 
        data={enhancedData} 
        options={options}
        onError={(error) => {

        }}
      />
    </motion.div>
  )
}
