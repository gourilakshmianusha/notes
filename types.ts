
export interface NoteData {
  subject: string;
  topic: string;
  content: string;
  timestamp: string;
}

export enum ExportType {
  PDF = 'PDF',
  WORD = 'WORD'
}
