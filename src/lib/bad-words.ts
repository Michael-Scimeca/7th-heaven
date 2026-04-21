export const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 
  'slut', 'whore', 'bastard', 'crap', 'fag', 'faggot', 'nigger', 'nigga',
  'cock', 'motherfucker', 'twat'
];

export function censorBadWords(text: string): string {
  if (!text) return text;
  
  let censoredText = text;
  for (const word of BAD_WORDS) {
    // Create a regex to match the bad word specifically
    // \b ensures we only match whole words (so "classic" isn't censored for "ass")
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censoredText = censoredText.replace(regex, (match) => '*'.repeat(match.length));
  }
  
  return censoredText;
}

export function containsBadWords(text: string): boolean {
  if (!text) return false;
  
  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
}

export function validateMessage(text: string): { isValid: boolean, error?: string } {
  if (!text || text.trim().length === 0) return { isValid: false, error: "Message is empty." };
  
  // Check for links
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi;
  if (urlRegex.test(text)) {
    return { isValid: false, error: "Links are not allowed in the live chat." };
  }

  // Check for character spam (e.g. hhhhhhh)
  if (/(.)\1{7,}/i.test(text)) {
    return { isValid: false, error: "Message contains too much character spam." };
  }
  
  // Check for word spam
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {} as Record<string, number>);
  if (words.length > 5 && Object.values(wordCounts).some(count => count > 5)) {
     return { isValid: false, error: "Please don't spam repeated words." };
  }

  return { isValid: true };
}
