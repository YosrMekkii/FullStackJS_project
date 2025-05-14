import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import joblib
import numpy as np

# MongoDB connection
client = MongoClient('mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/')
db = client['test']
users_collection = db['users']
skills_collection = db['skills']

# Fetch data from MongoDB
print("Fetching user and skill data from MongoDB...")
users = list(users_collection.find())
skills = list(skills_collection.find())

# Check if data is available
if not users:
    raise ValueError("No users found in the users collection.")
if not skills:
    raise ValueError("No skills found in the skills collection.")

# Convert to DataFrames
users_df = pd.DataFrame(users)
skills_df = pd.DataFrame(skills)

# Preprocess interests and skill titles
print("Preprocessing user interests and skill titles...")
user_interests = users_df['interests'].apply(lambda x: " ".join(x).lower() if isinstance(x, list) else "")
skill_texts = skills_df['title'].str.lower()  # Use 'description' if available and preferred

# Check for empty data
if user_interests.empty or all(user_interests == ""):
    raise ValueError("User interests are empty or not properly formatted.")
if skill_texts.empty:
    raise ValueError("Skill titles are empty or not properly formatted.")

# Vectorize text data
print("Vectorizing text data...")
vectorizer = TfidfVectorizer(stop_words='english')
user_vecs = vectorizer.fit_transform(user_interests)
skill_vecs = vectorizer.transform(skill_texts)

# Compute cosine similarity between users and skills
print("Computing cosine similarity matrix...")
similarity_matrix = cosine_similarity(user_vecs, skill_vecs)

# Prepare model data
model_data = {
    "similarity_matrix": similarity_matrix,
    "users": users_df[['_id']].rename(columns={'_id': 'user_id'}),
    "skills": skills_df[['_id']].rename(columns={'_id': 'skill_id'}),
    "vectorizer": vectorizer,
    "skill_vecs": skill_vecs
}

# Save the model to a file
print("Saving model to skill_recommender_model.pkl...")
joblib.dump(model_data, 'skill_recommender_model.pkl')
print("Model saved successfully.")