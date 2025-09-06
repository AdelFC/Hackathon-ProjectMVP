import requests
from requests_oauthlib import OAuth1
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()

# Configuration API X avec OAuth 1.0a et Bearer Token
X_API_KEY = os.getenv("X_API_KEY")
X_KEY_SECRET = os.getenv("X_KEY_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")

def get_user_id(username: str):
    """
    Récupère l'ID de l'utilisateur à partir de son nom d'utilisateur.

    Args:
        username (str): Nom d'utilisateur Twitter (sans @).

    Returns:
        str: ID de l'utilisateur.
    """
    if not X_BEARER_TOKEN:
        raise ValueError("Le Bearer Token doit être défini dans les variables d'environnement.")

    url = f"https://api.twitter.com/2/users/by/username/{username}"
    headers = {'Authorization': f'Bearer {X_BEARER_TOKEN}'}

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        user_data = response.json()
        user_id = user_data['data']['id']
        print(f"ID utilisateur récupéré : {user_id}")
        return user_id
    else:
        print(f"Erreur lors de la récupération de l'ID utilisateur : {response.status_code} - {response.text}")
        return None

def fetch_user_posts(user_id: str, max_results: int = 50):
    """
    Récupère tous les posts (tweets) de l'utilisateur spécifié.

    Args:
        user_id (str): ID de l'utilisateur.
        max_results (int): Nombre maximum de résultats par requête (max 100).

    Returns:
        list: Liste des posts avec leurs données.
    """
    if not all([X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
        raise ValueError("Toutes les clés API X doivent être définies dans les variables d'environnement.")

    url = f"https://api.twitter.com/2/users/{user_id}/tweets"
    headers = {'Authorization': f'Bearer {X_BEARER_TOKEN}'}
    params = {
        'max_results': max_results,
        'tweet.fields': 'created_at,public_metrics,context_annotations,entities'
    }

    all_posts = []
    while True:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            posts = data.get('data', [])
            all_posts.extend(posts)
            print(f"Récupéré {len(posts)} posts. Total : {len(all_posts)}")

            # Pagination
            next_token = data.get('meta', {}).get('next_token')
            if next_token:
                params['pagination_token'] = next_token
                time.sleep(1)  # Délai pour éviter les limites de taux
            else:
                break
        elif response.status_code == 429:
            print("Limite de taux atteinte. Attente de 60 secondes avant de réessayer...")
            time.sleep(60)
            continue
        else:
            print(f"Erreur lors de la récupération des posts : {response.status_code} - {response.text}")
            break

    return all_posts

# Exemple d'utilisation
if __name__ == "__main__":
    # Utilisez votre ID utilisateur connu (remplacez par le vôtre si nécessaire)
    user_id = "1964269504189362178"  # Remplacez par votre ID utilisateur
    # Récupération de tous les posts
    posts = fetch_user_posts(user_id, max_results=100)
    if posts:
        # Sauvegarde dans un fichier JSON
        with open('user_posts.json', 'w', encoding='utf-8') as f:
            json.dump(posts, f, ensure_ascii=False, indent=4)
        print(f"Données des posts sauvegardées dans user_posts.json")
    else:
        print("Aucun post trouvé.")
