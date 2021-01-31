# A11y-Sitechecker-Dashboard

It is splitted into 2 Parts

## Binary Part
The binary part is for preparing the results for the Angular-Dashboard and can easily be integrated in automatic tests (like jenkins builds). There it uses the <a href="https://www.npmjs.com/package/a11y-sitechecker">A11y-Sitechecker</a> and wraps it in a way that the results can be handled aftwarrds
```json
"runtest": "a11y-sitechecker-dashboard https://www.test.at --config=configorf.json -T=1000"
```
For the command line there can be provided the following parts:
```properties
--config <string>: "Provide a config.json"
-T, --threshold <number> "permit this number of errors, warnings, or notices, otherwise fail with exit code 2"
```
In Common you can provide the config like <a href="https://www.npmjs.com/package/a11y-sitechecker">A11y-Sitechecker</a>. There are some additional options:

It is possible to provide a mongodb for saving the results. If there is no db connection provided, it will be saved as json Files (Important: Performance is not the best).
```json
 "db": {
    "type": "mongodb",
    "url": "urlofmongodb",
    "user": "user",
    "password": "password"
  }
```
If you like to tag your results with own Tags (for example if a team is responsible for this part), you can do it by providing for the axe-core IDs string arrays:

```json
  "idTags": {
    "aria-required-attr": [
      "Team1"
    ],
    "meta-viewport": [
      "Team2"
    ]
  }
```
## Angular Library
The Library is for presenting the results in a meaningful way. The library is based on angular material. You can use it by adding this tag to an application (serverMode means that the results are fetched from Serve, if false json files are searched)

```angular2html
<sitechecker-dashboard [serverMode]="false"></sitechecker-dashboard>
```
###Endpoints for providing server side results

```
get /sites => AnalyzedSite[]
get /siteResults/:id => SiteResult[]
post /violations/:id (data: timestamp) => FullCheckerSingleResult[]
post /incompletes/:id (data: timestamp) => FullCheckerSingleResult[]
post /inapplicables/:id (data: timestamp) => FullCheckerSingleResult[]
post /passes/:id (data: timestamp) => FullCheckerSingleResult[]
```
