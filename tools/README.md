## guide

- data

  - **courses.json** - lista so iminja na site predmeti
  - **elective.json** - dict so izborni predmeti za sekoj smer
  - **information.json** - dict so kod, ime, level, link za site predmeti
  - **mandatory.json** - dict so zadolzitelni predmeti za sekoj smer, po semestar
  - **participants.json** - dict so broj na zapisani studenti za sekoj semestar za sekoj predmet
  - **prerequisites.json** - dict so kod, ime, preduslov i semestar za sekoj predmet
  - **professors.json** - dict so profesori i asistenti za sekoj predmet
  - **roles.json** - dict so key - semestar, value - site predmeti od toj semestar, zadolzitelni i izborni
  - **staff.json** - dict so info za site profesori
  - **subjects_by_program.json** - dict so site smerovi kade sto e zadolzitelen eden predmet
  - **subject_details.json** - dict so site(?) relevantni informacii za eden predmet

- scrapers

  - **mandatory.py** - scrape-a i zapisuva rezultati vo data/mandatory.json
  - **elective.py** - scrape-a i zapisuva rezultati vo data/elective.json

- scripts

  - **subjects_by_program.py** - cita od mandatory.json i zapisuva vo subjects_by_program.json
  - **subject_details.py** - cita od poveke json files i gi spojuva vo eden pogolem dict - subject_details.json

**playground.js** - as the name suggests, playground za igranje so datata (run with `node playground.js` )
