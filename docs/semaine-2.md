# Bilan de la semaine 7

## Fonctionnalités réalisées

Un étudiant peut maintenant :

- candidater à une offre publiée ;
- ajouter un message facultatif de 500 caractères maximum ;
- consulter toutes ses candidatures, y compris les anciennes et les retirées ;
- retirer une candidature encore « En cours ».

Une candidature en double est refusée tant que la précédente n'est pas retirée.
Après un retrait, l'étudiant peut recandidater et l'ancienne candidature reste
conservée dans l'historique.

## Fichiers modifiés

### Backend

- Modèles, mapper, repository et service des candidatures.
- Contrôleur et routes `POST /applications`, `GET /applications/me` et
  `DELETE /applications/:id`.
- Migration ajoutant l'unicité des candidatures actives.
- Tests backend et documentation de l'API.

### Frontend

- Modèles, service API et hook des candidatures.
- Formulaire de candidature depuis la liste des offres.
- Page « Mes candidatures » avec statuts et retrait.
- Navigation, libellés, guards et styles associés.
- Tests frontend.

## Difficultés rencontrées

- La contrainte de candidature active devait être ajoutée dans une nouvelle
  migration, sans modifier la migration initiale.
- Il fallait conserver les candidatures retirées tout en autorisant une
  nouvelle candidature.
- Le lint frontend a signalé un appel conditionnel de hook et un changement
  d'état dans un effet ; la structure du hook a été corrigée.

## Vérifications

`npm run check` a réussi avec 184 tests.

Dans le navigateur, avec **Louis Claes**, nous avons vérifié :

- candidature depuis une offre publiée avec un message ;
- retrait de la candidature ;
- nouvelle candidature après retrait, sans message ;
- conservation des deux candidatures après rechargement.

Avec **Aminata Diallo**, nous avons vérifié qu'elle ne voit pas les candidatures
de Louis.

Restent à vérifier :

- les cas d'erreur ;
- le comportement des candidatures déjà traitées ;
- les limites et la validation du message ;
- l'affichage sur mobile ;
- le comportement complet avec les données de démonstration.
