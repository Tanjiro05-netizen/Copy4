import spacy
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load the spaCy model
# Before running for the first time, you need to download the spaCy model:
# python -m spacy download en_core_web_sm
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model 'en_core_web_sm'...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
# Enable CORS for all routes and origins. In a production environment,
# you would want to restrict this to your frontend's domain.
CORS(app)

@app.route('/ner', methods=['POST'])
def get_named_entities():
    """
    Receives text data, processes it with spaCy to find named entities,
    and returns them as a JSON object.
    """
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400

    text = request.json['text']
    doc = nlp(text)
    
    entities = []
    for ent in doc.ents:
        entities.append({
            'text': ent.text,
            'start': ent.start_char,
            'end': ent.end_char,
            'label': ent.label_
        })
        
    return jsonify(entities)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
