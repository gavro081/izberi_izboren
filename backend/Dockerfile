FROM python:3.12

WORKDIR /app

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y postgresql-client


COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8000

RUN chmod +x wait-for-db.sh

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]