
export const generateDummyFeedback = () => {
  return [
    // Positive feedback items
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
      type: "positive",
      title: "Consistent color scheme",
      description: "The color palette is cohesive and reinforces the brand identity throughout the interface."
    },
    
    // High priority issues (minimum 2)
    {
      id: 4,
      type: "improvement",
      title: "Low contrast buttons",
      priority: "high",
      description: "Some buttons have low contrast which makes them difficult to see for users with visual impairments.",
      location: { x: 250, y: 440 },
      principle: "Accessibility",
      technical_details: "Consider using a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.",
      impact: "high",
      effort: "low",
      time_estimate: "30-45 minutes"
    },
    {
      id: 5,
      type: "improvement",
      title: "Missing form labels",
      priority: "high",
      description: "Form elements should have visible labels to improve accessibility.",
      location: { x: 300, y: 530 },
      principle: "Accessibility",
      technical_details: "Add <label> elements associated with form controls using 'for' attribute.",
      impact: "high",
      effort: "medium",
      time_estimate: "1-2 hours"
    },
    
    // Medium priority issues (minimum 4)
    {
      id: 6,
      type: "improvement",
      title: "Inconsistent heading hierarchy",
      priority: "medium",
      description: "Heading levels should follow a logical order for better screen reader navigation.",
      location: { x: 150, y: 200 },
      principle: "Information Architecture",
      technical_details: "Ensure heading levels (h1-h6) are used in sequential order without skipping levels.",
      impact: "medium",
      effort: "medium",
      time_estimate: "1-2 hours"
    },
    {
      id: 7,
      type: "improvement",
      title: "Hover states lack feedback",
      priority: "medium",
      description: "Interactive elements should provide clear visual feedback on hover.",
      location: { x: 420, y: 380 },
      principle: "User Feedback",
      technical_details: "Add hover effects using CSS transitions for all interactive elements.",
      impact: "medium",
      effort: "low",
      time_estimate: "45-60 minutes"
    },
    {
      id: 8,
      type: "improvement",
      title: "Mobile navigation issues",
      priority: "medium",
      description: "The navigation menu is difficult to use on mobile devices.",
      location: { x: 80, y: 60 },
      principle: "Responsive Design",
      technical_details: "Implement a hamburger menu or bottom navigation for mobile screens.",
      impact: "high",
      effort: "high",
      time_estimate: "3-4 hours"
    },
    {
      id: 9,
      type: "improvement",
      title: "Form validation feedback",
      priority: "medium",
      description: "Users should receive immediate feedback when form fields contain errors.",
      location: { x: 320, y: 480 },
      principle: "User Feedback",
      technical_details: "Add inline validation with clear error messages for form fields.",
      impact: "medium",
      effort: "medium",
      time_estimate: "2-3 hours"
    },
    
    // Low priority issues (minimum 4)
    {
      id: 10,
      type: "improvement",
      title: "Favicon missing",
      priority: "low",
      description: "Adding a favicon helps users identify your site in browser tabs.",
      principle: "Brand Identity",
      technical_details: "Create and add a favicon.ico file to the root directory.",
      impact: "low",
      effort: "low",
      time_estimate: "15-30 minutes"
    },
    {
      id: 11,
      type: "improvement",
      title: "Inconsistent padding",
      priority: "low",
      description: "Some UI components have inconsistent padding which affects visual harmony.",
      location: { x: 280, y: 320 },
      principle: "Visual Design",
      technical_details: "Standardize padding values across similar components using CSS variables.",
      impact: "low",
      effort: "medium",
      time_estimate: "1-2 hours"
    },
    {
      id: 12,
      type: "improvement",
      title: "Missing loading states",
      priority: "low",
      description: "Users should see loading indicators during data fetching operations.",
      principle: "User Feedback",
      technical_details: "Add skeleton loaders or spinners during asynchronous operations.",
      impact: "medium",
      effort: "medium",
      time_estimate: "2-3 hours"
    },
    {
      id: 13,
      type: "improvement",
      title: "Typography scale inconsistency",
      priority: "low",
      description: "Font sizes don't follow a consistent scale throughout the interface.",
      principle: "Typography",
      technical_details: "Implement a typographic scale using CSS variables or a design system.",
      impact: "low",
      effort: "medium",
      time_estimate: "1-2 hours"
    }
  ];
};
