# Ma Tournée — version 1

Application web progressive (PWA) en français pour organiser une tournée jusqu'à 500 arrêts.

## Fonctions
- Ajouter plusieurs adresses, une par ligne.
- Importer un fichier TXT ou CSV (première colonne utilisée).
- Marquer les arrêts comme livrés et voir la progression.
- Ouvrir une adresse dans Waze ou Plans Apple.
- Trier la liste par ordre alphabétique.
- Exporter la tournée en CSV.
- Enregistrement local dans le navigateur et cache hors ligne après le premier chargement (l'ouverture des GPS nécessite Internet).

## Mise en ligne gratuite avec GitHub Pages
1. Sur un ordinateur, connectez-vous ou créez un compte sur https://github.com.
2. Créez un nouveau dépôt public, par exemple `ma-tournee`.
3. Téléversez tous les fichiers et le dossier `icons` de cette archive à la racine du dépôt (pas le dossier parent `ma-tournee`).
4. Dans le dépôt, ouvrez **Settings → Pages**.
5. Sous **Build and deployment**, sélectionnez **Deploy from a branch**, branche `main`, dossier `/(root)`, puis **Save**.
6. Attendez la publication, puis ouvrez l'adresse indiquée par GitHub Pages (elle ressemble à `https://VOTRE-NOM.github.io/ma-tournee/`).

## Ajouter à l'écran d'accueil sur iPhone
1. Ouvrez l'adresse publiée dans **Safari**.
2. Touchez **Partager** (carré avec flèche vers le haut).
3. Touchez **Sur l'écran d'accueil**. Si l'option est masquée, faites défiler les actions ou touchez **Modifier les actions**.
4. Activez **Ouvrir comme app web** si cette option apparaît, puis touchez **Ajouter**.

## À savoir
- Les données sont conservées localement dans Safari sur cet appareil. Elles ne se synchronisent pas entre appareils et peuvent être effacées si les données du site sont supprimées. Utilisez **Exporter** pour conserver une copie CSV.
- Il faut une connexion pour charger la première fois l'application et pour ouvrir les services GPS. Le cache hors ligne fonctionne après le chargement initial.
- Les boutons Waze ouvrent l'adresse sélectionnée, un arrêt à la fois. Cette version ne calcule pas l'ordre optimal des 500 arrêts et ne lance pas une tournée multi-arrêts dans Waze.
- Le CSV d'import est volontairement simple : une adresse par ligne, ou l'adresse en première colonne. Vérifiez les données importées avant de partir.
- Cette version est une application web, pas une application native distribuée via l'App Store.
