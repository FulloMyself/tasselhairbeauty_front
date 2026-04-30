// Generate and download payslip as PDF (using print)
export const downloadPayslip = (payroll, staffName) => {
  const payslipHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payslip - ${staffName} - ${payroll.payrollPeriod}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #9a8060; padding-bottom: 20px; }
        .header h1 { color: #9a8060; margin: 0; font-size: 24px; }
        .header h2 { color: #666; margin: 5px 0; font-size: 16px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .info-box { margin-bottom: 10px; }
        .info-box strong { color: #9a8060; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1a1a18; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; font-size: 18px; color: #9a8060; border-top: 2px solid #9a8060; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        .positive { color: #065f46; }
        .negative { color: #991b1b; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tassel Hair & Beauty Studio</h1>
        <h2>Employee Payslip</h2>
        <p>101 Bellairs Drive, Glenvista, Johannesburg South</p>
      </div>
      
      <div class="info-row">
        <div class="info-box">
          <p><strong>Employee:</strong> ${staffName}</p>
          <p><strong>Period:</strong> ${payroll.payrollPeriod}</p>
          <p><strong>Payment Date:</strong> ${payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : 'Pending'}</p>
        </div>
        <div class="info-box">
          <p><strong>Status:</strong> <span style="text-transform: capitalize;">${payroll.status}</span></p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr><th>Description</th><th style="text-align: right;">Amount (R)</th></tr>
        </thead>
        <tbody>
          <tr><td>Base Salary</td><td style="text-align: right;">R${(payroll.baseSalary || 0).toFixed(2)}</td></tr>
          <tr><td>Bonuses</td><td style="text-align: right;" class="positive">+R${(payroll.bonuses || 0).toFixed(2)}</td></tr>
          <tr><td>Deductions</td><td style="text-align: right;" class="negative">-R${(payroll.deductions || 0).toFixed(2)}</td></tr>
          <tr><td>Leave Deductions</td><td style="text-align: right;" class="negative">-R${(payroll.leaveDeductions || 0).toFixed(2)}</td></tr>
          <tr><td colspan="2" style="text-align: right;" class="total">Total: R${(payroll.totalEarnings || 0).toFixed(2)}</td></tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>Tassel Hair & Beauty Studio • 101 Bellairs Drive, Glenvista • 072 960 5153</p>
        <p>This is a computer-generated document. No signature required.</p>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(payslipHTML);
  printWindow.document.close();
};

// Generate and download payroll report (for admin)
export const downloadPayrollReport = (payrolls, period = 'all') => {
  const filtered = period === 'all' ? payrolls : payrolls.filter(p => p.payrollPeriod === period);
  const totalPaid = filtered.reduce((sum, p) => sum + (p.totalEarnings || 0), 0);
  
  let rows = '';
  filtered.forEach(p => {
    rows += `
      <tr>
        <td>${p.staffName || 'N/A'}</td>
        <td>${p.payrollPeriod || 'N/A'}</td>
        <td style="text-align: right;">R${(p.baseSalary || 0).toFixed(2)}</td>
        <td style="text-align: right;">R${(p.bonuses || 0).toFixed(2)}</td>
        <td style="text-align: right;">R${((p.deductions || 0) + (p.leaveDeductions || 0)).toFixed(2)}</td>
        <td style="text-align: right; font-weight: bold;">R${(p.totalEarnings || 0).toFixed(2)}</td>
        <td>${p.status || 'N/A'}</td>
      </tr>`;
  });

  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payroll Report - Tassel Hair & Beauty Studio</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #9a8060; padding-bottom: 20px; }
        .header h1 { color: #9a8060; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #1a1a18; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .summary { margin-top: 20px; padding: 15px; background: #f5f0eb; border-radius: 8px; }
        .summary h3 { color: #9a8060; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tassel Hair & Beauty Studio</h1>
        <h2>Payroll Report</h2>
        <p>Period: ${period === 'all' ? 'All Records' : period}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <table>
        <thead>
          <tr><th>Staff Member</th><th>Period</th><th style="text-align: right;">Base Salary</th><th style="text-align: right;">Bonuses</th><th style="text-align: right;">Deductions</th><th style="text-align: right;">Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align: center;">No records found</td></tr>'}
        </tbody>
      </table>
      
      <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Records:</strong> ${filtered.length}</p>
        <p><strong>Total Paid Out:</strong> R${totalPaid.toFixed(2)}</p>
        <p><strong>Paid Records:</strong> ${filtered.filter(p => p.status === 'paid').length}</p>
        <p><strong>Pending Records:</strong> ${filtered.filter(p => p.status === 'draft').length}</p>
      </div>
      
      <div class="footer">
        <p>Tassel Hair & Beauty Studio • 101 Bellairs Drive, Glenvista • 072 960 5153</p>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(reportHTML);
  printWindow.document.close();
};