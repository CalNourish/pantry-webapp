# Cal Nourish Web App

<a aria-label="Powered by Vercel" href="https://vercel.com?utm_source=cal-nourish&utm_campaign=oss" title="Powered by Vercel">
  <img src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg" height="42" />
</a>

The Cal Nourish Web App is an application that is being built as a tool for the UC Berkeley Food Pantry to manage inventory and orders, and perform other administrative tasks to more effectively meet the needs of pantry guests and volunteers. While the primary audience of this app is the UC Berkeley Food Pantry, this project can be repruposed for any use case.

For more information about the UC Berkeley Food Pantry, you can visit their [website](https://basicneeds.berkeley.edu/pantry)

This app is powered by [Vercel](https://vercel.com?utm_source=cal-nourish&utm_campaign=oss) and built with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Firebase](https://firebase.google.com/) (for our database and authentication), and various AWS and Google tools as needed.

## Setup
This application is based on the [Next.js Firebase example](https://github.com/vercel/next.js/tree/canary/examples/with-firebase). View the [Firebase readme](./Firebase_example.md) for more details.

## Quick Start
Clone this repo.

### Set up your environment variables
1. Create a `.env.local` file and copy the contents of `.env.local.example` into it:

```bash
cp .env.local.example .env.local
```

2. Set each variable except the final two in `.env.local` with your Firebase Configuration (found in "Project settings"). For the final two, either ask someone for their values (preferable) or go to "Project Settings" and then "Service accounts" in Firebase Console and hit "Generate new private key" to get a private key.

### Run these comments

```npm -g install firebase-tools```

```npm install```

```firebase login```

To start the app: ```npm run dev```

It will run on localhost at port 3000. You can try signing in with your email to get authenticated.


## Styling
We are using [Tailwind CSS](https://tailwindcss.com/) which is a utility-first css framework with goal of writing little to no custom css. For the best development experience with tailwind css:
1. Install the [Tailwind CSS IntelliSense VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) (id: bradlc.vscode-tailwindcss)
2. Disable CSS Validation in your VS Code Workspace (this is set through the workspace setting directory in the root of the project). This needs to be turned off since Tailwind uses some syntax that is not considered valid css. Since we are using very little css, we should not need to validate our css.
3. Using Tailwind, though, is up for debate. Because we are using Next.js, some of the main benefits of Tailwind may not be as useful, such as limiting the global css conflicts.

## Intended architecture
Firebase
* storage/database
* authentication

Vercel
* Hosting
* Functions

# How this repo is set up
The `pages` directory is the core of our app. `pages/*.js` all define pages that are rendered to the user. `pages/api/*` are our backend API endpoints. The path of the endpoint follows the directory path, so a file `/api/inventory/AddItem.js` defines an endpoint accessible at `/api/inventory/AddItem`. You can read more about Next.js API routes [here](https://nextjs.org/docs/api-routes/introduction).

The `utils` directory contains utility functions that we may need to use across multiple endpoints, such as the Firebase connection initialization logic.

The `public` directory contains publicly accessible assets we use on the webapp and the `styles` directory contains some basic styling with Tailwind (see above). 

The `context` directory contains a script that monitors and updates a `userContext` that handles authenticating a user with our webapp. Essentially, this script is responsible for managing a special token we give users that are allowed to access the pantry facing side of our app.

The `components` directory contains all our common components.


## Test and Prod Environments

You should be granted access to the **TestCalNourish** and **ProdCalNourish** projects.

View list of current aliases for this local project: ```firebase use```.

To add an alias, run ```firebase use --add``` to add aliases for the test and prod projects.

To switch between projects, run ```firebase use <alias>```. 

These aliases will automatically connect with the appropriate firebase projects (i.e. database, auth, etc.). In development, you should only use **TestCalNourish** with the alias of `default` or `test`.

## Sponsorship notes
In order to be considered for a sponsorship (and to continue to be sponsored if approved) from Vercel, we must adhere to the guidelines outlined on their [sponsorship page](https://vercel.com/support/articles/can-vercel-sponsor-my-open-source-project?utm_source=cal-nourish&utm_campaign=oss)

These are the terms relevant to development, so please keep them in mind:
- The project should be open source.
- The project should be static rather than server-rendered.
- A Vercel banner in the footer of each site page (assuming all pages use the layout component, or at least just the footer component, this will automatically be handled. To maintain this, the footer component should always contain the Vercel banner)
- A Vercel banner in the source repository's README.md file
- All links back to Vercel should use a UTM tag with the format: `?utm_source=cal-nourish&utm_campaign=oss`

# Here on down is not necessary for initial setup

## Configuring Notifications with AWS Cognito and Lambda

Our sendNotification logic resides in AWS Lambda, and we use AWS Cognito to authenticate. The following guide will walk you step-by-step in recreating the installation instructions. For security, the credentials reside in the database. This guide was adapted from [Setting up Amazon Cognito and the Amazon SDK for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html).

1. Sign in to the AWS Management Console and open the Amazon Cognito console [here](https://console.aws.amazon.com/cognito/).
2. We selected "us-west-1 (Oregon)" as our region.
3. Choose "Manage Identity Pools" on the console opening page.
4. On the next page, choose "Create new identity pool". If you have no existing identity pools, skip this step. It will automatically go to the pool creation page.
5. In the Getting started wizard, type a name for your identity pool in Identity pool name. We picked ```CalNourish```.
6. Choose "Enable access to unauthenticated identities".
7. Choose "Create Pool".
8. On the next page, choose "View Details" to see the names of the two IAM roles created for your identity pool. Make a note of the name of both roles.
9. Choose "Allow".
10. For the platform, select "Javascript".
11. Under "Get AWS Credentials", remember this piece of code. You'll be adding it to the webapp.
12. To reiterate, remember the names of the two IAM roles you created for your identity pool as well as the code snippet above.
13. Go back to the IAM console [here](https://console.aws.amazon.com/iam/).
14. In the navigation panel on the left of the page, choose Roles.
15. In the list of IAM roles, click on the link for the unauthenticated identities role previously created by Amazon Cognito.
16. In the "Summary" page for this role, choose "Attach policies".
17. In the "Attach Permissions" page for this role, search for "Lambda" and then select the check box for AWSLambdaRole.
18. Choose "Attach policy".
19. Repeat for the authenticated identities role.

## Setting up Amazon SDK in Browser

1. Visit [this page](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/) to get the code snippet needed to use the Amazon SDK in your browser. Add this snippet to your html file. In our case, this code resides in our [ucbfpa-webapp](https://github.com/CalNourish/ucbfpa-webapp) repository.
2. Add the code snippet that authenticates the user to the webapp. Again, this code resides [here](https://github.com/CalNourish/ucbfpa-webapp).
3. The next steps were taken from this guide: [Setting up Amazon Lambda for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/browser-invoke-lambda-function-example.html)
4. Scroll to the "Creating the Lambda Service Object" section and copy this code snippet so that it resides after you authenticate with Amazon Cognito.
5. Update the region to the region your Lambda function resides in (this may or may not be the same as the region where your Amazon Cognito resides. For us, the Lambda function resides in us-west-1.).
6. Update the API version to a more recent date.
7. Inside the params variable, change the function name to our function name.
8. Scroll to the "Invoking the Lambda Function" section and copy this code snippet to execute the lambda function.
9. Execute your Lambda function!
