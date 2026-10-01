import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  VerticalAlign,
} from "docx";

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Export Timetable as a publication-ready PDF in Landscape A4 format
 */
export function exportTimetableToPdf({
  academicYear,
  scheme,
  semester,
  section,
  classCoordinator,
  roomNo,
  effectiveDate,
  timeSlots,
  grid,
  courses,
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  let currentY = 12;

  // 1. College Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 30, 60);
  doc.text("ALVA'S INSTITUTE OF ENGINEERING & TECHNOLOGY", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text("(A Unit of Alva's Education Foundation)", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 4;
  doc.text(
    "Shobhavana Campus, Mijar, Moodbidri, D.K - 574225 (Accredited by NAAC with A+ Grade)",
    pageWidth / 2,
    currentY,
    { align: "center" }
  );

  currentY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 30, 60);
  doc.text(
    "DEPARTMENT OF CSE (IoT & Cyber Security Including Blockchain)",
    pageWidth / 2,
    currentY,
    { align: "center" }
  );

  currentY += 5;
  doc.setFontSize(12);
  doc.text("TIME TABLE", pageWidth / 2, currentY, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(`w.e.f: ${effectiveDate || "—"}`, pageWidth - 14, currentY, { align: "right" });

  currentY += 3;

  // 2. Metadata Table
  const metaHead = [
    ["Academic Year", "Scheme", "Semester", "Section", "Class Coordinator", "Room No"],
  ];
  const metaBody = [
    [
      academicYear || "2026-27",
      scheme || "2022",
      String(semester || "—"),
      section || "A",
      classCoordinator || "—",
      roomNo || "—",
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: metaHead,
    body: metaBody,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      fontSize: 8,
      font: "helvetica",
      textColor: [20, 20, 20],
      lineColor: [40, 40, 40],
      lineWidth: 0.2,
      halign: "center",
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [240, 244, 250],
      textColor: [15, 30, 60],
      fontStyle: "bold",
    },
    bodyStyles: {
      fontStyle: "bold",
    },
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // 3. Grid Table
  const gridHead = [
    [
      { content: "Day / Time", styles: { halign: "center", fontStyle: "bold" } },
      ...timeSlots.map((slot) => ({
        content: slot.time.replace(" To ", "\nTo "),
        styles: {
          halign: "center",
          fontStyle: "bold",
          fillColor: slot.isBreak ? [245, 235, 220] : [230, 240, 250],
        },
      })),
    ],
  ];

  const gridBody = DAYS.map((day) => {
    const row = grid[day] || [];
    const rowCells = [{ content: day, styles: { halign: "center", fontStyle: "bold" } }];

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      const cell = row[i] || { subject: "", span: 1 };

      if (cell.isSpanned) continue; // covered by colSpan

      if (slot.isBreak) {
        rowCells.push({
          content: cell.subject || slot.label.toUpperCase(),
          styles: {
            halign: "center",
            fontStyle: "bold",
            fontSize: 7,
            fillColor: [252, 248, 240],
            textColor: [120, 60, 10],
          },
        });
      } else {
        rowCells.push({
          content: cell.subject || "—",
          colSpan: cell.span || 1,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fontSize: (cell.span || 1) > 1 ? 8 : 7.5,
            fillColor: (cell.span || 1) > 1 ? [240, 246, 255] : [255, 255, 255],
            textColor: [15, 30, 60],
          },
        });
      }
    }

    return rowCells;
  });

  autoTable(doc, {
    startY: currentY,
    head: gridHead,
    body: gridBody,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      fontSize: 7.5,
      font: "helvetica",
      textColor: [20, 20, 20],
      lineColor: [40, 40, 40],
      lineWidth: 0.2,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [230, 240, 250],
      textColor: [15, 30, 60],
      fontStyle: "bold",
      fontSize: 7,
    },
  });

  currentY = doc.lastAutoTable.finalY + 4;

  // 4. Allocation of Courses Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 30, 60);
  doc.text("Allocation of Courses", pageWidth / 2, currentY, { align: "center" });
  currentY += 2;

  const coursesHead = [
    [
      "Course Code",
      "Short",
      "Course Names with Course Codes",
      "Faculty Names",
      "Faculty Initial",
      "Credits",
    ],
  ];

  const coursesBody = (courses || []).map((c) => [
    c.code || "",
    c.shortName || "",
    c.name || "",
    c.faculty || "",
    c.facultyInitial || "",
    String(c.credits || "—"),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: coursesHead,
    body: coursesBody,
    margin: { left: 14, right: 14 },
    theme: "grid",
    styles: {
      fontSize: 7,
      font: "helvetica",
      textColor: [20, 20, 20],
      lineColor: [40, 40, 40],
      lineWidth: 0.2,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [240, 244, 250],
      textColor: [15, 30, 60],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 26 },
      1: { halign: "center", fontStyle: "bold", cellWidth: 20 },
      2: { halign: "left", fontStyle: "bold" },
      3: { halign: "left" },
      4: { halign: "center", fontStyle: "bold", cellWidth: 22 },
      5: { halign: "center", fontStyle: "bold", cellWidth: 16 },
    },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // Check if signatures fit on same page, else add page
  if (currentY > 195) {
    doc.addPage();
    currentY = 25;
  }

  // 5. Signatures Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 30, 60);

  const sigY = Math.min(currentY, 195);
  const leftX = 35;
  const midX = pageWidth / 2;
  const rightX = pageWidth - 35;

  doc.setLineWidth(0.3);
  doc.setDrawColor(40, 40, 40);
  doc.line(leftX - 18, sigY - 2, leftX + 18, sigY - 2);
  doc.line(midX - 18, sigY - 2, midX + 18, sigY - 2);
  doc.line(rightX - 18, sigY - 2, rightX + 18, sigY - 2);

  doc.text("COORDINATOR", leftX, sigY + 3, { align: "center" });
  doc.text("HOD", midX, sigY + 3, { align: "center" });
  doc.text("PRINCIPAL", rightX, sigY + 3, { align: "center" });

  const fileName = `Timetable_Sem_${semester || "X"}_Sec_${section || "A"}.pdf`;
  doc.save(fileName);
}

/**
 * Export Timetable as a rich Microsoft Word (.docx) Document
 */
export async function exportTimetableToDocx({
  academicYear,
  scheme,
  semester,
  section,
  classCoordinator,
  roomNo,
  effectiveDate,
  timeSlots,
  grid,
  courses,
}) {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "222222" },
  };

  // Header Paragraphs
  const titleParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "ALVA'S INSTITUTE OF ENGINEERING & TECHNOLOGY",
          bold: true,
          size: 26, // 13pt
          color: "0F1E3C",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "(A Unit of Alva's Education Foundation)",
          size: 18, // 9pt
          color: "555555",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Shobhavana Campus, Mijar, Moodbidri, D.K - 574225 (Accredited by NAAC with A+ Grade)",
          size: 17,
          color: "555555",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "DEPARTMENT OF CSE (IoT & Cyber Security Including Blockchain)",
          bold: true,
          size: 20, // 10pt
          color: "0F1E3C",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: "TIME TABLE",
          bold: true,
          underline: {},
          size: 24, // 12pt
          color: "000000",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `w.e.f: ${effectiveDate || "—"}`,
          bold: true,
          size: 18,
        }),
      ],
    }),
  ];

  // 1. Meta Table
  const metaHeaderCells = [
    "Academic Year",
    "Scheme",
    "Semester",
    "Section",
    "Class Coordinator",
    "Room No",
  ].map(
    (label) =>
      new TableCell({
        shading: { fill: "F0F4FA" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, bold: true, size: 16 })],
          }),
        ],
      })
  );

  const metaValueCells = [
    academicYear || "2026-27",
    scheme || "2022",
    String(semester || "—"),
    section || "A",
    classCoordinator || "—",
    roomNo || "—",
  ].map(
    (val) =>
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: val, bold: true, size: 16 })],
          }),
        ],
      })
  );

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: [new TableRow({ children: metaHeaderCells }), new TableRow({ children: metaValueCells })],
  });

  // 2. Main Timetable Matrix
  const gridHeadCells = [
    new TableCell({
      shading: { fill: "E6F0FA" },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Day / Time", bold: true, size: 15 })],
        }),
      ],
    }),
    ...timeSlots.map(
      (slot) =>
        new TableCell({
          shading: { fill: slot.isBreak ? "F5EBDC" : "E6F0FA" },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: slot.time, bold: true, size: 14 })],
            }),
          ],
        })
    ),
  ];

  const gridRows = [new TableRow({ children: gridHeadCells })];

  for (const day of DAYS) {
    const row = grid[day] || [];
    const rowCells = [
      new TableCell({
        shading: { fill: "F5F5F5" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: day, bold: true, size: 16 })],
          }),
        ],
      }),
    ];

    for (let idx = 0; idx < timeSlots.length; idx++) {
      const slot = timeSlots[idx];
      const cell = row[idx] || { subject: "", span: 1 };

      if (cell.isSpanned) continue;

      const span = cell.span || 1;
      const isBreak = slot.isBreak;

      rowCells.push(
        new TableCell({
          columnSpan: span,
          shading: {
            fill: isBreak ? "FCF8F0" : span > 1 ? "F0F6FF" : "FFFFFF",
          },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: cell.subject || (isBreak ? slot.label.toUpperCase() : "—"),
                  bold: true,
                  size: 15,
                  color: isBreak ? "783C0A" : "0F1E3C",
                }),
              ],
            }),
          ],
        })
      );
    }

    gridRows.push(new TableRow({ children: rowCells }));
  }

  const gridTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: gridRows,
  });

  // 3. Courses Allocation Table
  const coursesHeadCells = [
    "Course Code",
    "Short",
    "Course Names with Course Codes",
    "Faculty Names",
    "Faculty Initial",
    "Credits",
  ].map(
    (label) =>
      new TableCell({
        shading: { fill: "F0F4FA" },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: label, bold: true, size: 15 })],
          }),
        ],
      })
  );

  const courseRows = [new TableRow({ children: coursesHeadCells })];

  for (const c of courses || []) {
    courseRows.push(
      new TableRow({
        children: [
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: c.code || "", bold: true, size: 15 })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: c.shortName || "", bold: true, size: 15 })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: c.name || "", bold: true, size: 15 })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: c.faculty || "", size: 15 })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: c.facultyInitial || "", bold: true, size: 15 })],
              }),
            ],
          }),
          new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(c.credits || "—"), bold: true, size: 15 })],
              }),
            ],
          }),
        ],
      })
    );
  }

  const coursesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: courseRows,
  });

  // 4. Signatures Table
  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [new TextRun({ text: "____________________\nCOORDINATOR", bold: true, size: 16 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [new TextRun({ text: "____________________\nHOD", bold: true, size: 16 })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [new TextRun({ text: "____________________\nPRINCIPAL", bold: true, size: 16 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            orientation: PageOrientation.LANDSCAPE,
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          ...titleParagraphs,
          metaTable,
          new Paragraph({ spacing: { before: 150, after: 150 }, children: [] }),
          gridTable,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Allocation of Courses", bold: true, size: 20 })],
          }),
          coursesTable,
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          sigTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Timetable_Sem_${semester || "X"}_Sec_${section || "A"}.docx`;
  downloadBlob(blob, fileName);
}
