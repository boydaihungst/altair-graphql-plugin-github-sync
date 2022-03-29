# Altair Graphql Client github Gist Sync

[![Node.js Package](https://github.com/boydaihungst/altair-graphql-plugin-github-sync/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/boydaihungst/altair-graphql-plugin-github-sync/actions/workflows/npm-publish.yml)

[![NPM](https://nodei.co/npm/altair-graphql-plugin-github-sync.png?compact=true)](https://npmjs.org/package/altair-graphql-plugin-github-sync)

This is a plugin for [Altair Graphql Client](https://altair.sirmuel.design) that allows users sync collections with gist of GitHub.

## Installation

Install the `altair-graphql-plugin-github-sync` plugin from Avaiable Plugins > Altair Github Sync > "Add To Altair" > Then Restart

## Configure

1. Create a [personal access token](https://github.com/settings/tokens) to your GitHub account, with `gist` scope/permission.
   ![image](https://user-images.githubusercontent.com/38396158/145697965-3f6e6a04-e946-43eb-9353-b08c589caef7.png)

2. Go to Altair Graphql Client, click on Gist Sync tab:
   ![image](https://user-images.githubusercontent.com/38396158/145866878-c2228754-4c0d-4d75-89e0-faffd3ebd9d8.png)

3. Filling with Gist API Key (generated on step 1), select a existent Gist or select "Create new..." to create a new Gist.

## Usage

- Click on "Upload" to send your collections, app settings, environment to Gist.
- Click on "Donwload" to get your collections, app settings, environment from Gist.

## For developer only

1. Download and Open the Altair GraphQL Client
2. Open the settings modal
3. Toggle "ON" the "Enable experimental features in Altair. Note: The features might be unstable"
4. Add "url:altair-graphql-plugin-github-sync@1.0.5::[url]->[http://localhost:8002]" to the plugins list and hit "Save" at the bottom of the settings modal
5. Run `yarn preview` to build in watch mode and open http server
6. After refresh Gist Sync panel will show in the left

## Credit

- This is a port from [joaostroher/insomnia-plugin-gist-sync](https://github.com/joaostroher/insomnia-plugin-gist-sync).
