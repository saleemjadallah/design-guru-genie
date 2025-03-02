
export const generateDummyFeedback = () => {
  return [
    {
      id: 1,
      type: "positive",
      title: "Clean layout",
      description: "The layout is well-structured and organized which makes information easy to scan."
    },
    {
      id: 2,
      type: "positive",
      title: "Good use of white space",
      description: "The spacing between elements is consistent and provides good visual separation."
    },
    {
      id: 3,
      type: "improvement",
      title: "Low contrast buttons",
      priority: "high",
      description: "Some buttons have low contrast which makes them difficult to see for users with visual impairments.",
      location: { x: 250, y: 440 },
      principle: "Accessibility",
      technical_details: "Consider using a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text."
    },
    {
      id: 4,
      type: "improvement",
      title: "Missing form labels",
      priority: "medium",
      description: "Form elements should have visible labels to improve accessibility.",
      location: { x: 300, y: 530 },
      principle: "Accessibility",
      technical_details: "Add <label> elements associated with form controls using 'for' attribute."
    }
  ];
};
