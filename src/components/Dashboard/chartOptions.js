// Utilidad para formatear moneda
const formatearMoneda = (valor) => {
  if (!valor) return '0.00'
  return parseFloat(valor).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}


export const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { 
      position: 'top',
      labels: { font: { size: 12, weight: 'bold' } }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: Q ${formatearMoneda(ctx.parsed.y)}`
      }
    }
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `Q ${formatearMoneda(value)}`
      }
    }
  },
  // ✅ Animación correcta de la tensión (curvatura de la línea)
  animations: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 1,   // muy curvada
      to: 0,     // recta
      loop: true // en bucle
    }
  }
};


export const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `Órdenes: ${ctx.parsed.y}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutBounce'
  }
}

export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { 
      position: 'bottom',
      labels: { font: { size: 11 } }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((ctx.parsed / total) * 100).toFixed(1)
          return `${ctx.label}: ${ctx.parsed} órdenes (${percentage}%)`
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutCirc'
  }
}

export const tendenciaChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: { 
      position: 'top',
      labels: { font: { size: 12, weight: 'bold' } }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: Q ${formatearMoneda(ctx.parsed.y)}`
      }
    }
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `Q ${formatearMoneda(value)}`
      }
    }
  },
 animations: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 1,   // muy curvada
      to: 0,     // recta
      loop: true // en bucle
    }
  }
}
