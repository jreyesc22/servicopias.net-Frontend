// Servicio para exportar corte de caja a PDF
// Instalar: npm install jspdf jspdf-autotable

import jsPDF from 'jspdf'
import 'jspdf-autotable'

export class ExportadorPDF {
  constructor() {
    this.doc = null
    this.pageHeight = 297 // A4 height in mm
    this.margin = 20
    this.currentY = this.margin
  }

  async exportarCorteCaja(datosCorte) {
    try {
      this.doc = new jsPDF()
      this.currentY = this.margin

      // Configurar fuentes
      this.doc.setFont('helvetica')

      // Header del documento
      this.agregarHeader(datosCorte)
      
      // Resumen general
      this.agregarResumenGeneral(datosCorte)
      
      // Resumen por tipo de pago
      this.agregarResumenTiposPago(datosCorte)
      
      // Nueva página para detalles
      this.doc.addPage()
      this.currentY = this.margin
      
      // Detalles de ingresos
      this.agregarDetalleMovimientos(datosCorte.ingresos, 'INGRESOS')
      
      // Detalles de egresos
      this.agregarDetalleMovimientos(datosCorte.egresos, 'EGRESOS')
      
      // Footer
      this.agregarFooter(datosCorte)
      
      // Descargar archivo
      const nombreArchivo = `corte_caja_${datosCorte.fecha.replace(/-/g, '')}.pdf`
      this.doc.save(nombreArchivo)
      
      return { success: true, archivo: nombreArchivo }
    } catch (error) {
      console.error('Error al generar PDF:', error)
      return { success: false, error: error.message }
    }
  }

  agregarHeader(datos) {
    const { doc } = this

    // Logo o nombre de la empresa (ajustar según tu empresa)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('SERVICOPIAS.NET', 105, this.currentY, { align: 'center' })
    
    this.currentY += 10
    doc.setFontSize(16)
    doc.text('CORTE DE CAJA DIARIO', 105, this.currentY, { align: 'center' })
    
    this.currentY += 15
    
    // Información de la fecha y empleado
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    const fechaFormateada = new Date(datos.fecha).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    doc.text(`Fecha: ${fechaFormateada}`, this.margin, this.currentY)
    doc.text(`Hora de corte: ${new Date().toLocaleTimeString('es-GT')}`, this.margin, this.currentY + 7)
    doc.text(`Empleado: ${datos.empleado || 'Sistema'}`, this.margin, this.currentY + 14)
    
    this.currentY += 25
    
    // Línea separadora
    doc.setDrawColor(0, 0, 0)
    doc.line(this.margin, this.currentY, 210 - this.margin, this.currentY)
    this.currentY += 10
  }

  agregarResumenGeneral(datos) {
    const { doc } = this

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN GENERAL', this.margin, this.currentY)
    this.currentY += 15

    // Crear tabla de resumen
    const datosTabla = [
      ['CONCEPTO', 'CANTIDAD', 'MONTO'],
      ['Total Ingresos', `${datos.resumenIngresos.ordenesPagadas + datos.resumenIngresos.abonos} movimientos`, this.formatearMoneda(datos.resumenIngresos.total)],
      ['  • Órdenes Pagadas', `${datos.resumenIngresos.ordenesPagadas}`, ''],
      ['  • Abonos', `${datos.resumenIngresos.abonos}`, ''],
      ['Total Egresos', `${datos.resumenEgresos.cantidad} movimientos`, this.formatearMoneda(datos.resumenEgresos.total)],
      ['TOTAL NETO', '', this.formatearMoneda(datos.totalNeto)]
    ]

    doc.autoTable({
      startY: this.currentY,
      head: [datosTabla[0]],
      body: datosTabla.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.row.index === datosTabla.length - 2) { // Última fila (TOTAL NETO)
          data.cell.styles.fillColor = datos.totalNeto >= 0 ? [76, 175, 80] : [255, 152, 0]
          data.cell.styles.textColor = 255
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })

    this.currentY = doc.lastAutoTable.finalY + 15
  }

