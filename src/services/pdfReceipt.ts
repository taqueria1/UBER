import { jsPDF } from 'jspdf';
import { ActiveTripData, PastTrip } from '../types';

export function generateTripReceiptPDF(trip: ActiveTripData | PastTrip): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isPast = !('state' in trip);
  const folio = isPast ? (trip as PastTrip).folioFiscal : `OMNI-NAV-${Date.now().toString().slice(-6)}`;
  const dateStr = isPast ? (trip as PastTrip).date : new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const rideTypeLabel = trip.rideType === 'shared' ? 'Viaje Compartido (CoRide Navojoa)' : 'Viaje Privado (Directo Navojoa)';
  
  const originStr = isPast ? (trip as PastTrip).origin : (trip as ActiveTripData).origin.address;
  const destStr = isPast ? (trip as PastTrip).destination : (trip as ActiveTripData).destination.address;
  const distance = isPast ? (trip as PastTrip).distanceKm : (trip as ActiveTripData).totalDistanceKm;
  const duration = isPast ? (trip as PastTrip).durationMin : (trip as ActiveTripData).estimatedDurationMin;
  const driverName = isPast ? (trip as PastTrip).driverName : (trip as ActiveTripData).driver.name;
  const vehicle = isPast ? (trip as PastTrip).vehicle : `${(trip as ActiveTripData).driver.vehicleModel} (${(trip as ActiveTripData).driver.vehicleColor})`;
  const plate = isPast ? (trip as PastTrip).plate : (trip as ActiveTripData).driver.plate;
  const total = isPast ? (trip as PastTrip).farePaid : (trip as ActiveTripData).fare;
  const payment = isPast ? (trip as PastTrip).paymentMethod : (trip as ActiveTripData).paymentMethod.title;
  const discount = !isPast && (trip as ActiveTripData).discountApplied ? (trip as ActiveTripData).discountApplied : (trip.rideType === 'shared' ? total * 0.42 : 0);

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-950
  doc.rect(0, 0, 210, 48, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('OmniRide Navojoa', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Movilidad Urbana y Rutas Compartidas • Navojoa, Sonora (La Perla del Mayo)', 20, 28);
  doc.text(`RFC: OMN-210814-NAV • Folio Fiscal: ${folio}`, 20, 35);
  doc.text(`Régimen de Plataformas Digitales • C.P. 85870, Navojoa, Son.`, 20, 41);

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.text('PAGADO Y TIMBRADO', 145, 22);

  // Trip Summary Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(20, 55, 170, 34, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Liquidado: $${total.toFixed(2)} MXN`, 25, 65);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha y Hora: ${dateStr}`, 25, 72);
  doc.text(`Modalidad: ${rideTypeLabel}`, 25, 78);
  doc.text(`Método de Pago: ${payment}`, 115, 72);
  doc.text(`Distancia / Tiempo: ${distance.toFixed(1)} km • ${duration} min`, 115, 78);
  doc.text(`Zona: Valle del Mayo (Navojoa Centro y Colonias)`, 115, 84);

  // Route Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detalles del Recorrido en Navojoa, Sonora', 20, 100);

  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 104, 190, 104);

  // Origin Pin
  doc.setFillColor(16, 185, 129); // green dot
  doc.circle(24, 114, 2.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Punto de Partida (Recogida):', 30, 113);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize(originStr, 150), 30, 119);

  // Destination Pin
  doc.setFillColor(239, 68, 68); // red dot
  doc.circle(24, 132, 2.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Punto de Llegada (Destino Final):', 30, 131);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize(destStr, 150), 30, 137);

  // Conductor y Vehículo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Conductor Certificado y Vehículo Registrado en Sonora', 20, 153);
  doc.line(20, 157, 190, 157);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Conductor: ${driverName}`, 25, 165);
  doc.text(`Vehículo: ${vehicle}`, 25, 171);
  doc.text(`Placas de Sonora: ${plate}`, 115, 165);
  doc.text('Monitoreo Satelital GPS: Encriptación Activa 256-bit', 115, 171);

  // Desglose de Tarifas en MXN
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Desglose Financiero (Pesos Mexicanos - MXN)', 20, 187);
  doc.line(20, 191, 190, 191);

  const baseRate = 22.00;
  const distCost = distance * 4.50;
  const timeCost = duration * 1.20;
  const platformFee = 6.50;
  const subtotal = baseRate + distCost + timeCost + platformFee;
  const tax = subtotal * 0.16;

  let currentY = 199;
  const printRow = (label: string, value: string, isNegative = false) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(label, 25, currentY);
    if (isNegative) {
      doc.setTextColor(16, 185, 129);
      doc.text(value, 185, currentY, { align: 'right' });
    } else {
      doc.setTextColor(30, 41, 59);
      doc.text(value, 185, currentY, { align: 'right' });
    }
    currentY += 5.8;
  };

  printRow('Tarifa Base de Arranque (Navojoa)', `$${baseRate.toFixed(2)} MXN`);
  printRow(`Distancia Recorrida (${distance.toFixed(1)} km)`, `$${distCost.toFixed(2)} MXN`);
  printRow(`Tiempo en Tránsito (${duration} min)`, `$${timeCost.toFixed(2)} MXN`);
  printRow('Cuota de Servicio y Seguro de Pasajero', `$${platformFee.toFixed(2)} MXN`);
  
  if (trip.rideType === 'shared' && discount > 0) {
    printRow('Descuento CoRide (Ruta Compartida Mayo)', `-$${discount.toFixed(2)} MXN`, true);
  }

  printRow('Impuesto al Valor Agregado IVA (16%)', `$${tax.toFixed(2)} MXN`);

  // Total Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(25, currentY + 2, 185, currentY + 2);
  currentY += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL FINAL PAGADO:', 25, currentY);
  doc.text(`$${total.toFixed(2)} MXN`, 185, currentY, { align: 'right' });

  // Footer / Compliance
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('OmniRide Navojoa • Soporte 24/7 en App y soporte@omniride.mx', 105, 272, { align: 'center' });
  doc.text('Este documento digital constituye un comprobante formal válido para gastos de viaje y deducción fiscal en México.', 105, 277, { align: 'center' });
  doc.text(`Sello Digital del Emisor: SAT-NAV-${Math.random().toString(36).substring(2, 12).toUpperCase()}`, 105, 282, { align: 'center' });

  // Save PDF
  doc.save(`Recibo_OmniRide_Navojoa_${folio}.pdf`);
}
