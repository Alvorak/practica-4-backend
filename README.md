# Plantilla de backend

Este proyecto es una plantilla para la asignatura de Backend. Sirve como punto de partida para crear APIs con Node.js, TypeScript, Apollo Server, GraphQL y MongoDB, y practicar operaciones encadenadas entre objetos.

## Ejemplo: películas y reparto

El ejemplo relaciona dos objetos:

- **Pelicula**: contiene datos como título, director, año y una lista de IDs de actores.
- **Cast**: representa a un actor y contiene su nombre, sexo y roles.

Al consultar una película, el resolver de `Pelicula.cast` usa esos IDs para recuperar los actores. Las mutaciones para crear o cambiar una película comprueban que los actores indicados existan.

## Crear un proyecto nuevo desde esta plantilla

1. En GitHub, abre [este repositorio](https://github.com/Alvorak/plantilla-backend-node) y pulsa **Use this template → Create a new repository**.
2. Elige el propietario, el nombre y la visibilidad del nuevo repositorio.
3. Clona el repositorio que acabas de crear y entra en su carpeta:

   ```bash
   git clone https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
   cd NOMBRE_DEL_REPO
   ```

4. Instala las dependencias y prepara la configuración local:

   ```bash
   npm ci
   cp .env.example .env
   ```

5. Edita `.env` con la URI de tu instancia de MongoDB. Puedes cambiar también `MONGODB_DB` si quieres usar otra base de datos. **No subas `.env` a Git**; está incluido en `.gitignore`.
6. Arranca el servidor:

   ```bash
   npm run dev
   ```

   La API GraphQL estará disponible en `http://localhost:3000`.

El nuevo repositorio ya será el remoto `origin`. Cuando hagas cambios, puedes guardarlos y subirlos con:

```bash
git add .
git commit -m "Describe tus cambios"
git push
```
