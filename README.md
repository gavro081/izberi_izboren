# IzberiIzboren / ИзбериИзборен

This is a full-stack web application that recommends elective subjects for students at FINKI, built as a project for the Internet Technologies course. It is built with:

- **Backend:** Django
- **Frontend:** React with TypeScript and Vite
- **Database:** PostgreSQL
- **Containerized:** Using Docker and Docker Compose

## Quick Setup

### 1. Clone this repository: `git clone https://github.com/gavro081/izberi_izboren.git`

### 2. Set up environment variables

You need two .env files for the project to run:

In the backend/ directory:

```bash
DB_NAME=x
DB_USER=x
DB_PASS=x
DB_HOST=x
DB_PORT=5432
```

In the root directory:

```bash
POSTGRES_PASSWORD=x
DB_USER=x
DB_NAME=x
DB_HOST=x
```

> adjust the values according to your environment

### 3. Build and run the project using Docker Compose: `docker-compose up --build`

> Make sure you have Docker and Docker Compose installed on your system.

### 4. Populate the database

Once everything is set up, you can populate the database with existing data, by running

`python3 -m tools.scripts.fill_db`

> For windows users, use python or py instead of python3

## Notes

All of the data used in this project is public data from the faculty, collected by various scrapers.

## License

This project is licensed under the MIT license.
