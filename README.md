# Structure séparée

- `/public` = site normal
- `/admin` = interface admin
- `/data` = base SQLite créée automatiquement
- `server.js` = backend commun

Lancer :
`npm install`
`npm start`

Site : http://localhost:3000/
Admin : http://localhost:3000/admin/

Pour la production : variables d'environnement ADMIN_PASSWORD et SESSION_SECRET, HTTPS, sauvegardes et conformité RGPD.
