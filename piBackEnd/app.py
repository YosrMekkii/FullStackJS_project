from flask import Flask, jsonify
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Charger les données et entraîner le modèle
data = pd.read_csv('data/proposals.csv')

# Encoder les colonnes 'offering' et 'looking_for' pour les rendre numériques
encoder_offering = LabelEncoder()
encoder_looking_for = LabelEncoder()
data['offering_encoded'] = encoder_offering.fit_transform(data['offering'])
data['looking_for_encoded'] = encoder_looking_for.fit_transform(data['looking_for'])

# Préparer les données d'entrée pour l'entraînement du modèle
X = data[['offering_encoded', 'looking_for_encoded']]

# Entraîner le modèle NearestNeighbors
model = NearestNeighbors(n_neighbors=3, metric='cosine')
model.fit(X)

import logging

logging.basicConfig(level=logging.DEBUG)

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
    offering_encoded = encoder_offering.transform([offering_input])
    looking_for_encoded = encoder_looking_for.transform([looking_for_input])

    user_vector = [offering_encoded[0], looking_for_encoded[0]]

    distances, indices = model.kneighbors([user_vector])
    suggestions = data.iloc[indices[0]]

    return jsonify(suggestions[['user_id','offering', 'looking_for']].to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)

