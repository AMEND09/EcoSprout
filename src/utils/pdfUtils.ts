import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Farm } from '@/types/farmTypes';
import { FinancialEntry, SustainabilityReportData } from '@/types/financialTypes';

// General formatting utility
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Improved PDF generation with better scaling and handling of financial data
export const generatePDF = async (elementId: string, title: string = 'Farm Report') => {
  try {
    // Create a temporary hidden container for better rendering
    const originalElement = document.getElementById(elementId);
    if (!originalElement) throw new Error('Element not found');
    
    // Clone the element to manipulate it for better PDF rendering
    const element = originalElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(element);
    
    // Set specific styles for the cloned element to ensure full content capture
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '1000px'; // Fixed width for consistent rendering
    element.style.transform = 'scale(1)'; // Ensure no scaling is applied
    
    // Canvas options for better quality rendering
    const options = {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 1000,
      windowHeight: element.scrollHeight
    };
    
    // Generate the canvas
    const canvas = await html2canvas(element, options);
    
    // Remove the temporary element
    document.body.removeChild(element);
    
    // Calculate dimensions while maintaining aspect ratio
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, 15, 15);
    
    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 22);
    
    // Add the image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 30, imgWidth - 20, imgHeight - 20);
    
    // Save PDF
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF report. Please try again.');
  }
};

