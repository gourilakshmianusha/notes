
export enum NoteLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface NoteData {
  subject: string;
  topic: string;
  level: NoteLevel;
  content: string;
  timestamp: string;
}

export enum ExportType {
  PDF = 'PDF',
  WORD = 'WORD'
}
