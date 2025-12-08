import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExamMeta {
  examTitle: string;
  date: string;
  classAverage: number;
  totalStudents: number;
  highestScore: number;
}

export interface StudentData {
  name: string;
  studentId: string;
  score: number;
  percentage: number;
  status: 'Pass' | 'Fail';
}

export const generateExamPDF = (examMeta: ExamMeta, studentData: StudentData[]) => {
  const doc = new jsPDF();
  const brandBlue = '#2563EB';

  // 1. Header & Logo
  doc.setFontSize(22);
  doc.setTextColor(brandBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('TestEdge', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Examination Report', 14, 26);

  // 2. Exam Summary
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(examMeta.examTitle, 14, 40);

  doc.setFontSize(10);
  doc.text(`Date: ${examMeta.date}`, 14, 46);
  
  doc.text(`Total Students: ${examMeta.totalStudents}`, 14, 54);
  doc.text(`Class Average: ${examMeta.classAverage.toFixed(2)}`, 14, 60);
  doc.text(`Highest Score: ${examMeta.highestScore}`, 80, 54);

  // 3. Student Table
  const tableColumn = ["Student Name", "ID", "Score", "Percentage (%)", "Status"];
  const tableRows: (string | number)[][] = [];

  studentData.forEach(student => {
    const studentRow = [
      student.name,
      student.studentId,
      student.score,
      student.percentage.toFixed(2),
      student.status,
    ];
    tableRows.push(studentRow);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    headStyles: {
      fillColor: brandBlue, // TestEdge Blue
      textColor: 255,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didParseCell: function(data) {
      // Logic for Status Color
      if (data.section === 'body' && data.column.index === 4) {
        const status = data.cell.raw;
        if (status === 'Fail') {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else {
             data.cell.styles.textColor = [22, 163, 74]; // Green
             data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // 4. Save
  doc.save(`${examMeta.examTitle.replace(/\s+/g, '_')}_Report.pdf`);
};
