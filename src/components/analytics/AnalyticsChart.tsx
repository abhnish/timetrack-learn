import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartProps {
  period: 'week' | 'month' | 'semester';
}

export default function AnalyticsChart({ period }: AnalyticsChartProps) {
  const mockData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      attendance: [85, 92, 78, 90, 88, 65, 45],
      engagement: [75, 82, 70, 85, 80, 55, 35],
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      attendance: [87, 89, 85, 91],
      engagement: [78, 83, 79, 86],
    },
    semester: {
      labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
      attendance: [88, 85, 90, 87],
      engagement: [80, 77, 85, 82],
    },
  };

  const data = mockData[period];

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: data.attendance,
        borderColor: 'hsl(245, 75%, 52%)',
        backgroundColor: 'hsla(245, 75%, 52%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(245, 75%, 52%)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Engagement Rate (%)',
        data: data.engagement,
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(142, 76%, 36%)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'hsl(222, 84%, 4.9%)',
        bodyColor: 'hsl(222, 84%, 4.9%)',
        borderColor: 'hsl(245, 75%, 52%)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          color: 'hsl(215, 16%, 47%)',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'hsl(245, 25%, 92%)',
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          color: 'hsl(215, 16%, 47%)',
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}