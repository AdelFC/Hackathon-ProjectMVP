import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration API Facebook
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")
FACEBOOK_PAGE_ID = os.getenv("FACEBOOK_PAGE_ID")

def upload_media(image_path: str):
    """
    Upload une image sur Facebook et retourne l'ID du média.

    Args:
        image_path (str): Chemin vers l'image à uploader.

    Returns:
        str: ID du média uploadé.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Le fichier {image_path} n'existe pas.")

    url = f"https://graph.facebook.com/{FACEBOOK_PAGE_ID}/photos"
    params = {
        'access_token': FACEBOOK_ACCESS_TOKEN
    }

    with open(image_path, 'rb') as image_file:
        files = {'source': image_file}
        response = requests.post(url, files=files, params=params)

    if response.status_code == 200:
        media_data = response.json()
        media_id = media_data['id']
        print(f"Image uploadée avec succès sur Facebook, ID: {media_id}")
        return media_id
    else:
        print(f"Erreur lors de l'upload de l'image: {response.status_code} - {response.text}")
        return None

def post_to_facebook(text: str, image_path: str = None):
    """
    Fonction pour publier un post sur Facebook via l'API Graph, optionnellement avec une image.

    Args:
        text (str): Le texte du post à publier.
        image_path (str, optional): Chemin vers l'image à attacher.

    Returns:
        dict: Réponse de l'API Facebook.
    """
    if not all([FACEBOOK_ACCESS_TOKEN, FACEBOOK_PAGE_ID]):
        raise ValueError("Le jeton d'accès Facebook et l'ID de la page doivent être définis dans les variables d'environnement.")

    url = f"https://graph.facebook.com/{FACEBOOK_PAGE_ID}/feed"
    params = {
        'message': text,
        'access_token': FACEBOOK_ACCESS_TOKEN
    }

    if image_path:
        media_id = upload_media(image_path)
        if media_id:
            params['attached_media'] = f'{{"media_fbid":"{media_id}"}}'
        else:
            print("Échec de l'upload de l'image, publication sans image.")

    response = requests.post(url, params=params)

    if response.status_code == 200:
        print("Post publié avec succès sur Facebook!")
        return response.json()
    else:
        print(f"Erreur lors de la publication: {response.status_code} - {response.text}")
        return None

# Exemple d'utilisation
if __name__ == "__main__":
    # Remplacez par votre texte de post
    post_text = "Bonjour, voici un exemple de post automatique via l'API Facebook avec une image !"
    # Remplacez par le chemin vers votre image (optionnel)
    image_path = "/home/ennollet/Hackathon-MVP/facebook_post/fond_blanc.jpg"  # Exemple: "image.jpg"
    result = post_to_facebook(post_text, image_path)
    print(result)
