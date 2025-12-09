// AI auto-reply responses for demo purposes
export const AI_RESPONSES = [
  "That sounds awesome! Tell me more about it.",
  "Haha, totally agree with you there.",
  "I'm actually planning a trip soon, maybe we can cross paths!",
  "Wow, that's really interesting.",
  "Sure thing!",
  "Let me check my schedule and get back to you.",
  "Cheers from my side of the world!",
  "Have you ever been to Thailand? I loved it there.",
  "Nice to meet you virtually!",
];

export const getRandomResponse = () =>
  AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
