from pymongo import MongoClient
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
import joblib
import pprint
from sklearn.metrics.pairwise import cosine_similarity

# For debugging
pp = pprint.PrettyPrinter(indent=4)

# Step 1: Connect to MongoDB
client = MongoClient("mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/")
db = client["test"]
users = db['users']
challenges = db['challenges']

print("Connected to MongoDB successfully!")

# Step 2: Load user interests
user_data = []
for user in users.find():
    user_id = str(user["_id"])
    interests = user.get("interests", [])
    if interests:
        interest_text = " ".join(interests).lower()
        user_data.append({"user_id": user_id, "interests": interest_text})
        print(f"User ID: {user_id}, Interests: {interests}")

print(f"\nFound {len(user_data)} users with interests")

# Step 3: Load challenge tags + category
challenge_data = []
challenge_count = challenges.count_documents({})
print(f"\nTotal challenges in database: {challenge_count}")

for challenge in challenges.find():
    challenge_id = str(challenge["_id"])
    tags = challenge.get("tags", [])
    category = challenge.get("category", "")
    
    print(f"Challenge ID: {challenge_id}")
    print(f"  Tags: {tags}")
    print(f"  Category: {category}")
    
    if tags or category:  # Only add challenges that have tags or categories
        tag_category_text = " ".join((tags or []) + ([category] if category else [])).lower()
        challenge_data.append({
            "challenge_id": challenge_id, 
            "tags_category": tag_category_text
        })

print(f"\nFound {len(challenge_data)} challenges with tags or categories")

# Create DataFrames
users_df = pd.DataFrame(user_data)
challenges_df = pd.DataFrame(challenge_data)

print("\nUsers DataFrame:")
print(users_df)

print("\nChallenges DataFrame:")
print(challenges_df)

if users_df.empty or challenges_df.empty:
    print("\n⚠️ No user interests or challenge tags/category found.")
    exit()

# Step 4: TF-IDF vectorization
vectorizer = TfidfVectorizer()
combined_corpus = pd.concat([users_df["interests"], challenges_df["tags_category"]])
tfidf_matrix = vectorizer.fit_transform(combined_corpus)

print(f"\nTF-IDF matrix shape: {tfidf_matrix.shape}")

# Step 5: Split into user & challenge vectors
user_vecs = tfidf_matrix[:len(users_df)]
challenge_vecs = tfidf_matrix[len(users_df):]

print(f"User vectors shape: {user_vecs.shape}")
print(f"Challenge vectors shape: {challenge_vecs.shape}")

# Step 6: Create K-means model for challenge vectors
# Choose number of clusters - a good rule of thumb is sqrt(n/2) where n is the number of samples
n_clusters = min(int(np.sqrt(challenge_vecs.shape[0]/2)), challenge_vecs.shape[0])
# Ensure at least 1 cluster
n_clusters = max(1, n_clusters)

print(f"Using {n_clusters} clusters for K-means")

kmeans_model = KMeans(n_clusters=n_clusters, random_state=42)
kmeans_model.fit(challenge_vecs)

# Step 7: Compute similarity matrix using cosine similarity
# Initialize the similarity matrix with zeros
similarity_matrix = np.zeros((len(users_df), len(challenges_df)))

# For each user, compute cosine similarity with all challenges
for i in range(len(users_df)):
    user_vec = user_vecs[i].toarray()  # Convert to dense array for cosine_similarity
    
    # Calculate cosine similarity between this user and all challenges
    similarities = cosine_similarity(user_vec, challenge_vecs.toarray())[0]
    
    # Fill in the similarity matrix
    similarity_matrix[i] = similarities

print(f"Similarity matrix shape: {similarity_matrix.shape}")

# Step 8: Save model
model_data = {
    "similarity_matrix": similarity_matrix,
    "users": users_df,
    "challenges": challenges_df,
    "vectorizer": vectorizer,
    "kmeans_model": kmeans_model,  # Save the K-means model for new users
    "challenge_vecs": challenge_vecs  # Save challenge vectors for similarity computation
}
joblib.dump(model_data, "recommender_model.pkl")

print("\n✅ K-means-based model trained and saved using interests vs (tags + category).")

# Optional: Print a sample of the similarity matrix
if similarity_matrix.size > 0:
    print("\nSample similarity scores (User to Challenge):")
    for i in range(min(3, len(users_df))):
        print(f"User {users_df['user_id'].iloc[i]}:")
        for j in range(min(3, len(challenges_df))):
            print(f"  - Challenge {challenges_df['challenge_id'].iloc[j]}: {similarity_matrix[i][j]:.4f}")