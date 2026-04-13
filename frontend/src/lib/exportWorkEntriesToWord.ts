import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

export type WordExportEntry = {
  projectName: string;
  date: string;
  workType: string;
  taskNo: string;
  taskType: string;
  hours: string;
  description: string;
  beforeImageBase64?: string | null;
  afterImageBase64?: string | null;
};

const border = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'AAAAAA',
};

const tableBorders = {
  top: border,
  bottom: border,
  left: border,
  right: border,
  insideHorizontal: border,
  insideVertical: border,
};

function base64ToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1]! : dataUrl;
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function fieldCell(text: string, bold = false) {
  return new TableCell({
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold })],
      }),
    ],
  });
}

function fieldsTable(e: WordExportEntry) {
  const rows: { k: string; v: string }[] = [
    { k: 'Project', v: e.projectName },
    { k: 'Date', v: e.date },
    { k: 'Type', v: e.workType },
    { k: 'Task No', v: e.taskNo },
    { k: 'Task Type', v: e.taskType },
    { k: 'Total Hours', v: e.hours },
    { k: 'Description', v: e.description },
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [fieldCell(r.k, true), fieldCell(r.v)],
        }),
    ),
  });
}

function imageBlock(label: string, dataUrl?: string | null): Paragraph[] {
  if (!dataUrl) {
    return [
      new Paragraph({
        children: [new TextRun({ text: `${label}: (none)`, italics: true })],
      }),
    ];
  }
  try {
    const data = base64ToUint8Array(dataUrl);
    return [
      new Paragraph({
        children: [new TextRun({ text: `${label}`, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new ImageRun({
            data,
            transformation: { width: 280, height: 180 },
            type: dataUrl.includes('image/png') ? 'png' : 'jpg',
          }),
        ],
      }),
    ];
  } catch {
    return [
      new Paragraph({
        children: [new TextRun({ text: `${label}: (invalid image data)` })],
      }),
    ];
  }
}

function entrySection(e: WordExportEntry, isFirst: boolean) {
  const children = [
    ...(isFirst
      ? []
      : [new Paragraph({ children: [new PageBreak()] })]),
    new Paragraph({
      text: 'Work entry',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    }),
    fieldsTable(e),
    new Paragraph({ text: 'Screenshots', spacing: { before: 240, after: 120 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [...imageBlock('Before', e.beforeImageBase64)],
            }),
            new TableCell({
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [...imageBlock('After', e.afterImageBase64)],
            }),
          ],
        }),
      ],
    }),
  ];
  return children;
}

/**
 * Client-side .docx export for one or more work entries (screenshots optional, base64).
 */
export async function exportWorkEntriesToWord(
  entries: WordExportEntry[],
  fileName = 'worktrack-work-entries.docx',
): Promise<void> {
  const exportDate = new Date().toLocaleString();
  const header = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new TextRun({ text: 'WorkTrack — Work Entry Report', bold: true, size: 28 }),
      new TextRun({ text: `    |    Exported: ${exportDate}`, size: 22 }),
    ],
  });

  const body: (Paragraph | Table)[] = [header];
  entries.forEach((e, i) => {
    body.push(...(entrySection(e, i === 0) as (Paragraph | Table)[]));
  });

  const doc = new Document({
    sections: [{ children: body }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}
