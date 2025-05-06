// Import your existing API setup
import API from './api'; // Adjust this import based on your project structure

// Add a new function to call the Flask recommendation API
const getMLRecommendations = async (userId, numRecommendations = 5) => {
  try {
    // Call your Flask recommendation API
    const response = await fetch('http://127.0.0.1:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        num_recommendations: numRecommendations
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ML recommendations:', error);
    throw error;
  }
};

// Updated version of fetchRecommendedChallenges
const fetchRecommendedChallenges = async (userId, userInterests = []) => {
  try {
    // Call the Flask ML recommendation service
    const mlData = await getMLRecommendations(userId);
    
    // Process the recommendations from the ML service
    const enhancedResults = mlData.recommendations.map(challenge => {
      return {
        ...challenge,
        // Add recommendation text based on similarity score
        recommendationText: challenge.similarity_score 
          ? `Recommended based on your interests (${(challenge.similarity_score * 100).toFixed(1)}% match)` 
          : 'Recommended based on your interests'
      };
    });
    
    return enhancedResults;
  } catch (error) {
    console.error('Error fetching recommended challenges:', error);
    
    // Fallback to the original recommendation API if ML service fails
    console.log('Falling back to original recommendation API');
    try {
      const interestsParam = userInterests.length > 0 
        ? `&interests=${encodeURIComponent(JSON.stringify(userInterests))}` 
        : '';
      
      const { data } = await API.get(`/challenges/recommended?userId=${userId}${interestsParam}`);
      
      const enhancedResults = data.map(challenge => {
        return {
          ...challenge,
          recommendationText: challenge.recommendationReason 
            ? `${challenge.recommendationReason}` 
            : null
        };
      });
      
      return enhancedResults;
    } catch (fallbackError) {
      console.error('Fallback recommendation also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export default fetchRecommendedChallenges;
