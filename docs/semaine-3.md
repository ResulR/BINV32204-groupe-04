# Bilan de la semaine 8

## 1. Guides et senseurs

### Matrice guides/senseurs

Un élément **inférentiel** donne des consignes ou du contexte à interpréter.
Un élément **computationnel** produit automatiquement un résultat vérifiable.

| Élément | Nature | Catégorie | Fichier ou commande | Constat |
|---|---|---|---|---|
| Instructions Copilot | Guide | Inférentiel | `.github/copilot-instructions.md` | Consignes pour les commandes, l'architecture, les erreurs, les migrations et les tests |
| README | Guide | Inférentiel | `README.md` | Prérequis, démarrage, choix techniques et limites connues |
| Architecture | Guide | Inférentiel | `docs/architecture.md` | Organisation backend/frontend, authentification et stratégie de tests |
| Cahier des charges | Guide | Inférentiel | `docs/cdc_gesta_developpement.md` | Exigences fonctionnelles, règles de gestion et exigences non fonctionnelles |
| Revue IA exécutée | Revue | Inférentiel | Aucun fichier ou rapport identifié | Aucune revue IA exécutée n'a été identifiée |
| Guide computationnel | Guide | Computationnel | Aucun fichier identifié | Aucun guide computationnel n'a été identifié |
| Oxlint | Senseur | Computationnel | `npm run lint` | Analyse statique et refus des avertissements |
| TypeScript | Senseur | Computationnel | `npm run typecheck` | Vérification des types backend et frontend |
| Tests backend | Senseur | Computationnel | `backend/tests/` | API, services, permissions, SQLite et règles métier |
| Tests frontend | Senseur | Computationnel | `frontend/tests/` | Pages, composants, navigation et appels API simulés |
| Build | Senseur | Computationnel | `npm run check` | Compilation du backend et du frontend dans la chaîne de vérification |

Les guides identifiés sont donc inférentiels. Les seuls éléments
computationnels identifiés sont les senseurs et les commandes de vérification ;
aucun guide computationnel n'a été trouvé.

Les tests, le lint et le typecheck ont été exécutés. Le navigateur, le
serveur de développement et les scénarios manuels n'ont pas été retestés dans
ce bilan.

## 2. Couverture d'EF-32

EF-32 concerne la candidature à une offre publiée, le message facultatif et le
retrait d'une candidature encore en cours.

| Cas | Test | Assertions principales | Couverture |
|---|---|---|---|
| Candidature avec message | `crée une candidature étudiante avec un message facultatif` dans `backend/tests/applications.test.ts` | HTTP 201, offre, message et statut `IN_PROGRESS` | Couverte |
| Candidature sans message | `accepte une candidature sans message` dans `backend/tests/applications.service.test.ts` | Message égal à `null` | Couverte au niveau service |
| Message de 500 caractères | `accepte un message de 500 caractères` dans `backend/tests/applications.test.ts` | HTTP 201, longueur 500, statut `IN_PROGRESS` | Couverte |
| Message de plus de 500 caractères | Tests service et API dans `backend/tests/applications.service.test.ts` et `backend/tests/applications.test.ts` | Exception métier, HTTP 400 et `INVALID_MESSAGE` | Couverte |
| Offre non publiée | `refuse une candidature sur une offre non publiée` dans `backend/tests/applications.test.ts` | HTTP 409 et `OFFER_NOT_PUBLISHED` | Couverte |
| Doublon actif | `refuse un doublon actif` dans `backend/tests/applications.test.ts` | HTTP 409 et `APPLICATION_EXISTS` | Couverte |
| Retrait d'une candidature en cours | `retire une candidature en cours sans la supprimer` dans `backend/tests/applications.test.ts` | Statut `WITHDRAWN`, puis candidature conservée dans la liste | Couverte |
| Retrait après traitement | `refuse de retirer une candidature déjà traitée` dans `backend/tests/applications.test.ts` et test paramétré du service | Retrait refusé, code `APPLICATION_NOT_WITHDRAWABLE` côté API | Couverte pour `SELECTED`, et au niveau service pour `REJECTED` |
| Recandidature après retrait via l'API | `autorise une recandidature après retrait via l'API` dans `backend/tests/applications.test.ts` | Retrait, nouvelle candidature `IN_PROGRESS`, historique avec deux candidatures | Couverte |
| Retrait par un autre étudiant | `refuse de retirer la candidature d'un autre étudiant` dans `backend/tests/applications.test.ts` | HTTP 404 et `APPLICATION_NOT_FOUND` | Couverte |
| Erreur affichée dans l'interface | Aucun test spécifique | — | Absente |

