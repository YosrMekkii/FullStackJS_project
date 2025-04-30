import pandas as pd
from sklearn.neighbors import NearestNeighbors

# Charger les données
data = pd.read_csv('proposals.csv')

# Préparer les données : ici on suppose des données simples
X = data[['offering', 'looking_for']]

# Entraîner le modèle KNN
model = NearestNeighbors(n_neighbors=3, metric='cosine')
model.fit(X)

# Demander des suggestions pour un utilisateur avec certaines compétences
user_input = [['JavaScript', 'HTML']]
distances, indices = model.kneighbors(user_input)

# Récupérer les propositions les plus proches
suggestions = data.iloc[indices[0]]
print(suggestions)