// Enhanced function to specifically generate financial reports with proper formatting
export const generateFinancialPDF = async (
  farms: Farm[], 
  financialData: FinancialEntry[], 
  period: string = 'Current Period'
) => {
  // Create a new PDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;
  
  // Add title and date
  pdf.setFontSize(18);
  pdf.text('Financial Report', margin, yPos);
  yPos += 7;
  
  pdf.setFontSize(10);
  pdf.text(`Period: ${period} | Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;
  
  // Calculate financial summary
  const totalIncome = financialData
    .filter(entry => entry.category === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const totalExpenses = financialData
    .filter(entry => entry.category === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const roi = totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(2) + '%' : 'N/A';
  
  // Add financial summary
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
  
  pdf.setFontSize(12);
  pdf.text('Financial Summary', margin + 2, yPos + 6);
  
  pdf.setFontSize(10);
  pdf.text(`Total Income: ${formatCurrency(totalIncome)}`, margin + 5, yPos + 12);
  pdf.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, margin + 5, yPos + 18);
  pdf.text(`Net Profit: ${formatCurrency(netProfit)}`, margin + 5, yPos + 24);
  pdf.text(`ROI: ${roi}`, pageWidth - margin - 30, yPos + 24);
  
  yPos += 35;
  
  // Add farm-specific financial data
  pdf.setFontSize(12);
  pdf.text('Farm Performance', margin, yPos);
  yPos += 6;
  
  // Create table headers for farm summary
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setFontSize(8);
  pdf.text('Farm Name', margin + 2, yPos + 5);
  pdf.text('Income', margin + 50, yPos + 5);
  pdf.text('Expenses', margin + 80, yPos + 5);
  pdf.text('Profit', margin + 110, yPos + 5);
  pdf.text('ROI', margin + 140, yPos + 5);
  
  yPos += 7;
  
  // Add data for each farm
  farms.forEach(farm => {
    const farmData = financialData.filter(entry => entry.farmId === farm.id);
    const farmIncome = farmData
      .filter(entry => entry.category === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const farmExpenses = farmData
      .filter(entry => entry.category === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const farmProfit = farmIncome - farmExpenses;
    const farmROI = farmExpenses > 0 ? ((farmProfit / farmExpenses) * 100).toFixed(2) + '%' : 'N/A';
    
    pdf.setFontSize(8);
    pdf.text(farm.name, margin + 2, yPos + 5);
    pdf.text(formatCurrency(farmIncome), margin + 50, yPos + 5);
    pdf.text(formatCurrency(farmExpenses), margin + 80, yPos + 5);
    pdf.text(formatCurrency(farmProfit), margin + 110, yPos + 5);
    pdf.text(farmROI, margin + 140, yPos + 5);
    
    // Add light gray background for even rows
    if (farms.indexOf(farm) % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }
    
    yPos += 7;
    
    // Add page break if needed
    if (yPos > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPos = margin;
    }
  });
  
  yPos += 10;
  
  // Add expense breakdown by category
  if (yPos > pdf.internal.pageSize.getHeight() - 60) {
    pdf.addPage();
    yPos = margin;
  }
  
  pdf.setFontSize(12);
  pdf.text('Expense Breakdown by Category', margin, yPos);
  yPos += 6;
  
  // Calculate expenses by category
  const expensesByCategory: Record<string, number> = {};
  financialData
    .filter(entry => entry.category === 'expense')
    .forEach(entry => {
      expensesByCategory[entry.type] = (expensesByCategory[entry.type] || 0) + entry.amount;
    });
  
  // Create table headers for expense breakdown
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setFontSize(8);
  pdf.text('Category', margin + 2, yPos + 5);
  pdf.text('Amount', margin + 70, yPos + 5);
  pdf.text('% of Total', margin + 110, yPos + 5);
  
  yPos += 7;
  
  // Add expense data by category
  Object.entries(expensesByCategory).forEach(([category, amount], index) => {
    const percentage = ((amount / totalExpenses) * 100).toFixed(2) + '%';
    
    pdf.setFontSize(8);
    pdf.text(category, margin + 2, yPos + 5);
    pdf.text(formatCurrency(amount), margin + 70, yPos + 5);
    pdf.text(percentage, margin + 110, yPos + 5);
    
    // Add light gray background for even rows
    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }
    
    yPos += 7;
    
    // Add page break if needed
    if (yPos > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPos = margin;
    }
  });
  
  // Save PDF
  pdf.save('financial_report.pdf');
};

// Function to generate a comprehensive sustainability report PDF
export const generateSustainabilityPDF = async (
  farmName: string,
  data: SustainabilityReportData,
  period: string
) => {
  // Create a new PDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;
  
  // Add title and date
  pdf.setFontSize(18);
  pdf.text('Sustainability Report', margin, yPos);
  yPos += 7;
  
  pdf.setFontSize(10);
  pdf.text(`Farm: ${farmName} | Period: ${period}`, margin, yPos);
  yPos += 5;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;
  
  // Add overall score in a box
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
  
  pdf.setFontSize(12);
  pdf.text('Overall Sustainability Score', margin + 2, yPos + 7);
  
  pdf.setFontSize(18);
  pdf.setTextColor(
    data.overallScore >= 80 ? 0 : 255,
    data.overallScore >= 60 ? 128 : 0,
    0
  );
  pdf.text(`${data.overallScore}/100`, pageWidth - margin - 20, yPos + 13);
  pdf.setTextColor(0, 0, 0); // Reset text color
  
  yPos += 25;
  
  // Add detailed metrics
  pdf.setFontSize(12);
  pdf.text('Sustainability Metrics', margin, yPos);
  yPos += 6;
  
  // Create table headers for metrics
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setFontSize(8);
  pdf.text('Metric', margin + 2, yPos + 5);
  pdf.text('Score', margin + 100, yPos + 5);
  
  yPos += 7;
  
  // Add each metric
  Object.entries(data.metrics).forEach(([key, value], index) => {
    const metricName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    pdf.setFontSize(8);
    pdf.text(metricName, margin + 2, yPos + 5);
    pdf.text(`${value}%`, margin + 100, yPos + 5);
    
    // Add light gray background for even rows
    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }
    
    yPos += 7;
  });
  
  yPos += 10;
  
  // Add environmental impact
  pdf.setFontSize(12);
  pdf.text('Environmental Impact', margin, yPos);
  yPos += 6;
  
  pdf.setFontSize(9);
  pdf.text(`Water Savings: ${data.waterSavings.toLocaleString()} gallons`, margin + 5, yPos);
  yPos += 5;
  pdf.text(`Chemical Reduction: ${data.chemicalReduction}%`, margin + 5, yPos);
  yPos += 5;
  pdf.text(`Organic Practices Adoption: ${data.organicPracticesAdoption}%`, margin + 5, yPos);
  yPos += 10;
  
  // Add recommendations
  pdf.setFontSize(12);
  pdf.text('Recommendations', margin, yPos);
  yPos += 6;
  
  pdf.setFontSize(9);
  data.recommendations.forEach(recommendation => {
    if (yPos > pdf.internal.pageSize.getHeight() - margin - 10) {
      pdf.addPage();
      yPos = margin;
    }
    pdf.text(`• ${recommendation}`, margin + 5, yPos);
    yPos += 5;
  });
  
  yPos += 10;
  
  // Add trends if there's enough space, otherwise add a new page
  if (yPos > pdf.internal.pageSize.getHeight() - 60) {
    pdf.addPage();
    yPos = margin;
  }
  
  pdf.setFontSize(12);
  pdf.text('Sustainability Trends', margin, yPos);
  yPos += 6;
  
  // Create table for trends
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setFontSize(8);
  pdf.text('Period', margin + 2, yPos + 5);
  pdf.text('Score', margin + 100, yPos + 5);
  
  yPos += 7;
  
  // Add trend data
  data.trends.forEach((trend, index) => {
    pdf.setFontSize(8);
    pdf.text(trend.period, margin + 2, yPos + 5);
    pdf.text(`${trend.score}%`, margin + 100, yPos + 5);
    
    // Add light gray background for even rows
    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }
    
    yPos += 7;
  });
  
  // Add footer
  const footerPosition = pdf.internal.pageSize.getHeight() - 10;
  pdf.setFontSize(8);
  pdf.text('This report is generated based on farm data and sustainability metrics.', margin, footerPosition);
  
  // Save PDF
  pdf.save('sustainability_report.pdf');
};

// Add the generatePerformancePDF function to the existing pdfUtils.ts file

export const generatePerformancePDF = async (
  farmName: string,
  performanceData: any,
  period: string = 'Current Period',
  metricType: string = 'yields'
) => {
  // Create a new PDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;
  
  // Add title and date
  pdf.setFontSize(18);
  pdf.text(`Farm Performance Report: ${metricType.toUpperCase()}`, margin, yPos);
  yPos += 7;
  
  pdf.setFontSize(10);
  pdf.text(`Farm: ${farmName} | Period: ${period} | Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;
  
  // Add report summary based on metric type
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
  
  pdf.setFontSize(12);
  pdf.text('Performance Summary', margin + 2, yPos + 6);
  
  yPos += 10;
  pdf.setFontSize(10);
  
  switch (metricType) {
    case 'yields':
      const yieldData = performanceData.yields;
      const avgCurrent = yieldData.reduce((sum: number, item: any) => sum + item.current, 0) / yieldData.length;
      const avgPrevious = yieldData.reduce((sum: number, item: any) => sum + item.previous, 0) / yieldData.length;
      const avgTarget = yieldData.reduce((sum: number, item: any) => sum + item.target, 0) / yieldData.length;
      const yieldChange = ((avgCurrent - avgPrevious) / avgPrevious) * 100;
      
      pdf.text(`Average Current Yield: ${avgCurrent.toFixed(2)} bushels`, margin + 5, yPos);
      pdf.text(`Average Previous Yield: ${avgPrevious.toFixed(2)} bushels`, margin + 5, yPos + 6);
      pdf.text(`Yield Change: ${yieldChange >= 0 ? '+' : ''}${yieldChange.toFixed(2)}%`, margin + 5, yPos + 12);
      pdf.text(`Target Achievement: ${((avgCurrent / avgTarget) * 100).toFixed(2)}%`, pageWidth - margin - 70, yPos + 12);
      break;
      
    case 'water':
      const waterData = performanceData.water;
      const totalUsage = waterData.reduce((sum: number, item: any) => sum + item.usage, 0);
      const totalOptimal = waterData.reduce((sum: number, item: any) => sum + item.optimal, 0);
      const waterEfficiency = (totalOptimal / totalUsage) * 100;
      
      pdf.text(`Total Water Usage: ${totalUsage.toLocaleString()} gallons`, margin + 5, yPos);
      pdf.text(`Optimal Usage: ${totalOptimal.toLocaleString()} gallons`, margin + 5, yPos + 6);
      pdf.text(`Water Efficiency: ${waterEfficiency.toFixed(2)}%`, margin + 5, yPos + 12);
      pdf.text(`Potential Savings: ${(totalUsage - totalOptimal).toLocaleString()} gallons`, pageWidth - margin - 80, yPos + 12);
      break;
      
    case 'costs':
      const costData = performanceData.costs;
      const totalCosts = costData.reduce((sum: number, item: any) => sum + item.value, 0);
      const highestCategory = costData.reduce((prev: any, current: any) => 
        (prev.value > current.value) ? prev : current);
      
      pdf.text(`Total Costs: $${totalCosts.toLocaleString()}`, margin + 5, yPos);
      pdf.text(`Highest Cost Category: ${highestCategory.name} ($${highestCategory.value.toLocaleString()})`, margin + 5, yPos + 6);
      pdf.text(`Percentage: ${((highestCategory.value / totalCosts) * 100).toFixed(2)}%`, margin + 5, yPos + 12);
      break;
      
    case 'quality':
      const qualityData = performanceData.quality;
      const avgQuality = qualityData.reduce((sum: number, item: any) => sum + item.A, 0) / qualityData.length;
      const avgPrevQuality = qualityData.reduce((sum: number, item: any) => sum + item.B, 0) / qualityData.length;
      const qualityChange = ((avgQuality - avgPrevQuality) / avgPrevQuality) * 100;
      
      pdf.text(`Average Quality Score: ${avgQuality.toFixed(2)}/100`, margin + 5, yPos);
      pdf.text(`Previous Average: ${avgPrevQuality.toFixed(2)}/100`, margin + 5, yPos + 6);
      pdf.text(`Quality Change: ${qualityChange >= 0 ? '+' : ''}${qualityChange.toFixed(2)}%`, margin + 5, yPos + 12);
      break;
  }
  
  yPos += 35;
  
  // Add detailed performance data for the selected metric
  pdf.setFontSize(12);
  pdf.text('Detailed Performance Data', margin, yPos);
  yPos += 6;
  
  // Create table headers
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setFontSize(8);
  
  switch (metricType) {
    case 'yields':
      pdf.text('Crop', margin + 2, yPos + 5);
      pdf.text('Current Yield', margin + 50, yPos + 5);
      pdf.text('Previous Yield', margin + 90, yPos + 5);
      pdf.text('Target', margin + 130, yPos + 5);
      pdf.text('% of Target', margin + 160, yPos + 5);
      
      yPos += 7;
      
      // Add data for each crop
      performanceData.yields.forEach((crop: any, index: number) => {
        const percentOfTarget = (crop.current / crop.target) * 100;
        
        pdf.setFontSize(8);
        pdf.text(crop.name, margin + 2, yPos + 5);
        pdf.text(`${crop.current} bushels`, margin + 50, yPos + 5);
        pdf.text(`${crop.previous} bushels`, margin + 90, yPos + 5);
        pdf.text(`${crop.target} bushels`, margin + 130, yPos + 5);
        pdf.text(`${percentOfTarget.toFixed(1)}%`, margin + 160, yPos + 5);
        
        // Add light gray background for even rows
        if (index % 2 === 1) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        }
        
        yPos += 7;
        
        // Add page break if needed
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      });
      break;
      
    case 'water':
      pdf.text('Month', margin + 2, yPos + 5);
      pdf.text('Usage (gallons)', margin + 50, yPos + 5);
      pdf.text('Optimal (gallons)', margin + 90, yPos + 5);
      pdf.text('Efficiency', margin + 130, yPos + 5);
      
      yPos += 7;
      
      // Add data for each month
      performanceData.water.forEach((month: any, index: number) => {
        pdf.setFontSize(8);
        pdf.text(month.date, margin + 2, yPos + 5);
        pdf.text(month.usage.toLocaleString(), margin + 50, yPos + 5);
        pdf.text(month.optimal.toLocaleString(), margin + 90, yPos + 5);
        pdf.text(`${month.efficiency.toFixed(1)}%`, margin + 130, yPos + 5);
        
        // Add light gray background for even rows
        if (index % 2 === 1) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        }
        
        yPos += 7;
        
        // Add page break if needed
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      });
      break;
      
    case 'costs':
      pdf.text('Category', margin + 2, yPos + 5);
      pdf.text('Amount ($)', margin + 70, yPos + 5);
      pdf.text('% of Total', margin + 110, yPos + 5);
      
      yPos += 7;
      
      // Calculate total
      const totalCost = performanceData.costs.reduce((sum: number, item: any) => sum + item.value, 0);
      
      // Add data for each cost category
      performanceData.costs.forEach((category: any, index: number) => {
        const percentage = (category.value / totalCost) * 100;
        
        pdf.setFontSize(8);
        pdf.text(category.name, margin + 2, yPos + 5);
        pdf.text(category.value.toLocaleString(), margin + 70, yPos + 5);
        pdf.text(`${percentage.toFixed(1)}%`, margin + 110, yPos + 5);
        
        // Add light gray background for even rows
        if (index % 2 === 1) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        }
        
        yPos += 7;
        
        // Add page break if needed
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      });
      break;
      
    case 'quality':
      pdf.text('Metric', margin + 2, yPos + 5);
      pdf.text('Current Score', margin + 70, yPos + 5);
      pdf.text('Previous Score', margin + 110, yPos + 5);
      pdf.text('Change', margin + 150, yPos + 5);
      
      yPos += 7;
      
      // Add data for each quality metric
      performanceData.quality.forEach((metric: any, index: number) => {
        const change = metric.A - metric.B;
        
        pdf.setFontSize(8);
        pdf.text(metric.subject, margin + 2, yPos + 5);
        pdf.text(`${metric.A.toFixed(1)}/100`, margin + 70, yPos + 5);
        pdf.text(`${metric.B.toFixed(1)}/100`, margin + 110, yPos + 5);
        pdf.text(`${change >= 0 ? '+' : ''}${change.toFixed(1)}`, margin + 150, yPos + 5);
        
        // Add light gray background for even rows
        if (index % 2 === 1) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        }
        
        yPos += 7;
        
        // Add page break if needed
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      });
      break;
  }
  
  yPos += 15;
  
  // Add recommendations section
  if (yPos > pdf.internal.pageSize.getHeight() - 60) {
    pdf.addPage();
    yPos = margin;
  }
  
  pdf.setFontSize(12);
  pdf.text('Recommendations', margin, yPos);
  yPos += 10;
  
  pdf.setFontSize(9);
  
  const recommendations: { [key: string]: string[] } = {
    'yields': [
      "Increase plant density in southeast fields",
      "Adjust harvest timing based on weather patterns",
      "Consider additional soil amendments in low-performing areas",
      "Evaluate seed varieties for better performance in your specific soil conditions",
      "Implement better pest management strategies to reduce crop loss"
    ],
    'water': [
      "Expand drip irrigation to northern fields",
      "Implement soil moisture sensors in dry areas",
      "Adjust watering schedule based on forecast data",
      "Consider water-retaining soil amendments",
      "Install rainwater harvesting systems for auxiliary water supply"
    ],
    'costs': [
      "Negotiate volume discounts with seed suppliers",
      "Consider equipment sharing for seasonal machinery",
      "Implement fuel efficiency training for operators",
      "Review and consolidate insurance policies",
      "Explore cooperative purchasing options with neighboring farms"
    ],
    'quality': [
      "Improve post-harvest handling procedures",
      "Update storage facility temperature controls",
      "Implement more precise grading standards",
      "Consider humidity control in storage facilities",
      "Review transportation methods to minimize product damage"
    ]
  };
  
  // Add the recommendations for the selected metric
  recommendations[metricType].forEach((recommendation, index) => {
    pdf.text(`${index + 1}. ${recommendation}`, margin + 5, yPos);
    yPos += 6;
  });
  
  // Add footer
  const footerPosition = pdf.internal.pageSize.getHeight() - 10;
  pdf.setFontSize(8);
  pdf.text('This report is generated based on farm data and performance metrics.', margin, footerPosition);
  
  // Save PDF
  pdf.save(`${metricType}_performance_report.pdf`);
};
