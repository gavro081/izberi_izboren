# IzberiIzboren / ИзбериИзборен

This is a full-stack web application that recommends elective subjects for students at FINKI, built as a project for the Internet Technologies course. It is built with:

- **Backend:** Django
- **Frontend:** React with TypeScript and Vite
- **Database:** PostgreSQL
- **Containerized:** Using Docker and Docker Compose

The full documentation can be found [here](https://develop.finki.ukim.mk/projects/izberi_izboren).

## Quick Setup

### 1. Clone this repository:

`git clone https://github.com/gavro081/izberi_izboren.git`

### 2. Set up environment variables

Create two .env files with the following configurations:

In the backend/ directory (for Django):

```bash
DB_NAME=x
DB_USER=x
DB_PASS=x
DB_HOST=x
DB_PORT=5432
```

In the root directory (for Docker Compose and PostgreSQL):

```bash
POSTGRES_PASSWORD=x
DB_USER=x
DB_NAME=x
DB_HOST=x
```

> Adjust the values according to your environment

### 3. Build and run the project using Docker Compose:

`docker-compose up --build`

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
`docker-compose exec backend python3 manage.py fill_db`

> For windows users, use python or py instead of python3

## Notes

All data used in this project is public data from the faculty, collected by various scrapers.

## License

This project is licensed under the MIT license.
