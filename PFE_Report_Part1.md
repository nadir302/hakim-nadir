# RAPPORT DE PROJET DE FIN D'ÉTUDES

## Master en Génie Informatique — Génie Logiciel

---

**[Logo Université]**

**Université :** [Nom de l'Université]  
**École :** [Nom de l'École / Faculté]  
**Filière :** Génie Informatique — Génie Logiciel

---

**Stage effectué chez :** [Nom de l'Entreprise d'Accueil]  
**Adresse :** [Adresse de l'entreprise]

---

### Smart Shuttle Management System
*Système Intelligent de Gestion de Navettes pour Événements Culturels et Publics*

---

**Réalisé par :** [Prénom NOM de l'Étudiant]

**Encadré par :**
- [Prénom NOM] — Encadrant Pédagogique (Université)
- [Prénom NOM] — Encadrant Professionnel (Entreprise)

**Année Universitaire :** 2025–2026

---

## Remerciements

La réalisation de ce projet de fin d'études n'aurait pas été possible sans le soutien et l'accompagnement de nombreuses personnes à qui je souhaite exprimer ma profonde gratitude.

Je tiens tout d'abord à remercier chaleureusement mon encadrant pédagogique, [Nom], pour sa disponibilité, ses conseils avisés et son suivi rigoureux tout au long de ce projet. Ses orientations méthodologiques m'ont permis de structurer ma réflexion et d'aborder les défis techniques avec une approche scientifique rigoureuse.

Je remercie également mon encadrant professionnel au sein de [Entreprise], [Nom], pour m'avoir accueilli dans son équipe et pour m'avoir offert un cadre de travail stimulant. Sa confiance, son expertise technique et ses retours constants ont grandement contribué à la qualité du livrable final.

J'exprime ma reconnaissance à l'ensemble de l'équipe de [Entreprise] pour leur collaboration, leur patience et leur esprit d'équipe. Les échanges quotidiens, les sessions de brainstorming et les revues de code ont été une source d'apprentissage inestimable.

Je remercie les membres du jury qui me font l'honneur d'évaluer ce travail. Leur expertise et leurs remarques constructives seront précieuses pour la suite de mon parcours.

Enfin, je remercie ma famille et mes proches pour leur soutien indéfectible, leurs encouragements constants et leur patience tout au long de cette période intense de travail.

---

## Résumé (Français)

Ce rapport présente la conception, le développement et le déploiement de *Smart Shuttle Management System*, une application web innovante destinée à la gestion intelligente des navettes de transport lors d'événements culturels et publics. Face aux défis croissants de mobilité dans les grands rassemblements — congestion, désorganisation, insatisfaction des participants — ce système propose une solution intégrée combinant réservation en ligne, matching intelligent des passagers, suivi GPS en temps réel, validation par QR Code et tableaux de bord adaptés à chaque profil d'utilisateur (Super Admin, Organisateur, Conducteur, Participant).

L'architecture technique repose sur une stack moderne : backend Express.js avec Prisma ORM et PostgreSQL, frontend React avec TypeScript et Tailwind CSS, communication temps réel via Socket.IO, et cartographie interactive avec Leaflet et OpenStreetMap, le tout containerisé avec Docker.

Les résultats obtenus démontrent une amélioration significative de l'expérience utilisateur, une réduction des temps d'attente, une optimisation du taux d'occupation des véhicules et une traçabilité complète des opérations.

**Mots-clés :** Gestion de transport, Navettes intelligentes, Suivi GPS temps réel, Matching de réservations, Socket.IO, QR Code, Prisma ORM, React, TypeScript, Docker, CI/CD.

---

## Abstract (English)

This report presents the design, development, and deployment of *Smart Shuttle Management System*, an innovative web application for intelligent shuttle transportation management during cultural and public events. Facing growing mobility challenges in large gatherings — congestion, disorganization, participant dissatisfaction — this system provides an integrated solution combining online reservation, smart passenger matching, real-time GPS tracking, QR Code boarding validation, and role-specific dashboards (Super Admin, Organizer, Driver, Participant).

The technical architecture relies on a modern stack: Express.js backend with Prisma ORM and PostgreSQL, React frontend with TypeScript and Tailwind CSS, real-time communication via Socket.IO, and interactive mapping with Leaflet and OpenStreetMap, all containerized with Docker.

The results demonstrate significant improvement in user experience, reduced waiting times, optimized vehicle occupancy rates, and complete operational traceability.

**Keywords:** Transportation management, Smart shuttles, Real-time GPS tracking, Reservation matching, Socket.IO, QR Code, Prisma ORM, React, TypeScript, Docker, CI/CD.

---

## Table des Matières

**Introduction Générale**

**Chapitre 1 : Présentation de l'Entreprise d'Accueil**
1.1 Historique et Création
1.2 Organisation et Structure Hiérarchique
1.3 Domaines d'Activité et Marchés
1.4 Mission, Vision et Valeurs
1.5 Positionnement Stratégique

**Chapitre 2 : Analyse du Problème**
2.1 Entretiens avec les Parties Prenantes
2.2 Observation Terrain (Gemba)
2.3 Analyse Documentaire
2.4 Benchmark Concurrentiel
2.5 Modélisation BPMN
2.6 Value Stream Mapping
2.7 Méthode des Cinq Pourquoi
2.8 Diagramme d'Ishikawa
2.9 Analyse SWOT
2.10 Analyse PESTEL
2.11 Analyse des Risques
2.12 Matrice Impact/Effort

**Chapitre 3 : Conception Métier**
3.1 Design Thinking
3.2 Lean Canvas
3.3 Business Model Canvas
3.4 Personas Utilisateurs
3.5 Customer Journey Map
3.6 User Stories
3.7 Product Backlog
3.8 Diagrammes de Cas d'Utilisation UML
3.9 Wireframes et Maquettes
3.10 Tests Utilisateurs

**Chapitre 4 : Conception Technique**
4.1 Architecture C4
4.2 Diagramme de Classes
4.3 Diagrammes de Séquence
4.4 Diagramme d'États
4.5 Diagramme de Composants
4.6 Modèle de Données (ERD)
4.7 Conception de la Base de Données
4.8 Conception des API REST
4.9 Documentation Swagger
4.10 Stack Technologique
4.11 Architecture de Sécurité
4.12 Architecture Cloud

**Chapitre 5 : Planification et Gestion de Projet**
5.1 Méthode MoSCoW
5.2 Lean Startup et MVP
5.3 Roadmap Produit
5.4 Sprint Planning
5.5 Tableau Kanban
5.6 Diagramme de Gantt

**Chapitre 6 : Développement**
6.1 Architecture du Backend
6.2 Architecture du Frontend
6.3 Implémentation de la Base de Données
6.4 Authentification JWT
6.5 Contrôle d'Accès (RBAC)
6.6 API REST
6.7 Socket.IO
6.8 Suivi GPS
6.9 QR Code
6.10 Cartographie Interactive
6.11 Docker
6.12 Structure du Projet

**Chapitre 7 : Tests**
7.1 Tests Unitaires
7.2 Tests d'Intégration
7.3 Tests Fonctionnels
7.4 Tests de Sécurité
7.5 Tests de Performance
7.6 Tests d'Acceptation Utilisateur

**Chapitre 8 : Déploiement**
8.1 CI/CD
8.2 Déploiement Docker
8.3 Cloud
8.4 HTTPS et DNS
8.5 Monitoring
8.6 Logs
8.7 Sauvegardes

**Chapitre 9 : Sécurité**
9.1 JWT
9.2 RBAC
9.3 Chiffrement
9.4 HTTPS
9.5 Validation
9.6 Variables d'Environnement
9.7 Rate Limiting
9.8 Helmet
9.9 CORS
9.10 XSS et CSRF
9.11 Audit Logs

**Chapitre 10 : Résultats**
10.1 Captures d'Écran
10.2 KPIs
10.3 Avantages et Limitations

**Conclusion Générale**
11.1 Évaluation du Projet
11.2 Améliorations Futures
11.3 Intelligence Artificielle

**Références**

**Annexes**

---

# Introduction Générale

## Contexte Général

À l'ère du numérique, la transformation digitale des services de transport constitue un enjeu majeur pour les collectivités, les organisateurs d'événements et les entreprises de mobilité. Chaque année, des milliers d'événements culturels, sportifs et publics rassemblent des centaines de milliers de participants, générant des défis logistiques considérables en matière de transport et de mobilité.

La gestion traditionnelle des navettes lors de ces événements repose souvent sur des processus manuels, des feuilles de calcul Excel, des communications téléphoniques non structurées et une absence totale de visibilité en temps réel. Cette situation entraîne des inefficiences majeures : des participants qui attendent longtemps à des points de prise en charge mal organisés, des conducteurs qui naviguent sans information sur leur charge, des organisateurs qui manquent de données pour piloter leurs opérations.

## Problématique

La problématique centrale de ce projet s'articule autour de la question suivante :

**Comment concevoir et développer un système intelligent de gestion de navettes qui permette d'optimiser le transport des participants lors d'événements, en assurant une réservation fluide, un matching efficace des passagers, un suivi en temps réel et une expérience utilisateur supérieure ?**

Cette problématique se décline en plusieurs sous-questions :
1. Comment automatiser le processus de réservation et d'affectation des participants aux navettes ?
2. Comment assurer un matching intelligent qui regroupe les participants par proximité géographique et temporelle ?
3. Comment offrir une visibilité en temps réel sur la position des navettes et l'état des trajets ?
4. Comment garantir la sécurité, la fiabilité et la scalabilité du système ?
5. Comment fournir des outils d'analyse et de reporting pour améliorer continuellement le service ?

## Objectifs

**Objectif principal :** Développer une application web complète de gestion intelligente de navettes qui couvre l'ensemble du cycle de vie : planification des événements, réservation des places, assignment aux navettes, suivi GPS en temps réel et analyse post-événement.

**Objectifs spécifiques :**
1. **Conception centrée utilisateur :** Appliquer une méthodologie Design Thinking pour comprendre les besoins réels de chaque profil d'utilisateur.
2. **Matching intelligent :** Implémenter un algorithme de matching qui regroupe automatiquement les participants par proximité (500 mètres) et par plage horaire (±15 minutes).
3. **Suivi temps réel :** Développer un système de suivi GPS en temps réel avec calcul d'ETA et alertes de proximité à plusieurs niveaux.
4. **Validation sécurisée :** Mettre en place un système de validation par QR Code avec JWT intégré.
5. **Tableaux de bord :** Concevoir des tableaux de bord personnalisés pour chaque rôle avec des indicateurs clés de performance.
6. **Architecture robuste :** Bâtir une architecture modulaire, scalable et sécurisée, containerisée avec Docker et déployée via CI/CD.

## Motivation

La motivation derrière ce projet découle de plusieurs constats. D'un point de vue académique, ce projet permet d'appliquer l'ensemble des connaissances acquises durant le cursus de génie logiciel : analyse des besoins, conception orientée objet, développement full-stack, bases de données, sécurité, déploiement et gestion de projet agile. D'un point de vue professionnel, le sujet répond à un besoin réel et immédiat du marché. Les organisateurs d'événements cherchent constamment des solutions pour améliorer la mobilité de leurs participants, réduire l'empreinte carbone des déplacements et offrir une expérience digitale enrichie. D'un point de vue technologique, le projet permet d'explorer et de maîtriser une stack technique moderne et très demandée sur le marché du travail : TypeScript, React, Node.js, Prisma ORM, PostgreSQL, Socket.IO, Docker et CI/CD.

## Résultats Attendus

À l'issue de ce projet, nous attendons les livrables suivants :
1. Un cahier des charges fonctionnel et technique complet.
2. Une application web fonctionnelle déployée et accessible.
3. Une base de données PostgreSQL optimisée avec schéma Prisma.
4. Une documentation API complète via Swagger/OpenAPI.
5. Une suite de tests couvrant les aspects unitaires, d'intégration et fonctionnels.
6. Un pipeline CI/CD automatisé.
7. Un rapport de projet détaillé (le présent document).

## Structure du Rapport

Ce rapport est structuré en dix chapitres, suivant une progression logique du projet. Le Chapitre 1 présente l'entreprise d'accueil. Le Chapitre 2 détaille l'analyse approfondie du problème selon douze méthodologies complémentaires. Le Chapitre 3 décrit la conception métier centrée utilisateur. Le Chapitre 4 expose l'architecture technique complète. Le Chapitre 5 présente la planification et la gestion de projet. Le Chapitre 6 détaille l'implémentation technique. Le Chapitre 7 couvre la stratégie de test. Le Chapitre 8 décrit le déploiement. Le Chapitre 9 détaille les aspects de sécurité. Enfin, le Chapitre 10 présente les résultats obtenus.

Chaque chapitre débute par une introduction qui le replace dans la logique globale du projet et se termine par une conclusion qui synthétise les acquis et prépare le chapitre suivant.

---

# Chapitre 1 : Présentation de l'Entreprise d'Accueil

## 1.1 Introduction

Ce premier chapitre est consacré à la présentation de l'entreprise d'accueil qui a servi de cadre à la réalisation de ce projet de fin d'études. Comprendre l'organisation, la culture et les activités de l'entreprise est essentiel pour appréhender le contexte dans lequel le Smart Shuttle Management System a été conçu et développé.

## 1.2 Historique et Création

[Nom de l'Entreprise] a été fondée en [Année] par [Fondateur] avec la vision de révolutionner la gestion logistique des événements culturels et sportifs. Initialement spécialisée dans le conseil en organisation d'événements, l'entreprise a rapidement identifié le besoin critique d'une solution digitale pour la gestion des transports de participants.

Depuis sa création, l'entreprise est passée par plusieurs phases de croissance :
- **Phase 1 — Fondation :** Conseil en logistique événementielle.
- **Phase 2 — Digitalisation :** Développement d'une première version d'un outil de gestion de réservations.
- **Phase 3 — Croissance :** Élargissement de l'offre avec des solutions de suivi et de reporting.
- **Phase 4 — Maturité :** Positionnement comme acteur de référence dans la mobilité événementielle intelligente.

Aujourd'hui, l'entreprise compte [Nombre] employés et a servi plus de [Nombre] événements, transportant au total [Nombre] participants.

## 1.3 Organisation et Structure Hiérarchique

L'entreprise adopte une structure hiérarchique fonctionnelle, organisée autour de quatre pôles principaux :

- **Direction Générale :** Assure la vision stratégique, la gouvernance et la représentation externe.
- **Pôle Technique :** Regroupe les ingénieurs logiciels, les architectes et les DevOps. Responsable de la conception, du développement, du déploiement et de la maintenance des solutions logicielles. L'équipe suit la méthodologie Scrum avec des sprints de deux semaines.
- **Pôle Opérations :** Gère la logistique terrain, le support client et la coordination avec les transporteurs partenaires.
- **Pôle Commercial :** Assure la prospection, les ventes, le marketing et la relation client.

**Organigramme :**

```
+----------------------------------+
|          Direction Générale       |
+----------------------------------+
                |
     +----------+---------+
     |          |         |
+--------+ +--------+ +--------+
| Pôle   | | Pôle   | | Pôle   |
| Tech   | | Opérations| Commercial|
+--------+ +--------+ +--------+
     |          |         |
+--------+ +--------+ +--------+
| Dev    | | Logistique| Ventes |
| Infra  | | Support  | Marketing|
| Data   | | Transport|         |
+--------+ +--------+ +--------+
```

## 1.4 Domaines d'Activité et Marchés

L'entreprise opère sur plusieurs segments de marché :
- **Événements Culturels :** Festivals de musique, expositions, spectacles.
- **Événements Sportifs :** Compétitions, rassemblements amateurs, e-sport.
- **Événements Professionnels :** Conférences, congrès, salons, séminaires.
- **Événements Publics :** Célébrations nationales, marchés de Noël, feux d'artifice.

Pour chaque type d'événement, l'entreprise propose une solution de gestion de navettes adaptée aux spécificités du public (nombre de participants, zones géographiques, contraintes horaires, etc.).

## 1.5 Mission, Vision et Valeurs

**Mission :** "Révolutionner la mobilité événementielle en offrant des solutions intelligentes, durables et centrées sur l'utilisateur qui transforment l'expérience de transport des participants."

**Vision :** "Devenir le leader incontesté de la gestion intelligente de navettes pour événements, en créant un écosystème où chaque participant se déplace de manière fluide, chaque conducteur optimise sa route, et chaque organisateur pilote ses opérations avec une visibilité totale."

**Valeurs :**
- **Innovation :** Investissement continu dans la R&D pour proposer des fonctionnalités de pointe.
- **Excellence opérationnelle :** Même niveau d'exigence et de professionnalisme pour chaque événement.
- **Centricité utilisateur :** Les besoins des utilisateurs finaux sont au cœur de chaque décision.
- **Durabilité :** Optimisation du taux de remplissage pour réduire l'empreinte carbone.
- **Transparence :** Données, processus et décisions transparents pour toutes les parties prenantes.

## 1.6 Positionnement Stratégique

L'entreprise se positionne à l'intersection de trois marchés en pleine croissance : le marché de la gestion d'événements ($1.1 trillion d'ici 2028), le marché des solutions de mobilité intelligente ($150 milliards d'ici 2030) et le marché du SaaS pour entreprises ($300+ milliards d'ici 2028). Ce positionnement unique offre un avantage concurrentiel significatif : contrairement aux solutions génériques de transport (Uber, Lyft) ou aux outils de gestion d'événements (Eventbrite, Bizzabo), notre solution combine spécifiquement la réservation événementielle avec la logistique de transport en temps réel.

## 1.7 Conclusion

Ce premier chapitre a permis de situer le contexte organisationnel du projet. [Nom de l'Entreprise] est une entreprise innovante, bien positionnée sur le marché de la mobilité événementielle, avec une culture forte centrée sur l'utilisateur et l'excellence technique. Le chapitre suivant entre dans le vif du sujet avec une analyse approfondie du problème que notre système vise à résoudre.

---

# Chapitre 2 : Analyse du Problème

## 2.1 Introduction

Avant de concevoir une solution, il est impératif de comprendre en profondeur le problème à résoudre. Ce chapitre présente une analyse systématique et méthodique de la problématique de gestion des navettes lors d'événements. Nous mobilisons douze outils et méthodologies complémentaires, allant des entretiens qualitatifs à l'analyse stratégique SWOT, en passant par la modélisation des processus BPMN et l'analyse des causes racines avec les Cinq Pourquoi.

## 2.2 Entretiens avec les Parties Prenantes

**Explication de la Méthode :** L'entretien est une technique de recherche qualitative qui consiste à recueillir des informations verbales auprès des parties prenantes du projet. Dans notre cas, nous avons opté pour des entretiens semi-structurés, permettant à la fois de couvrir les thèmes essentiels et de laisser émerger des insights inattendus.

**Objectif :** Comprendre les besoins, les frustrations, les attentes et les contraintes de chaque catégorie d'utilisateur.

**Application au Projet :** Nous avons mené 15 entretiens répartis comme suit :

| Catégorie | Nombre | Profils |
|-----------|--------|---------|
| Organisateurs | 5 | Directeurs logistiques, coordinateurs |
| Conducteurs | 4 | Chauffeurs expérimentés, chefs de parc |
| Participants | 4 | Participants réguliers, familles |
| Super Admins | 2 | DSI, Responsable opérations |

**Résultats :** Les entretiens ont révélé huit problèmes majeurs :
1. Absence de plateforme centralisée (100% des organisateurs utilisent Excel et le téléphone).
2. Mauvaise expérience participant (75% ont déjà attendu plus de 30 minutes).
3. Sous-occupation des véhicules (taux de remplissage moyen de 45%).
4. Manque de visibilité temps réel (100% des conducteurs ne savent pas combien de passagers les attendent).
5. Absence de traçabilité (aucun historique fiable des trajets).
6. Communication inefficace (changements communiqués au dernier moment).
7. Processus d'embarquement lent (embarquement manuel sans contrôle efficace).
8. Pas d'analyse post-événement (aucune donnée collectée pour améliorer les éditions futures).

## 2.3 Observation Terrain (Gemba)

**Explication de la Méthode :** Le Gemba (現場) est un concept japonais signifiant "le vrai lieu" — l'endroit où la valeur est créée. Popularisé par Toyota, le Gemba Walk consiste à se rendre sur le terrain pour observer directement les processus en action.

**Objectif :** Observer en conditions réelles le déroulement d'un événement avec navettes et identifier les gaspillages.

**Application au Projet :** Deux observations terrain ont été réalisées. Lors d'un festival de musique (5 000 participants, 12 bus), nous avons constaté un temps d'attente moyen de 27 minutes à l'embarquement, un taux d'occupation moyen de 42%, une communication désorganisée via talkie-walkie, et aucune donnée collectée. Lors d'un salon professionnel (2 000 participants, 6 minibus), les minibus de 20 places étaient régulièrement saturés et 30% des trajets retour se faisaient à vide.

**Résultats :** Les gaspillages les plus importants sont l'attente (participants et navettes), les trajets à vide, la sous-occupation et la non-utilisation des données.

## 2.4 Analyse Documentaire

**Explication de la Méthode :** L'analyse documentaire examine de manière systématique des documents existants pour en extraire des informations pertinentes.

**Résultats :** L'analyse des rapports d'activité des 10 derniers événements révèle :
- Taux d'occupation moyen : 45.3% (min 32%, max 68%)
- Temps d'attente moyen : 22 minutes (min 8 min, max 45 min)
- Réclamations participants : 34 en moyenne par événement

La revue de littérature a identifié cinq articles scientifiques pertinents sur l'optimisation des navettes, les systèmes d'information en temps réel, les solutions de mobilité intelligente, les systèmes d'embarquement par QR Code et les approches de ML pour la prédiction de la demande.

## 2.5 Benchmark Concurrentiel

**Objectif :** Comparer notre solution avec les existantes sur le marché et identifier un positionnement différenciant.

**Solutions analysées :** Eventbrite Transport, Moovit, TripShot, ShuttleTrack, CoachHire, Whim.

**Résultats :** Aucun concurrent ne couvre l'ensemble des fonctionnalités dans une solution unifiée. Notre positionnement est clair : la première plateforme tout-en-un de gestion intelligente de navettes événementielles, combinant réservation, matching, suivi GPS, QR Code, tableaux de bord et reporting.

## 2.6 Modélisation BPMN

**Explication de la Méthode :** Le BPMN (Business Process Model and Notation) est une norme ISO pour la modélisation des processus métier utilisant des activités, événements, gateways et flux.

**Processus modélisés :**
1. **Planification des navettes :** Manuel, basé sur l'intuition, sans boucle de rétroaction.
2. **Réservation des participants :** Email ou téléphone, confirmation non automatisée.
3. **Exécution des trajets :** Attente des deux côtés, pas de contrôle d'accès.
4. **Clôture et bilan :** Rapport manuscrit, pas d'analyse systématique.

Les diagrammes BPMN mettent en évidence des processus fragmentés, manuels, sans boucle de rétroaction et sans données.

## 2.7 Value Stream Mapping (VSM)

**Objectif :** Analyser le flux de valeur du processus de transport d'un participant et quantifier les gaspillages.

**VSM Actuel (parcours participant) :**

| Étape | Temps VA | Temps total | Efficacité |
|-------|----------|-------------|------------|
| Recherche d'information | 2 min | 15 min | 13% |
| Réservation | 5 min | 10 min | 50% |
| Confirmation | 1 min | 480 min | 0.2% |
| Trajet vers point PEC | 20 min | 20 min | 100% |
| Attente au point PEC | 0 min | 27 min | 0% |
| Embarquement | 2 min | 5 min | 40% |
| Trajet | 30 min | 30 min | 100% |
| Débarquement | 1 min | 2 min | 50% |
| **Total** | **61 min** | **589 min** | **10.4%** |

**VSM Cible (avec notre solution) :**

| Étape | Temps VA | Temps total | Efficacité |
|-------|----------|-------------|------------|
| Réservation en ligne | 3 min | 3 min | 100% |
| Confirmation automatique | 0 min | 0 min | 100% |
| Matching intelligent | 0 min | 0 min | 100% |
| Trajet vers point PEC optimisé | 10 min | 10 min | 100% |
| Attente minimisée | 0 min | 3 min | 100% |
| Embarquement QR Code | 0.5 min | 0.5 min | 100% |
| Trajet optimisé | 25 min | 25 min | 100% |
| Débarquement | 1 min | 1 min | 100% |
| **Total** | **39.5 min** | **42.5 min** | **93%** |

Le VSM démontre que notre solution peut faire passer l'efficacité de 10.4% à 93%, soit un gain d'un facteur 9.

## 2.8 Méthode des Cinq Pourquoi

**Application :** Analyse de trois problèmes majeurs.

**Problème 1 — Taux d'occupation < 50% :** Cause racine = Absence de données prouvant le ROI d'une solution digitale. Solution = Tableaux de bord et rapports détaillés.

**Problème 2 — Temps d'attente > 20 min :** Cause racine = Absence d'incitation à la réservation anticipée. Solution = Application rendant la réservation obligatoire et facile.

**Problème 3 — Absence de traçabilité :** Cause racine = Manque de communication sur les besoins de données. Solution = KPIs et rapports qui créent une demande de données.

## 2.9 Diagramme d'Ishikawa

**Problème central :** "Gestion inefficace des navettes lors des événements"

Les six catégories de causes identifiées :
1. **Main-d'œuvre :** Conducteurs non formés, coordinateurs dépassés.
2. **Méthodes :** Réservation manuelle, planification intuitive, pas de coordination temps réel.
3. **Matériel :** Navettes inadaptées, pas de bornes de pointage, pas de GPS.
4. **Milieu :** Météo, affluence variable, circulation, espaces contraints.
5. **Matières :** Aucune donnée historique, pas de prévision de la demande.
6. **Management :** Pas d'indicateurs, pas d'objectifs, pas d'amélioration continue.

## 2.10 Analyse SWOT

| Forces | Faiblesses |
|--------|------------|
| Solution tout-en-un | Solution nouvelle sans retour d'expérience |
| Matching intelligent | Dépendance à la connectivité |
| Architecture moderne (Docker, PostgreSQL) | Courbe d'apprentissage |
| Suivi GPS temps réel 3 niveaux | Documentation à enrichir |
| Validation QR Code sécurisée | |
| 4 rôles distincts | |
| Stack technique moderne | |

| Opportunités | Menaces |
|--------------|---------|
| Croissance du marché événementiel post-COVID | Entrée de grands acteurs (Uber, Google) |
| Demande de mobilité durable | Solutions open source émergentes |
| Digitalisation des transports | Évolution RGPD |
| Prise de conscience écologique | Concurrence des solutions gratuites |
| Marché de niche peu adressé | Crise économique |
| Généralisation smartphone/4G/5G | Variabilité des normes |

## 2.11 Analyse PESTEL

**Facteurs Politiques :** Soutien aux mobilités douces, subventions pour la digitalisation. Impact favorable.

**Facteurs Économiques :** Marché événementiel en croissance ($1.1 trillion), budget transport 15-25% de la logistique. Favorable.

**Facteurs Sociologiques :** Attentes digitales élevées, préférence pour le transport collectif, exigence de transparence. Très favorable.

**Facteurs Technologiques :** 85% de smartphones, couverture 4G/5G, technologies matures (React, Node.js, Docker), écosystème open source (Leaflet, OSRM). Très favorable.

**Facteurs Environnementaux :** Transport = 40-60% de l'empreinte carbone d'un événement. Favorable.

**Facteurs Légaux :** RGPD, Code des transports, assurance. À surveiller.

## 2.12 Analyse des Risques

| ID | Risque | Probabilité | Impact | Niveau | Mitigation |
|----|--------|:-----------:|:------:|:------:|------------|
| R1 | Indisponibilité API Google Maps | 4 | 4 | 16 | Migré vers Leaflet/OSM |
| R2 | Perte de données | 2 | 5 | 10 | Sauvegardes automatisées |
| R3 | Panne Socket.IO | 2 | 4 | 8 | Mode dégradé polling |
| R4 | Concurrence accès réservations | 3 | 3 | 9 | Transactions Prisma |
| R5 | Adoption insuffisante conducteurs | 3 | 4 | 12 | Formation, interface simplifiée |
| R6 | Refus participants | 2 | 3 | 6 | Communication, incitations |
| R7 | Scope creep | 4 | 3 | 12 | MoSCoW, backlog priorisé |
| R8 | Bug critique production | 3 | 5 | 15 | Tests, CI/CD, rollback |
| R9 | Panne fournisseur cloud | 1 | 5 | 5 | Multi-région, backup local |
| R10 | Non-conformité RGPD | 2 | 5 | 10 | Audit RGPD |
| R11 | Problème performance | 2 | 4 | 8 | Tests de charge |
| R12 | Package non maintenu | 3 | 2 | 6 | Dependabot |

## 2.13 Matrice Impact/Effort

**Quick Wins (fort impact, faible effort) :** QR Code embarquement, notifications automatiques, export PDF rapports, gestion listes d'attente.

**Grands Projets (fort impact, fort effort) :** Réservation en ligne, matching intelligent, suivi GPS, tableaux de bord, IA prédictive.

**Stratégie :** Phase 1 = Quick Wins. Phase 2 = Grands Projets. Phase 3 = Innovation (IA).

## 2.14 Synthèse du Chapitre

| Méthode | Apport Principal |
|---------|-----------------|
| Entretiens | Besoins qualitatifs des 4 profils |
| Observation Gemba | Gaspillages réels sur le terrain |
| Analyse documentaire | Contexte académique + données historiques |
| Benchmark | Positionnement concurrentiel |
| BPMN | Processus fragmentés et manuels |
| VSM | Efficacité 10.4% → objectif 93% |
| 5 Pourquoi | Causes racines des problèmes |
| Ishikawa | Vision systémique des causes |
| SWOT | Positionnement stratégique |
| PESTEL | Macro-environnement favorable |
| Analyse des risques | 12 risques identifiés et mitigés |
| Impact/Effort | Priorisation des actions |

**Conclusion principale :** Le besoin est réel, le marché est prêt, la technologie est mature, et notre positionnement est différenciant.

---

# Chapitre 3 : Conception Métier

## 3.1 Introduction

Après avoir analysé en profondeur le problème, ce troisième chapitre est consacré à la conception de la solution du point de vue métier. Nous adoptons une approche centrée utilisateur (User-Centered Design) en mobilisant les outils du Design Thinking, du Lean Startup et de la modélisation UML.

## 3.2 Design Thinking

Le Design Thinking est une méthodologie de conception centrée sur l'humain qui se décompose en cinq phases : Empathie, Définition, Idéation, Prototypage et Test.

**Phase 1 — Empathie :** 15 entretiens + observations terrain. Création de cartes d'empathie pour chaque profil.

**Phase 2 — Définition :** Synthèse en un énoncé de problème : "Les organisateurs d'événements ont besoin d'un moyen simple et efficace de gérer le transport de leurs participants."

**Phase 3 — Idéation :** Deux sessions de brainstorming (6 participants, 50+ idées). Idées retenues : application web responsive, matching automatique, QR Code dynamique, tableau de bord temps réel, notifications multi-niveaux, rapports automatiques.

**Phase 4 — Prototypage :** Wireframes basse fidélité (Balsamiq) + maquettes haute fidélité (Figma).

**Phase 5 — Test :** Tests avec 3 organisateurs, 2 conducteurs et 3 participants (section 3.10).

## 3.3 Lean Canvas

| Bloc | Contenu |
|------|---------|
| **Problème** | Planification manuelle, absence de visibilité, taux d'occupation < 50%, embarquement lent, pas de données |
| **Segments Clients** | Organisateurs (B2B), Conducteurs (B2B), Participants (B2C), Super Admins |
| **Proposition de Valeur** | "La première plateforme tout-en-un de gestion intelligente de navettes événementielles" |
| **Solution** | Réservation en ligne, matching intelligent, suivi GPS, QR Code, tableaux de bord |
| **Canaux** | Site web, démos, partenariats, salons, bouche-à-oreille |
| **Flux de Revenus** | Abonnement SaaS mensuel/annuel, prix par événement, services premium |
| **Structure de Coûts** | Développement (60%), hébergement (20%), marketing (10%), autres (10%) |
| **Métriques Clés** | Événements gérés, taux d'occupation, temps d'attente, NPS, churn rate |
| **Avantage Concurrentiel** | Solution tout-en-un, matching intelligent propriétaire, architecture temps réel |

## 3.4 Business Model Canvas

Le Business Model Canvas complète le Lean Canvas en mettant en évidence les partenaires clés (transporteurs, hébergeurs cloud, API OSM), les activités clés (développement, support client, maintenance, R&D), les ressources clés (équipe technique, infrastructure cloud, données, marque), les relations clients (support en ligne, formations, communauté), et les canaux de distribution.

## 3.5 Personas Utilisateurs

**Persona 1 — Marc, l'Organisateur (38 ans) :** Directeur Logistique, 8 ans d'expérience, organise 5-6 événements par an. Objectif : offrir une expérience transport fluide. Frustration : processus manuel chronophage, absence de visibilité. Citation : "J'aimerais pouvoir me concentrer sur l'expérience des participants plutôt que de gérer le chaos des navettes."

**Persona 2 — Sophie, la Participante (26 ans) :** Ingénieure commerciale, participe à 3-4 événements par an. Objectif : réserver simplement et savoir exactement où aller. Frustration : incertitude et attente prolongée. Citation : "Je veux juste savoir à quelle heure arrive ma navette et ne pas attendre sous la pluie."

**Persona 3 — Karim, le Conducteur (45 ans) :** 15 ans d'expérience, travaille en freelance. Objectif : connaître le nombre exact de passagers. Frustration : instructions peu claires. Citation : "Je suis là pour conduire, pas pour gérer la logistique."

**Persona 4 — Amine, le Super Admin (42 ans) :** Directeur des Opérations, gère 5 organisateurs. Objectif : vue d'ensemble et analyse des performances. Frustration : données disparates, pas de reporting. Citation : "Sans données, nous pilotons à l'aveugle."

## 3.6 Customer Journey Map

Le CJM de l'état actuel montre des émotions négatives à chaque étape (incertitude → frustration → stress → soulagement). Le CJM de l'état cible avec notre solution montre une transformation radicale : chaque point de douleur est adressé par une fonctionnalité spécifique (réservation 1 clic, confirmation immédiate, GPS navigation, notifications, QR Code scan, suivi live, feedback).

## 3.7 User Stories

20 User Stories organisées en 6 épiques, chacune avec des critères d'acceptation précis :

| ID | User Story |
|----|-----------|
| US-001 | En tant que visiteur, je veux créer un compte |
| US-002 | En tant qu'utilisateur, je veux me connecter |
| US-003 | En tant qu'utilisateur, je veux réinitialiser mon mot de passe |
| US-010 | En tant qu'organisateur, je veux créer un événement |
| US-011 | En tant qu'organisateur, je veux modifier un événement |
| US-020 | En tant que participant, je veux réserver une place |
| US-021 | En tant que participant, je veux voir les suggestions de matching |
| US-022 | En tant que participant, je veux rejoindre un trajet existant |
| US-030 | En tant que conducteur, je veux démarrer le partage GPS |
| US-031 | En tant que participant, je veux voir la position de ma navette |
| US-040 | En tant que participant, je veux présenter mon QR Code |
| US-050 | En tant que Super Admin, je veux un tableau de bord global |

## 3.8 Product Backlog

26 items pour un total de 176 story points. Items P0/P1 représentant le MVP (6 sprints). Items P2 (rapports, listes d'attente, CI/CD) traités en sprint 7 ou repoussés en V2.

## 3.9 Diagrammes de Cas d'Utilisation

Quatre acteurs identifiés : Participant (s'authentifier, réserver, suivre, QR Code), Organisateur (gérer événements/routes/points PEC, monitoring, rapports), Conducteur (démarrer/arrêter GPS, changer statut, scanner QR), Super Admin (gérer utilisateurs/véhicules/conducteurs, tableau de bord global).

## 3.10 Wireframes et Maquettes

Wireframes créés pour : page de connexion, dashboard participant, suivi GPS temps réel, réservation avec matching. Maquettes haute fidélité réalisées sur Figma avec une palette de couleurs professionnelle (primaire : #2563eb, succès : #22c55e, erreur : #ef4444).

## 3.11 Tests Utilisateurs

Protocole : 8 participants, modéré, 45 min par session, 7 tâches testées. Résultats : taux de succès > 85% sur toutes les tâches. Améliorations suite aux tests : bouton "Rechercher" mis en évidence, explications textuelles ajoutées pour le matching, légende de carte ajoutée, tooltips d'aide.

## 3.12 Synthèse du Chapitre

| Outil | Livrable |
|-------|----------|
| Design Thinking | Cartes d'empathie, POV, idées validées |
| Lean Canvas | Modèle d'affaires en 9 blocs |
| BMC | Modèle d'affaires complet |
| Personas | 4 personas détaillés |
| CJM | Parcours actuel vs cible |
| User Stories | 20 US avec critères d'acceptation |
| Product Backlog | 26 items, 176 story points |
| Cas d'utilisation | 4 acteurs, 15 cas |
| Wireframes | 4 écrans principaux |
| Tests utilisateurs | 8 participants, 88% succès |

---

# Chapitre 4 : Conception Technique

## 4.1 Introduction

Après avoir défini le périmètre fonctionnel et les besoins métier, ce quatrième chapitre présente la conception technique détaillée du Smart Shuttle Management System. Nous adoptons une approche d'architecture logicielle en couches, en suivant les principes du Clean Architecture.

## 4.2 Architecture C4

### Niveau 1 — Diagramme de Contexte

Le système interagit avec quatre acteurs (Participant, Organisateur, Conducteur, Super Admin) et trois systèmes externes : le service de cartographie (OSM/Leaflet avec Nominatim et OSRM — gratuit), le serveur SMTP pour les emails, et Redis pour le cache.

### Niveau 2 — Diagramme de Conteneurs

Trois conteneurs principaux :
1. **Application Frontend (React + TypeScript + Vite)** : SPA communiquant via REST (Axios) et WebSocket (Socket.IO client). UI : Shadcn/Radix UI, Tailwind CSS. State : Zustand + React Query.
2. **Application Backend (Express.js + Node.js)** : API RESTful + WebSocket server. Validation Zod. ORM Prisma. Middleware Helmet, CORS, Rate Limiting.
3. **Base de Données (PostgreSQL)** : Schéma géré par Prisma, indexation pour performances.

### Niveau 3 — Diagramme de Composants

Le backend est organisé en 4 couches : Routes (10 modules), Middleware (auth, error, audit, validation), Controllers (7 contrôleurs), Services (8 services dont matching et tracking).

## 4.3 Diagramme de Classes

Les entités principales sont : User, Driver, Vehicle, Event, Route, RouteStop, PickupPoint, Reservation, Trip, Notification, TrackingLog, SharedPickup, WaitingList, ReservationStatusHistory.

Relations clés :
- User 1..1 → Driver (optionnel)
- User 1..N → Reservation (en tant que Participant)
- Event 1..N → Route, PickupPoint, Reservation
- Route 1..N → RouteStop (ordonné)
- Trip N..1 → Driver, Vehicle, Route
- Reservation N..1 → Trip, PickupPoint (optionnel)

## 4.4 Diagrammes de Séquence

**Séquence — Réservation avec Matching :**

1. Participant → POST /reservations (avec coordonnées GPS, horaire, nb passagers)
2. Backend → matchingService.findMatches()
3. matchingService calcule les distances (haversine) et les compatibilités temporelles
4. matchingService retourne les trajets compatibles classés par pertinence
5. Backend → 200 OK avec suggestions de matching
6. Participant → POST /reservations/join-trip (choisit un trajet)
7. Backend → Ajoute le participant au SharedPickup existant
8. Backend → Socket.IO : pickup-optimized vers les participants du groupe
9. Backend → Notification : "Votre point de prise en charge a été optimisé"

**Séquence — Suivi GPS Temps Réel :**

1. Conducteur → Socket.IO: gps-update {tripId, lat, lng, speed, heading}
2. Backend → trackingService.updateLocation()
3. trackingService met à jour Vehicle (position) et Trip (progress, ETA)
4. trackingService calcule les distances aux points de prise en charge
5. Si distance < 500m → checkProximityToPickups()
6. Socket.IO → location-update vers room trip:<id> (tous les participants)
7. Socket.IO → shuttle-near {stage: 'approaching'} vers les participants concernés
8. Si distance < 200m → shuttle-near {stage: 'very-close'}
9. Si distance < 50m → shuttle-near {stage: 'arrived'}

## 4.5 Diagramme d'États

**Machine à états — Reservation :**
PENDING → CONFIRMED → CHECKED_IN → COMPLETED
                              ↕ (via annulation)
                          CANCELLED

**Machine à états — Trip :**
SCHEDULED → IN_PROGRESS → COMPLETED
    ↓            ↓
    ↕ DELAYED    ↕ (ou DELAYED)
CANCELLED    CANCELLED

Transitions autorisées :
- SCHEDULED → IN_PROGRESS, CANCELLED
- IN_PROGRESS → COMPLETED, DELAYED
- DELAYED → IN_PROGRESS, COMPLETED, CANCELLED
- COMPLETED → (aucune)

## 4.6 Diagramme de Composants Frontend

Le frontend React est organisé en 6 dossiers principaux :
- **components/ui** : Composants UI génériques (Shadcn)
- **components/shared** : Composants partagés (DataTable, EntityModal, ErrorBoundary, NotificationCenter, Skeleton)
- **components/maps** : Composants cartographiques (TrackingMap, ShuttleMap)
- **components/layout** : Layout principal avec sidebar
- **pages** : Pages par rôle (admin, organizer, driver, participant, auth)
- **services** : API (Axios), WebSocket, Validation
- **hooks** : Hooks personnalisés (useSocket)
- **store** : État global (Zustand pour auth)

## 4.7 Schéma de la Base de Données (ERD)

Le schéma comprend 13 tables principales :

- **users** : id, email, password (hashé), firstName, lastName, phone, avatar, role (enum), status, emailVerified
- **drivers** : id, userId (FK), licenseNumber, phone, availability, rating, totalTrips
- **vehicles** : id, busNumber, plateNumber, capacity, model, year, color, status, currentLat, currentLng, driverId (FK)
- **events** : id, name, description, date, startTime, endTime, address, latitude, longitude, capacity, status, posterImage, createdBy (FK)
- **routes** : id, name, origin, originLat, originLng, destination, destinationLat, destinationLng, distance, estimatedDuration, isActive, eventId (FK)
- **route_stops** : id, name, latitude, longitude, order, routeId (FK)
- **pickup_points** : id, name, latitude, longitude, address, maxCapacity, eventId (FK)
- **reservations** : id, reservationCode, date, time, status, qrCode, notes, passengerCount, pickupLatitude, pickupLongitude, pickupAddress, pickupTime, contactPhone, optimizedPickupId (FK), participantId (FK), eventId (FK), pickupPointId (FK), tripId (FK)
- **trips** : id, name, date, departureTime, arrivalTime, status (enum), currentLat, currentLng, currentSpeed, tripProgress, estimatedArrival, notes, driverId (FK), vehicleId (FK), routeId (FK)
- **notifications** : id, type, title, message, read, userId (FK), reservationId (FK)
- **tracking_logs** : id, latitude, longitude, speed, heading, timestamp, tripId (FK)
- **shared_pickups** : id, name, latitude, longitude, address, createdAt, eventId (FK), tripId (FK)
- **waiting_list** : id, position, status (enum), createdAt, reservationId (FK), tripId (FK)

## 4.8 Conception des API REST

L'API REST est organisée par ressource avec des endpoints CRUD standard :

| Module | Méthodes | Endpoints |
|--------|----------|-----------|
| Auth | POST | /api/auth/register, /login, /refresh-token, /logout, /forgot-password, /reset-password, /change-password |
| Users | GET, PUT, DELETE | /api/users |
| Events | GET, POST, PUT, DELETE | /api/events |
| Drivers | GET, POST, PUT, DELETE | /api/drivers |
| Vehicles | GET, POST, PUT, DELETE | /api/vehicles |
| Routes | GET, POST, PUT, DELETE | /api/routes |
| PickupPoints | GET, POST, PUT, DELETE | /api/pickup-points |
| Reservations | GET, POST, PUT, DELETE | /api/reservations |
| Trips | GET, POST, PUT, DELETE | /api/trips |
| Notifications | GET, PUT | /api/notifications |
| Dashboard | GET | /api/dashboard/admin, /organizer, /driver, /participant |
| Reports | GET | /api/reports/* |
| Tracking | GET | /api/tracking/* |

Endpoints spécifiques au matching :
- POST /api/reservations/find-matches : Recherche de trajets compatibles
- POST /api/reservations/join-trip : Rejoindre un trajet existant
- GET /api/reservations/waiting-list/list : Liste d'attente
- GET /api/reservations/shared-pickups/list : Points de prise en charge partagés

## 4.9 Documentation Swagger

L'API est documentée avec Swagger/OpenAPI 3.0 via swagger-jsdoc et swagger-ui-express. La documentation est accessible à l'URL /api-docs. Elle couvre l'ensemble des endpoints avec leurs paramètres, corps de requête, réponses et codes d'erreur.

## 4.10 Stack Technologique

| Couche | Technologie | Version | Justification |
|--------|------------|:-------:|---------------|
| Frontend | React | 18 | Framework UI mature, large écosystème |
| Frontend | TypeScript | 5 | Typage statique, meilleure maintenabilité |
| Frontend | Vite | 5 | Build rapide, HMR instantané |
| Frontend | Tailwind CSS | 3 | CSS utility-first, productivité |
| Frontend | Shadcn UI | latest | Composants accessibles, personnalisables |
| Frontend | react-leaflet | 4 | Cartographie gratuite, pas de clé API |
| Frontend | Zustand | 4 | State management léger |
| Frontend | React Query | 5 | Gestion des données serveur |
| Frontend | Socket.IO Client | 4 | Communication temps réel |
| Backend | Node.js | 20 | Runtime JavaScript performant |
| Backend | Express.js | 4 | Framework web flexible |
| Backend | TypeScript | 5 | Typage statique |
| Backend | Prisma ORM | 5 | ORM type-safe, migrations |
| Backend | PostgreSQL | 16 | Base relationnelle robuste |
| Backend | Socket.IO | 4 | WebSocket temps réel |
| Backend | JWT | 9 | Authentification sans état |
| Backend | Zod | 3 | Validation de schémas |
| DevOps | Docker | latest | Containerisation standard |
| DevOps | Docker Compose | latest | Orchestration multi-conteneurs |
| DevOps | GitHub Actions | - | CI/CD intégré |

## 4.11 Architecture de Sécurité

L'architecture de sécurité est organisée en plusieurs couches :
1. **Transport** : HTTPS (TLS 1.3) pour tout le trafic.
2. **Authentification** : JWT (access token 15 min + refresh token 7 jours) avec rotation.
3. **Autorisation** : RBAC avec 4 rôles, middleware authorize() par endpoint.
4. **Protection des données** : bcrypt 12 rounds pour les mots de passe.
5. **Protection des endpoints** : Rate limiting (100 req/min), Helmet (sécurité HTTP), CORS, validation Zod.
6. **Audit** : Logging de toutes les actions POST/PUT/PATCH/DELETE.

## 4.12 Architecture Cloud et Déploiement

L'architecture de déploiement utilise Docker Compose avec trois services :
1. **Service Frontend** : Serveur Nginx servant les fichiers statiques buildés.
2. **Service Backend** : Application Node.js avec PM2 (clustering).
3. **Service Base de Données** : PostgreSQL 16 avec volume persistant.

Le déploiement cible une VM cloud (DigitalOcean, AWS EC2, ou Scaleway). La scalabilité horizontale est assurée par le load balancing entre plusieurs instances backend.