## 3. Couverture d'EF-33

EF-33 concerne l'affichage des candidatures et de leurs statuts : « En cours »,
« Retenue », « Non retenue » et « Retirée ».

| Cas | Test ou fichier | Assertions principales | Couverture |
|---|---|---|---|
| Liste des candidatures de l'étudiant connecté | `retourne uniquement les candidatures de l'étudiant connecté` dans `backend/tests/applications.test.ts` | HTTP 200, bonne candidature et statut | Couverte |
| Filtre par année | `filtre les candidatures par année académique` dans `backend/tests/applications.test.ts` | Réponse filtrée | Couverte |
| Affichage « En cours » | `affiche les candidatures et ne propose le retrait que pour une candidature en cours` dans `frontend/tests/ApplicationsPage.test.tsx` | Libellé présent et bouton de retrait | Couverte |
| Affichage « Retenue » | Même test frontend | Libellé `Retenue` présent | Couverte |
| Affichage « Non retenue » | Même test frontend | Libellé `Non retenue` présent | Couverte |
| Affichage « Retirée » | Même test frontend | Libellé `Retirée` présent | Couverte |
| Retrait disponible uniquement pour `IN_PROGRESS` | Même test frontend | Un seul bouton `Retirer` pour quatre candidatures | Couverte |
| Présence des quatre statuts dans le seed | `couvre tous les statuts de candidature...` dans `backend/tests/db/seed.test.ts` | Vérifie les quatre codes SQL | Partielle : présence en base, pas affichage frontend |
| Liste vide | Aucun test dédié | — | Absente |
| Erreur de chargement | Aucun test dédié à `ApplicationsPage` | — | Absente |
| Donnée avec statut invalide | Aucun test dédié | — | Absente |

## 4. Tests ajoutés

Les tests ajoutés portent sur :

- l'acceptation d'un message de exactement 500 caractères ;
- la recandidature après retrait via les routes HTTP ;
- la conservation de l'historique `WITHDRAWN` et `IN_PROGRESS` ;
- l'affichage des quatre statuts dans la page des candidatures.

Le code applicatif n'a pas été modifié.

## 5. Résultats

Le bilan de la semaine 8 retient :

- `npm run check` réussi avec **186 tests** ;
- le build backend et frontend a réussi dans `npm run check` ;
- backend : **136 tests réussis** ;
- frontend : **50 tests réussis** ;
- lint Oxlint réussi ;
- typecheck backend et frontend réussi.

Les tests ciblés ont également été exécutés pendant l'ajout des cas. Une
première assertion imposait un ordre des candidatures qui n'était pas requis
par le comportement ; elle a été rendue indépendante de l'ordre. Le test a
ensuite réussi.

## 6. Audit des instructions Copilot

| Élément audité | Constat |
|---|---|
| Commandes et structure du projet | Présentes dans `.github/copilot-instructions.md` et cohérentes avec le README |
| Architecture en couches | Présente dans le guide et détaillée dans `docs/architecture.md` |
| Authentification et autorisation | Présentes et cohérentes avec l'architecture |
| Migrations et stratégie de tests | Présentes et cohérentes |
| Type guards et règles Oxlint détaillées | Décrites dans le README/architecture, mais seulement partiellement reprises dans le guide |
| Responsive, RGPD et exigences non fonctionnelles | Présents dans le cahier des charges, absents du guide Copilot |
| Règles métier EF/RG | Décrites dans le cahier des charges, non détaillées dans le guide général |
| Documentation API et requêtes HTTP | Règle explicite du guide, sans équivalent formulé dans le README ou l'architecture |
| Contradiction directe | Aucune entre le guide, le README et l'architecture |

Une incohérence documentaire subsiste : le README indique encore que les
candidatures ne sont pas implémentées, alors que le code et les tests actuels
les prennent en charge.

## 7. Limites

- Les supports du cours Web 2 ne sont pas disponibles. La correspondance avec
  les consignes de ce cours ne peut donc pas être vérifiée.
- Les tests frontend utilisent Testing Library et des réponses API simulées ;
  ils ne constituent pas une vérification navigateur de bout en bout.
- Les cas de liste vide, d'erreur de chargement frontend et de statut invalide
  ne sont pas couverts.
- Le message vide ou composé uniquement d'espaces n'a pas de test dédié.
- L'offre inexistante n'a pas de test API dédié.
- Les scénarios manuels avec les utilisateurs de démonstration et l'affichage
  mobile n'ont pas été vérifiés dans ce bilan.

## Utilisation de Copilot

La conversation avec Copilot a été exportée dans
docs/conversation_seance08.md.

Crédits IA utilisés au moment du bilan : 20 %
