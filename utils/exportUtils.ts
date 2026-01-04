
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import saveAs from "file-saver";

export const downloadAsPDF = (title: string, content: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  // Add Title
  doc.setFontSize(22);
  doc.setTextColor(14, 165, 233); // primary-500
  doc.text(title, margin, 30);
  
  // Clean markdown basic markers for simple PDF
  const cleanContent = content
    .replace(/[#*`]/g, '')
    .split('\n');

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // slate-800
  
  let yPosition = 45;
  const lineHeight = 7;

  cleanContent.forEach((line) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (line.trim() === '') {
      yPosition += lineHeight / 2;
      return;
    }

    const lines = doc.splitTextToSize(line, maxLineWidth);
    lines.forEach((l: string) => {
      doc.text(l, margin, yPosition);
      yPosition += lineHeight;
    });
  });

  doc.save(`${title.replace(/\s+/g, '_')}_Notes.pdf`);
};

export const downloadAsWord = async (title: string, content: string) => {
  const cleanLines = content.split('\n');
  
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
    ...cleanLines.map(line => {
      // Basic markdown parsing to Word formatting
      const isHeading = line.startsWith('#');
      const text = line.replace(/^#+\s*/, '').replace(/[*`]/g, '');
      
      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: isHeading || line.includes('**'),
          }),
        ],
        spacing: { before: isHeading ? 240 : 120, after: 120 },
        heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
      });
    })
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, '_')}_Notes.docx`);
};
