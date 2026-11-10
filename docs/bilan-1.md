# Bilan de la séance 6

## Ce que l'IA m'a aidé à faire

- Créer et activer la branche `seance06`.
- Ajouter des instructions pour les futures sessions Copilot dans le projet.
- Documenter le parcours entre le frontend, l'API backend et la base de données.
- Ajouter un filtre par période sur la page des offres :
  - Toutes les périodes ;
  - P1 ;
  - P2 ;
  - Autre.
- Envoyer le filtre à l'API et appliquer le filtrage dans la requête SQL.
- Conserver les règles d'accès selon le profil de l'utilisateur.
- Adapter les tests frontend et backend.

## Ce que j'ai vérifié

- La sélection de période est bien visible sur la page des offres.
- Sans filtre, les offres normalement accessibles restent affichées.
- Le filtre est envoyé avec le paramètre `period`.
- Les règles d'accès existantes restent appliquées.
- Les tests backend et frontend passent.
- Le typecheck et le lint passent pour les deux parties du projet.

## Difficultés rencontrées

- Les premières commandes de test ont été lancées depuis le mauvais dossier.
- La constante des codes de période devait être ajoutée côté backend.
- Certaines attentes des nouveaux tests ne correspondaient pas aux données présentes dans le seed.
- Le test frontend trouvait deux éléments portant le libellé « Autre » : l'option du filtre et la valeur affichée dans le tableau.

## Crédits IA

Début de séance : 0 %
Fin de séance : 4 %
Consommation : 4 % du quota mensuel.

