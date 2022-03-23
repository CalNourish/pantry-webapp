## What is the user flow?
Users don't have to log in to the webapp in order to view the public inventory. 

For users that do log in, we use Google as our identity provider, so users will need to have a Google account. Anybody can log in with a Google account but only a certain set of emails are allowed to view internal pages, these emails are listed in the Firebase database.

## What is the technical flow?

![](auth_flow.png?raw=true)

## Where are settings for the Google authentication stored?
The Google auth side is stored under the ProdCalnourish project in Google Cloud, project ID 120040037797. Everyone on the team should have Owner permissions for the project.
