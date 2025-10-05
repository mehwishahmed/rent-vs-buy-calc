// Quick test to check AI service behavior
const { aiService } = require('./src/services/aiService.ts');

async function testAI() {
  try {
    console.log('Testing AI service...');
    const response = await aiService.generateResponse("I'm looking at a $750k house in Denver", {
      homePrice: 750000,
      currentRent: 3000,
      downPayment: 20,
      interestRate: 7.0,
      timeHorizon: 10,
      location: 'Denver',
      previousMessages: []
    });
    console.log('AI Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAI();


