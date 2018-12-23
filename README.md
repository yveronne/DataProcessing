# Module DataProcessing du projet de synthèse : Weather Station
## Contexte
Ceci est la documentation du module data processing, interface entre le module data storage et les modules
 Data Display, Data Acquisition et Station Manager: NodeJs + Express


### Pré-requis
Pouvoir interagir avec le module data storage de stockage des données.

### Installation
Après avoir cloné le projet, se placer dans le dossier du projet et installer les dépendances avec
```
$ npm install
```
Lancer le serveur avec
```
$ npm run start 
```
Accédez-y en cliquant sur le lien http://localhost:4000. 

### Utilisation
Listes des différentes routes supportées par notre API

Méthode HTTP | URL | Action 
-------------|-----|----------
GET | /datas | Récupère les données météorologiques du jour en cours
GET  | /archived | Récupère les données météorologiques entre une période et les renvoie dans un fichier xlsx ou csv, la période est définie par les paramètres start et end de l'url et le format par le paramètre format
POST  | /datas | Insérer les données collectées (provenant du module Data acquisition) dans la base de données
GET  | /forecastdatas | Récupère les données prévisionnelles des 5 prochains jours
