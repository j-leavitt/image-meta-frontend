# image-meta-frontend

A [Contentful app](https://www.contentful.com/developers/docs/extensibility/app-framework/) for retrieving and filling entry fields with image metadata. It retrieves image metadata using the [associated image metadata API](https://github.com/j-leavitt/image-meta-api). The API service must be running at the API URL set in this app's environment in order for the app to function properly.

Upon installation, this instantiation of the app creates a single Contentful content type as an image asset wrapper to associate its image metadata fields with the image. The metadata is retrieved from the API via user interaction with the entry sidebar for a given entry of the content type.

This project uses a combination of the [Contentful ai-image-tagging](https://github.com/contentful/apps/tree/master/apps/ai-image-tagging) frontend and the [Create Contentful App CLI](https://github.com/contentful/create-contentful-app) as a base.

## Installation

### For Local Deployment

1. Run `yarn install`
2. Provide the [API](https://github.com/j-leavitt/image-meta-api) URL in the environment variable `REACT_APP_API_URL` or define the vairable in a `.env` file
3. Run the development server using the command `yarn start` (development server port will default to 3000)
4. In Contentful, create an App Definition for the app (see below)
5. In Contentful, install the app in your Space (see below)

### For Remote Deployment

1. On the deployment platform, set the environment variable `REACT_APP_API_URL` to the [API](https://github.com/j-leavitt/image-meta-api) URL
2. Build the app using `yarn build`
3. Serve built assets from the `build` directory
4. In Contentful, create an App Definition for the app (see below)
5. In Contentful, install the app in your Space (see below)

## Creating the Contentful App Definition

The instructions in this section and the next follow those provided in the ["Build your first app" guide](https://www.contentful.com/developers/docs/extensibility/app-framework/tutorial/#create-the-appdefinition-for-your-app) on the Contentful site, but with specifics and amplifications for this app.

1. Navigate to the [app management view](https://app.contentful.com/deeplink?link=app-definition-list)
2. Click the "Create App" button
3. Enter any name you choose
4. Enter the URL where you are hosting this app (e.g. http://localhost:3000 if deploying locally)
5. For Locations, select "App configuration screen" and "Entry sidebar"

## Installing the App in your Contentful Space

1. Navigate to the [Apps view](https://app.contentful.com/deeplink?link=apps) in the Space where you want to install the app
2. Find the app in the list of Available apps using the name you provided in the App Definition
3. Install the app by following the prompts, which will create a new content type in your space that will be used to store metadata alongside associated image assets