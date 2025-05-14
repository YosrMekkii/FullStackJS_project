# 🔗 SkillExchange - piWEB Project

**SkillExchange** est une plateforme web interactive de partage, d’apprentissage et d’échange de compétences entre étudiants. Ce projet a été développé dans le cadre du module piWEB par une équipe d'étudiants de 4TWIN.

## 👨‍💻 Équipe de développement

- **Khalil Ayari**
- **Dhia Ghouma**
- **Khalil Mtaallah**
- **Yossr Makki**

---

## 🚀 Fonctionnalités principales

- **Authentification**
  - Login / Signup
  - Réinitialisation de mot de passe par email

- **Profils utilisateurs**
  - Création et visualisation de profil
  - Ajout de compétences et centres d’intérêt
  - Système de correspondance de compétences (Matching)

- **Marketplace des compétences**
  - Poster une compétence
  - Consulter les offres disponibles
  - Recommander des échanges

- **Apprentissage collaboratif**
  - Sessions d’apprentissage (Learning Sessions)
  - Interface Étudiant
  - Défis & Challenges

- **Interaction communautaire**
  - Q&A (poser des questions, voir les réponses)
  - Vue communautaire
  - Page de challenges

- **Administration**
  - Tableau de bord Admin
  - Vue d’ensemble des utilisateurs, signalements, statistiques
  - Gestion des défis
  - Gestion des compétences

---

## 🧭 Routes de l'application

| Route                        | Description                                      |
|-----------------------------|--------------------------------------------------|
| `/`                         | Page d'accueil                                  |
| `/login`                    | Page de connexion                               |
| `/signup`                   | Page d'inscription                              |
| `/forgot-password`          | Mot de passe oublié                             |
| `/reset-password/:token`    | Réinitialiser le mot de passe                   |
| `/profile1`                 | Vue du profil personnel                         |
| `/profile/:id`              | Vue du profil d'un autre utilisateur            |
| `/dashboard`                | Tableau de bord utilisateur                     |
| `/marketplace`              | Marketplace des compétences                     |
| `/postskill`                | Publication d'une compétence                    |
| `/skills/:id`               | Détails d'une compétence                        |
| `/edit-skill/:id`           | Édition d’une compétence                        |
| `/interests/:id`            | Détails d’un centre d’intérêt                   |
| `/user/:userId`             | Profil public d’un utilisateur                  |
| `/learningsession`          | Sessions d'apprentissage                        |
| `/studentInterface`         | Interface Étudiant                              |
| `/matches`                  | Matching de compétences                         |
| `/matchesPage`              | Vue des correspondances                         |
| `/community`                | Page de la communauté                           |
| `/qa`                       | Liste des questions                             |
| `/qa/:id`                   | Détails d’une question                          |
| `/ask-question`             | Poser une question                              |
| `/challenges`               | Liste des défis                                 |
| `/manage-challenges`        | Admin - gestion des défis                       |
| `/admindashboard`           | Tableau de bord administrateur                  |
| `/adminoverview`            | Vue d’ensemble pour l’admin                     |
| `/overview`                 | Vue d’ensemble des stats pour l'utilisateur     |
| `/app`                      | Composant App général                           |
| `/about`                    | À propos de l'application                       |
| `/verify-email/invalid`     | Email invalide                                  |
| `/verify-email/error`       | Erreur de vérification email                    |

---

## 📦 Stack technique

- **Frontend** : React.js + TailwindCSS
- **Backend** : Node.js + Express
- **WebSocket** : Socket.io pour les communications en temps réel
- **Base de données** : MongoDB
- **Authentification** : JWT + Email Verification + Password Reset
- **Sécurité** : pfSense pour le filtrage réseau (tests en labo)

---

## 🛠️ Fonctionnalités avancées

- 🔁 **Recommandation intelligente** (en cours) : Basée sur IA
- 📩 **Notifications en temps réel** : via WebSocket
- 👥 **Matchmaking** : système de suggestions automatiques
- 🎯 **Gamification** : motivation des utilisateurs via défis
- 🔒 **Règles de sécurité** testées via pfSense (Snort & OpenVPN)

---

## ⚙️ Démarrage du projet

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/<your-org>/piWEB-SkillExchange.git
cd piWEB-SkillExchange

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd ../backend
npm install
npm run dev


Accès
Frontend : http://localhost:5173

Backend API & WebSocket : http://localhost:3000

📸 Aperçu de l'application
(Ajoutez ici quelques captures d'écran illustrant les pages principales)

📄 Licence
Ce projet est développé à des fins académiques. Tous droits réservés à l’équipe 4TWIN.


