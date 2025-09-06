import requests
from requests_oauthlib import OAuth1
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration API X avec OAuth 1.0a
X_API_KEY = os.getenv("X_API_KEY")
X_KEY_SECRET = os.getenv("X_KEY_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")

def upload_media(image_path: str):
    """
    Upload une image et retourne l'ID média.

    Args:
        image_path (str): Chemin vers l'image à uploader.

    Returns:
        str: ID du média uploadé.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Le fichier {image_path} n'existe pas.")

    url = "https://upload.twitter.com/1.1/media/upload.json"
    auth = OAuth1(X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)

    with open(image_path, 'rb') as image_file:
        files = {'media': image_file}
        response = requests.post(url, files=files, auth=auth)

    if response.status_code == 200:
        media_data = response.json()
        media_id = media_data['media_id_string']
        print(f"Image uploadée avec succès, ID: {media_id}")
        return media_id
    else:
        print(f"Erreur lors de l'upload de l'image: {response.status_code} - {response.text}")
        return None

def post_to_x(text: str, image_path: str = None):
    """
    Fonction pour publier un post sur X via l'API avec OAuth 1.0a, optionnellement avec une image.

    Args:
        text (str): Le texte du post à publier.
        image_path (str, optional): Chemin vers l'image à attacher.

    Returns:
        dict: Réponse de l'API X.
    """
    if not all([X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
        raise ValueError("Toutes les clés API X doivent être définies dans les variables d'environnement.")

    url = "https://api.twitter.com/2/tweets"
    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "text": text
    }

    if image_path:
        media_id = upload_media(image_path)
        if media_id:
            payload["media"] = {"media_ids": [media_id]}
        else:
            print("Échec de l'upload de l'image, publication sans image.")
            del payload["media"]

    auth = OAuth1(X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)

    response = requests.post(url, headers=headers, json=payload, auth=auth)

    if response.status_code == 201:
        print("Post publié avec succès sur X!")
        return response.json()
    else:
        print(f"Erreur lors de la publication: {response.status_code} - {response.text}")
        return None

# Exemple d'utilisation
if __name__ == "__main__":
    # Remplacez par votre texte de post
    post_text = "Bonjour, voici un exemple de post automatique via l'API X avec une image !"
    # Remplacez par le chemin vers votre image (optionnel)
    image_path = "/home/ennollet/Hackathon-MVP/x_post/fond_blanc.jpg"  # Exemple: "image.jpg"
    result = post_to_x(post_text, image_path)
    print(result)
