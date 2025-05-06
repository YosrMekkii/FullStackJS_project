from flask import Flask, request, jsonify
from pymongo import MongoClient
import pandas as pd
import joblib
import numpy as np

app = Flask(__name__)

# Load model & pivot matrix
model = joblib.load('recommender_model.pkl')
pivot = pd.read_pickle('pivot.pkl')

# MongoDB Atlas Connection
client = MongoClient("mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/")
db = client['skillexchangedb']
challenges = db['challenges']
users = db['users']

@app.route("/recommend", methods=["GET"])
def recommend_challenges():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400
    
    if user_id not in pivot.index:
        return jsonify({"error": "User not found in pivot table"}), 404

    # Find similar users
    user_vector = pivot.loc[user_id].values.reshape(1, -1)
    distances, indices = model.kneighbors(user_vector, n_neighbors=5)

    # Aggregate recommended challenge IDs
    similar_users = pivot.index[indices.flatten()].tolist()
    recommended_challenges = set()
    
    for sim_user in similar_users:
        sim_user_challenges = pivot.loc[sim_user]
        unseen = sim_user_challenges[sim_user_challenges > 0].index.difference(pivot.loc[user_id][pivot.loc[user_id] > 0].index)
        recommended_challenges.update(unseen)

    # Fetch challenge details from DB
    challenge_list = list(challenges.find({
        "_id": {"$in": [ObjectId(cid) for cid in recommended_challenges]}
    }, {"title": 1, "category": 1, "tags": 1}))

    return jsonify(challenge_list)

if __name__ == "__main__":
    app.run(debug=True)
