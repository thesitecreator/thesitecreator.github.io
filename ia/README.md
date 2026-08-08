# Site de discussion + panel admin

## 1. Installation

Il faut Node.js 18+.

Dans le dossier du projet :

```bash
npm install
```

## 2. Lancer

```bash
npm start
```

Puis ouvre :

- Site visiteur : http://localhost:3000
- Panel admin : http://localhost:3000/admin

## 3. Mot de passe admin

Par défaut, le mot de passe est :

`ChangeMoi123!`

Pour un vrai hébergement, définis au minimum :

```bash
SESSION_SECRET=une-longue-valeur-aleatoire
ADMIN_PASSWORD=un-mot-de-passe-tres-fort
```

Tu peux aussi utiliser un fichier `.env`, mais ce projet volontairement n'inclut pas de chargeur dotenv : les variables peuvent être fournies directement par l'hébergeur.

## Fonctionnement

- Le visiteur saisit prénom, nom et âge.
- Une session est créée.
- Il arrive sur une interface de chat.
- Ses messages sont enregistrés dans SQLite.
- L'administrateur voit tous les visiteurs, leurs informations et leur conversation.
- L'administrateur peut répondre.
- Les deux côtés actualisent automatiquement les messages toutes les 2,5 secondes environ.

## Important pour la mise en ligne

Le projet est un socle fonctionnel. Avant une vraie mise en production, ajoute notamment :
- HTTPS obligatoire ;
- mot de passe admin fort via variable d'environnement ;
- vraie gestion de sessions persistantes (Redis ou base dédiée) ;
- limitation de tentatives de connexion ;
- politique de confidentialité et durée de conservation ;
- protections et règles adaptées au RGPD si tu collectes des données de personnes en Europe ;
- sauvegardes de la base SQLite.

L'interface est volontairement "style IA", mais les réponses sont envoyées manuellement par l'administrateur : aucune API d'IA externe n'est nécessaire.