  agregarResumenTiposPago(datos) {
    const { doc } = this

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN POR TIPO DE PAGO', this.margin, this.currentY)
    this.currentY += 15

    // Preparar datos para la tabla
    const datosTabla = [
      ['TIPO DE PAGO', 'INGRESOS', 'EGRESOS', 'NETO', '%']
    ]

    Object.entries(datos.resumenPorTipoPago).forEach(([id, resumen]) => {
      const porcentaje = datos.totalNeto !== 0 ? ((resumen.neto / datos.totalNeto) * 100).toFixed(1) : '0.0'
      datosTabla.push([
        resumen.nombre,
        this.formatearMoneda(resumen.ingresos),
        this.formatearMoneda(resumen.egresos),
        this.formatearMoneda(resumen.neto),
        `${porcentaje}%`
      ])
    })

    // Fila de totales
    datosTabla.push([
      'TOTALES',
      this.formatearMoneda(datos.resumenIngresos.total),
      this.formatearMoneda(datos.resumenEgresos.total),
      this.formatearMoneda(datos.totalNeto),
      '100.0%'
    ])

    doc.autoTable({
      startY: this.currentY,
      head: [datosTabla[0]],
      body: datosTabla.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' }
      },
      didParseCell: (data) => {
        const isLastRow = data.row.index === datosTabla.length - 2
        if (isLastRow) {
          data.cell.styles.fillColor = [158, 158, 158]
          data.cell.styles.textColor = 255
          data.cell.styles.fontStyle = 'bold'
        }
        
        // Colorear montos negativos
        if (data.column.index === 3 && !isLastRow) { // Columna NETO
          const valor = parseFloat(data.cell.text[0].replace(/[^\d.-]/g, ''))
          if (valor < 0) {
            data.cell.styles.textColor = [244, 67, 54] // Rojo
          } else {
            data.cell.styles.textColor = [76, 175, 80] // Verde
          }
        }
      }
    })

    this.currentY = doc.lastAutoTable.finalY + 15
  }

  agregarDetalleMovimientos(movimientos, titulo) {
    const { doc } = this

    // Verificar si necesitamos nueva página
    if (this.currentY > this.pageHeight - 60) {
      doc.addPage()
      this.currentY = this.margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`DETALLE DE ${titulo}`, this.margin, this.currentY)
    this.currentY += 15

    if (!movimientos || movimientos.length === 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('No hay movimientos registrados', this.margin, this.currentY)
      this.currentY += 20
      return
    }

    // Preparar datos para la tabla
    const datosTabla = [
      ['ID', 'HORA', 'TIPO PAGO', 'MONTO', 'EMPLEADO', 'DESCRIPCIÓN']
    ]

    movimientos.forEach(mov => {
      const hora = new Date(mov.fecha).toLocaleTimeString('es-GT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      datosTabla.push([
        mov.id.toString(),
        hora,
        mov.tipo_pago || 'N/A',
        this.formatearMoneda(mov.monto),
        mov.empleado || 'N/A',
        (mov.descripcion || '').substring(0, 30) + (mov.descripcion && mov.descripcion.length > 30 ? '...' : '')
      ])
    })

    doc.autoTable({
      startY: this.currentY,
      head: [datosTabla[0]],
      body: datosTabla.slice(1),
      theme: 'striped',
      headStyles: { 
        fillColor: titulo === 'INGRESOS' ? [76, 175, 80] : [244, 67, 54], 
        textColor: 255, 
        fontSize: 8 
      },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 30 },
        5: { cellWidth: 65 }
      },
      margin: { left: this.margin, right: this.margin },
      pageBreak: 'auto'
    })

    this.currentY = doc.lastAutoTable.finalY + 15
  }

  agregarFooter(datos) {
    const { doc } = this
    const pageCount = doc.internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer con número de página
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${pageCount}`,
        210 - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      )
      
      // Firma en la última página
      if (i === pageCount) {
        const firmaY = this.pageHeight - 40
        
        doc.setFontSize(10)
        doc.text('_________________________', this.margin, firmaY)
        doc.text('Firma del Responsable', this.margin, firmaY + 8)
        
        doc.text('_________________________', 120, firmaY)
        doc.text('Firma del Supervisor', 120, firmaY + 8)
        
        // Sello o código QR (opcional)
        doc.setFontSize(8)
        doc.text(
          `Generado el ${new Date().toLocaleString('es-GT')}`,
          105,
          this.pageHeight - 5,
          { align: 'center' }
        )
      }
    }
  }

  formatearMoneda(monto) {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(monto)
  }
}

// Función helper para usar en los componentes
export const exportarCorteCajaPDF = async (datosCorte) => {
  const exportador = new ExportadorPDF()
  return await exportador.exportarCorteCaja(datosCorte)
}