
export type Annotation = {
  id: number;
  x: number;
  y: number;
  priority?: "low" | "medium" | "high";
};

export type AnnotationCanvasProps = {
  image: string;
  onSave: (annotations: Annotation[]) => void;
  annotations?: Annotation[];
  selectedIssue?: number | null;
  onIssueSelect?: (id: number | null) => void;
  displayNumberMap?: Map<number, number>;
};
