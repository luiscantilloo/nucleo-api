# nucleo-api · multi-programa

```
parienta-web  (:3003) ──► :4000  PROGRAM_ID=parienta  DB=nucleo_parienta
nara-web      (:3000) ──► :4100  PROGRAM_ID=nara       DB=nara
consiente-web (:3004) ──► :4200  PROGRAM_ID=quintia    DB=nucleo_consiente
                              └── programs/{parienta,nara,quintia}/ + apps/*
```

Arranque: `npm run start:dev:parienta` · `start:dev:nara` · `start:dev:quintia` · o `start:dev:ambos` (los tres).

Deploy: `DEPLOY-MANUAL.md` · QUINTIA front: `consiente-web/deploy/DEPLOY-QUINTIA.md`
