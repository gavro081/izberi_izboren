# IzberiIzboren / ИзбериИзборен

This is a full-stack web application that recommends elective subjects for students at FINKI, built as a project for the Internet Technologies course. It is built with:

- **Backend:** Django
- **Frontend:** React with TypeScript and Vite
- **Database:** PostgreSQL
- **Containerized:** Using Docker and Docker Compose

The full documentation can be found [here](https://develop.finki.ukim.mk/projects/izberi_izboren).

## Quick Setup

### 1. Clone this repository:

```bash
git clone https://github.com/gavro081/izberi_izboren.git
```

### 2. Set up environment variables

Copy the `.env.example` files to `.env` and adjust values accordingly.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**NOTE**: This project uses OAuth2 to enable Google login. By default, it’s disabled for convenience.  
If you’d like to use Google login, follow [this guide](https://support.google.com/googleapi/answer/6158849?hl=en) to create your credentials. Then make the following changes:

**In `backend/.env`:**

```env
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
USE_OAUTH=True
```

**In the root `.env`:**

```env
GOOGLE_CLIENT_ID=<google_client_id> # exclude the '.apps.googleusercontent.com' part
VITE_USE_OAUTH=true
```

If you run into any issues, feel free to [open an issue](https://github.com/gavro081/izberi_izboren/issues).

### 3. Build and run the project using Docker Compose:

```bash
docker-compose up --build
```

> Make sure you have Docker and Docker Compose installed on your system.

The frontend of the application will be available at **http://localhost:3000**, which you can access from your browser.

### 4. Apply database migrations

Run the following commands inside the Docker container to create the database tables:

```bash
docker-compose exec backend python3 manage.py makemigrations
docker-compose exec backend python3 manage.py migrate
```

### 5. Populate the database

Run the fill_db script to load data into the database:

```bash
docker-compose exec backend python3 manage.py fill_db
```

## Notes

All data used in this project is public data from the faculty, collected by various scrapers.

## License

This project is licensed under the MIT license.
