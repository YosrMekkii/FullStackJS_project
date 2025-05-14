from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB Atlas Connection
client = MongoClient("mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/")
db = client['skill_exchange']  # Use the same database as the first script
skills_collection = db['skills']
users_collection = db['users']

# Load pre-trained model data
model_data = joblib.load('skill_recommender_model.pkl')  # Assumes a pre-trained model file
similarity_matrix = model_data["similarity_matrix"]
users_df = model_data["users"]
skills_df = model_data["skills"]
vectorizer = model_data["vectorizer"]
skill_vecs = model_data["skill_vecs"]

@app.route("/recommend-skills", methods=["POST"])
def recommend_skills():
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
        
        # Calculate cosine similarity between user and all skills
        similarities = cosine_similarity(user_vec, skill_vecs)[0]
        
        # Get top N indices
        top_indices = np.argsort(similarities)[::-1][:num_recommendations]
        
    else:
        # User exists in our training data
        user_idx = user_index[0]
        user_similarities = similarity_matrix[user_idx]
        
        # Get top N skill indices
        top_indices = np.argsort(user_similarities)[::-1][:num_recommendations]
    
    # Get skill IDs
    recommended_skill_ids = [skills_df.iloc[idx]['skill_id'] for idx in top_indices]
    
    # Fetch skill details from MongoDB
    skill_list = []
    for i, skill_id in enumerate(recommended_skill_ids):
        skill_doc = skills_collection.find_one({"_id": ObjectId(skill_id)})
        if skill_doc:
            # Convert ObjectId to string for JSON serialization
            skill_doc["_id"] = str(skill_doc["_id"])
            
            # Add similarity score
            if len(user_index) > 0:
                idx = np.where(skills_df['skill_id'] == skill_id)[0][0]
                skill_doc["similarity_score"] = float(user_similarities[idx])
            else:
                # For new users, get similarity score
                idx = np.where(skills_df['skill_id'] == skill_id)[0][0]
                skill_doc["similarity_score"] = float(similarities[idx])
                
            skill_list.append(skill_doc)
    
    return jsonify({
        "recommendations": skill_list,
        "user_id": user_id
    })

@app.route("/recommend-similar-skills", methods=["GET"])
def recommend_similar_skills():
    # Get category from query parameters
    category = request.args.get("category")
    skill_id = request.args.get("skill_id")
    num_recommendations = int(request.args.get("limit", 5))  # Default to 5 recommendations
    
    if not category and not skill_id:
        return jsonify({"error": "Missing category or skill_id parameter"}), 400

    # Query to find skills in the given category
    query = {}
    
    if category:
        query["category"] = category
    
    # If we have a specific skill_id, we'll find similar skills based on content
    if skill_id:
        # Get the original skill
        original_skill = skills_collection.find_one({"_id": ObjectId(skill_id)})
        if not original_skill:
            return jsonify({"error": "Skill not found"}), 404
            
        # Make sure we don't include the original skill in results
        if "_id" in query:
            query["_id"]["$ne"] = ObjectId(skill_id)
        else:
            query["_id"] = {"$ne": ObjectId(skill_id)}
            
        # Add category to query if we have a specific skill
        if "category" not in query and "category" in original_skill:
            query["category"] = original_skill["category"]
    
    # Find skills matching our query
    similar_skills = list(skills_collection.find(query).limit(num_recommendations))
    
    # Convert ObjectId to string for JSON serialization
    for skill in similar_skills:
        skill["_id"] = str(skill["_id"])
    
    return jsonify({
        "similar_skills": similar_skills
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5003)