from flask import Flask, request, jsonify
from flask_cors import CORS
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app)  # Autoriser les requêtes depuis React

# Charger le modèle BERT
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Charger l'index FAISS
index = faiss.read_index("faiss_index.bin")

# Charger les questions et réponses
with open("qa_data.pkl", "rb") as f:
    data = pickle.load(f)
questions = data["questions"]
answers = data["answers"]

# Fonction pour rechercher la meilleure réponse
def get_best_match(user_question):
    user_embedding = model.encode([user_question])
    D, I = index.search(np.array(user_embedding, dtype=np.float32), 1)

    if D[0][0] > 0.5:
        return "Désolé, je ne connais pas la réponse."

    return answers[I[0][0]]

# Route API pour interagir avec le chatbot
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_question = data.get("question", "")

    if not user_question:
        return jsonify({"answer": "Veuillez poser une question."})

    response = get_best_match(user_question)
    return jsonify({"answer": response})

if __name__ == "__main__":
    app.run(debug=True)  # Démarrer Flask sur http://127.0.0.1:5000
