from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model data
model_data = joblib.load('recommender_model.pkl')
similarity_matrix = model_data["similarity_matrix"]
users_df = model_data["users"]
challenges_df = model_data["challenges"] 
vectorizer = model_data["vectorizer"]
kmeans_model = model_data["kmeans_model"]  # Load the K-means model
challenge_vecs = model_data["challenge_vecs"]  # Load the challenge vectors

# MongoDB Atlas Connection
client = MongoClient("mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/")
db = client['test']  # Make sure this matches your database name from the first script
challenges_collection = db['challenges']
users_collection = db['users']

@app.route("/recommend", methods=["POST"])
def recommend_challenges():
    data = request.get_json()
    user_id = data.get("user_id")
    num_recommendations = data.get("num_recommendations", 5)  # Default to 5 recommendations

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    # Find user in our users DataFrame
    user_index = users_df[users_df['user_id'] == user_id].index
    
    if len(user_index) == 0:
        # User not in training data, get interests from MongoDB and compute similarity on-the-fly
        user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user_doc:
            return jsonify({"error": "User not found"}), 404
            
        # Get user interests
        interests = user_doc.get("interests", [])
        if not interests:
            return jsonify({"error": "User has no interests to base recommendations on"}), 400
            
        interest_text = " ".join(interests).lower()
        
        # Transform using the same vectorizer used during training
        user_vec = vectorizer.transform([interest_text])
        
        # Calculate cosine similarity between user and all challenges
        similarities = cosine_similarity(user_vec, challenge_vecs)[0]
        
        # Get top N indices
        top_indices = np.argsort(similarities)[::-1][:num_recommendations]
        
    else:
        # User exists in our training data
        user_idx = user_index[0]
        user_similarities = similarity_matrix[user_idx]
        
        # Get top N challenge indices
        top_indices = np.argsort(user_similarities)[::-1][:num_recommendations]
    
    # Get challenge IDs
    recommended_challenge_ids = [challenges_df.iloc[idx]['challenge_id'] for idx in top_indices]
    
    # Fetch challenge details from MongoDB
    challenge_list = []
    for i, challenge_id in enumerate(recommended_challenge_ids):
        challenge_doc = challenges_collection.find_one({"_id": ObjectId(challenge_id)})
        if challenge_doc:
            # Convert ObjectId to string for JSON serialization
            challenge_doc["_id"] = str(challenge_doc["_id"])
            
            # Add similarity score
            if len(user_index) > 0:
                idx = np.where(challenges_df['challenge_id'] == challenge_id)[0][0]
                challenge_doc["similarity_score"] = float(user_similarities[idx])
            else:
                # For new users, get similarity score
                idx = np.where(challenges_df['challenge_id'] == challenge_id)[0][0]
                challenge_doc["similarity_score"] = float(similarities[idx])
                
            challenge_list.append(challenge_doc)
    
    return jsonify({
        "recommendations": challenge_list,
        "user_id": user_id
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)