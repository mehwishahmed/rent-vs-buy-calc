import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFExportData {
  chartTitle: string;
  chartExplanation: string;
  userInputs: any;
  aiResponse: string;
  chartElement: HTMLElement;
  insights?: string[];
  keyPoints?: string[];
}

export async function exportChartToPDF(data: PDFExportData) {
  try {
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rent vs Buy Analysis', margin, yPosition);
    yPosition += 15;

    // Add timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated on ${timestamp}`, margin, yPosition);
    yPosition += 20;

    // Add user scenario
    if (data.userInputs) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Your Scenario:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const scenarioText = `• Home Price: $${data.userInputs.homePrice?.toLocaleString() || 'N/A'}
• Current Rent: $${data.userInputs.currentRent?.toLocaleString() || 'N/A'}
• Down Payment: ${data.userInputs.downPaymentPercent || 20}%
• Interest Rate: ${data.userInputs.interestRate || 7}%
• Time Horizon: ${data.userInputs.timeHorizonYears || 10} years`;
      
      const scenarioLines = scenarioText.split('\n');
      scenarioLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Add AI response
    if (data.aiResponse) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const responseLines = pdf.splitTextToSize(data.aiResponse, pageWidth - 2 * margin);
      responseLines.forEach((line: string) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Add insights if available
    if (data.insights && data.insights.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.insights.forEach(insight => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }
        const insightLines = pdf.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin);
        insightLines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
      });
      yPosition += 10;
    }

    // Capture and add the chart
    if (data.chartElement) {
      // Check if we need a new page for the chart
      if (yPosition > pageHeight - 150) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Chart Analysis:', margin, yPosition);
      yPosition += 15;

      try {
        // Find the actual chart element within the container
        const chartElement = (data.chartElement.querySelector('.recharts-wrapper') || data.chartElement) as HTMLElement;
        
        // Capture the chart as canvas with print-friendly settings
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: chartElement.offsetWidth,
          height: chartElement.offsetHeight,
          onclone: (clonedDoc) => {
            // Make chart lines black for better printing
            const chartLines = clonedDoc.querySelectorAll('.recharts-line, .recharts-area, path[stroke]');
            chartLines.forEach((line: any) => {
              if (line.style) {
                line.style.stroke = '#000000';
                line.style.strokeWidth = '2px';
              }
            });
            
            // Make text black for better contrast
            const chartText = clonedDoc.querySelectorAll('.recharts-text, .recharts-legend-item-text, .recharts-cartesian-axis-tick-value');
            chartText.forEach((text: any) => {
              if (text.style) {
                text.style.fill = '#000000';
                text.style.color = '#000000';
              }
            });
            
            // Make grid lines darker
            const gridLines = clonedDoc.querySelectorAll('.recharts-cartesian-grid line');
            gridLines.forEach((grid: any) => {
              if (grid.style) {
                grid.style.stroke = '#666666';
                grid.style.strokeOpacity = '0.5';
              }
            });
          }
        });

        // Calculate chart dimensions to fit on page
        const chartWidth = Math.min(canvas.width, pageWidth - 2 * margin);
        const chartHeight = (canvas.height * chartWidth) / canvas.width;

        // Add chart to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
        
        yPosition += chartHeight + 10;
      } catch (error) {
        console.error('Error capturing chart:', error);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Chart could not be captured for PDF export', margin, yPosition);
        yPosition += 10;
      }
    }

    // Add footer
    const footerY = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by RentVsBuy.ai - Your AI Financial Advisor', margin, footerY);
    pdf.text('www.rentvsbuy.ai', pageWidth - margin - 30, footerY);

    // Save the PDF
    const fileName = `rent-vs-buy-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function printChart(data: PDFExportData) {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Capture the chart as image with print-friendly styling
    let chartImage = '';
    if (data.chartElement) {
      // Find the actual chart element within the container
      const chartElement = (data.chartElement.querySelector('.recharts-wrapper') || data.chartElement) as HTMLElement;
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Make chart lines black for better printing
          const chartLines = clonedDoc.querySelectorAll('.recharts-line, .recharts-area, path[stroke]');
          chartLines.forEach((line: any) => {
            if (line.style) {
              line.style.stroke = '#000000';
              line.style.strokeWidth = '2px';
            }
          });
          
          // Make text black for better contrast
          const chartText = clonedDoc.querySelectorAll('.recharts-text, .recharts-legend-item-text, .recharts-cartesian-axis-tick-value');
          chartText.forEach((text: any) => {
            if (text.style) {
              text.style.fill = '#000000';
              text.style.color = '#000000';
            }
          });
          
          // Make grid lines darker
          const gridLines = clonedDoc.querySelectorAll('.recharts-cartesian-grid line');
          gridLines.forEach((grid: any) => {
            if (grid.style) {
              grid.style.stroke = '#666666';
              grid.style.strokeOpacity = '0.5';
            }
          });
        }
      });
      chartImage = canvas.toDataURL('image/png');
    }

    // Create print-friendly HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rent vs Buy Analysis</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin: 0;
          }
          .timestamp {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-left: 4px solid #4f46e5;
            padding-left: 10px;
          }
          .scenario-item {
            margin: 5px 0;
            padding-left: 10px;
          }
          .analysis-text {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .insights {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .chart-container {
            text-align: center;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
          }
          .chart-image {
            max-width: 100%;
            height: auto;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Rent vs Buy Analysis</h1>
          <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
        </div>

        ${data.userInputs ? `
        <div class="section">
          <div class="section-title">Your Scenario</div>
          <div class="scenario-item"><strong>Home Price:</strong> $${data.userInputs.homePrice?.toLocaleString() || 'N/A'}</div>
          <div class="scenario-item"><strong>Current Rent:</strong> $${data.userInputs.currentRent?.toLocaleString() || 'N/A'}</div>
          <div class="scenario-item"><strong>Down Payment:</strong> ${data.userInputs.downPaymentPercent || 20}%</div>
          <div class="scenario-item"><strong>Interest Rate:</strong> ${data.userInputs.interestRate || 7}%</div>
          <div class="scenario-item"><strong>Time Horizon:</strong> ${data.userInputs.timeHorizonYears || 10} years</div>
        </div>
        ` : ''}

        ${data.aiResponse ? `
        <div class="section">
          <div class="section-title">Analysis</div>
          <div class="analysis-text">${data.aiResponse}</div>
        </div>
        ` : ''}

        ${data.insights && data.insights.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Insights</div>
          <div class="insights">
            ${data.insights.map(insight => `<div>• ${insight}</div>`).join('')}
          </div>
        </div>
        ` : ''}

        ${chartImage ? `
        <div class="section">
          <div class="section-title">Chart Analysis</div>
          <div class="chart-container">
            <img src="${chartImage}" alt="Rent vs Buy Chart" class="chart-image" />
          </div>
        </div>
        ` : ''}

        <div class="footer">
          Generated by RentVsBuy.ai - Your AI Financial Advisor<br>
          www.rentvsbuy.ai
        </div>
      </body>
      </html>
    `;

    // Write HTML to print window
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for image to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);

    return { success: true };
  } catch (error) {
    console.error('Error printing chart:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
