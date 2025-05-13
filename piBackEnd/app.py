from flask import Flask, jsonify
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS
import numpy as np
import logging

app = Flask(__name__)
CORS(app)

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)

# Charger les données
data = pd.read_csv('data/proposals.csv')

# Encoder les colonnes 'offering' et 'looking_for' pour les rendre numériques
encoder_offering = LabelEncoder()
encoder_looking_for = LabelEncoder()
data['offering_encoded'] = encoder_offering.fit_transform(data['offering'])
data['looking_for_encoded'] = encoder_looking_for.fit_transform(data['looking_for'])

# Préparer les données d'entrée pour l'entraînement du modèle
X = data[['offering_encoded', 'looking_for_encoded']]

# Déterminer le nombre de clusters (on peut ajuster ce nombre selon les besoins)
# Ici, on prend un nombre qui devrait être suffisant pour représenter les différentes combinaisons
n_clusters = min(len(data), 8)  # On limite à 8 clusters maximum ou moins si peu de données

# Entraîner le modèle K-means
kmeans_model = KMeans(n_clusters=n_clusters, random_state=42)
kmeans_model.fit(X)

# Assigner les clusters aux données
data['cluster'] = kmeans_model.labels_

@app.route('/recommendations/<user_input>', methods=['GET'])
def recommend(user_input):
    # Découper l'input utilisateur et encoder les valeurs
    user_input = user_input.split(',')
    offering_input = user_input[0]
    looking_for_input = user_input[1]
    
    logging.debug(f"Input utilisateur: {offering_input}, {looking_for_input}")
    
    # Vérification des classes
    if offering_input not in encoder_offering.classes_:
        logging.error(f"Offre non reconnue: {offering_input}")
        return jsonify({"error": f"Offre non reconnue : {offering_input}"}), 400
    
    if looking_for_input not in encoder_looking_for.classes_:
        logging.error(f"Recherche non reconnue: {looking_for_input}")
        return jsonify({"error": f"Recherche non reconnue : {looking_for_input}"}), 400
    
    # Encoder les entrées
    offering_encoded = encoder_offering.transform([offering_input])[0]
    looking_for_encoded = encoder_looking_for.transform([looking_for_input])[0]
    
    user_vector = np.array([[offering_encoded, looking_for_encoded]])
    
    # Prédire le cluster pour l'entrée utilisateur
    user_cluster = kmeans_model.predict(user_vector)[0]
    
    # Trouver les éléments du même cluster
    cluster_items = data[data['cluster'] == user_cluster]
    
    # Exclure l'élément actuel si présent dans le dataset
    matching_items = cluster_items[
        ~((cluster_items['offering'] == offering_input) & 
          (cluster_items['looking_for'] == looking_for_input))
    ]
    
    # Si nous avons plus de résultats que le nombre souhaité, on en prend n_recommendations au hasard
    n_recommendations = 5  # Modifier ce nombre pour augmenter ou diminuer les recommandations
    if len(matching_items) > n_recommendations:
        matching_items = matching_items.sample(n_recommendations)
    
    # Si aucun élément correspondant n'est trouvé
    if len(matching_items) == 0:
        # Récupérer les centres des clusters
        cluster_centers = kmeans_model.cluster_centers_
        
        # Calculer les distances aux centres de tous les clusters
        distances = np.sqrt(((cluster_centers - user_vector) ** 2).sum(axis=1))
        
        # Trier par distance croissante (en excluant le cluster de l'utilisateur qui est vide)
        closest_clusters = np.argsort(distances)
        
        # Prendre les éléments du cluster le plus proche
        for cluster_id in closest_clusters:
            if cluster_id != user_cluster:
                matching_items = data[data['cluster'] == cluster_id]
                if len(matching_items) > n_recommendations:
                    matching_items = matching_items.sample(n_recommendations)
                break
    
    return jsonify(matching_items[['user_id', 'offering', 'looking_for']].to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)