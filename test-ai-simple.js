// Simple test to check AI service
console.log('Testing AI service...');

// Simulate the AI service call
const testInput = "I'm looking at a $750k house in Denver";
const testContext = {
  homePrice: 750000,
  currentRent: 3000,
  downPayment: 20,
  interestRate: 7.0,
  timeHorizon: 10,
  location: 'Denver',
  previousMessages: []
};

console.log('Input:', testInput);
console.log('Context:', testContext);

// Check if API key exists
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');

if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
  console.log('❌ No valid API key - will use fallback AI');
} else {
  console.log('✅ API key found - will try OpenAI API');
}


