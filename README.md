# Altair Graphql Client Gist Sync

[![Node.js Package](https://github.com/boydaihungst/altair-graphql-plugin-gist-sync/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/boydaihungst/altair-graphql-plugin-gist-sync/actions/workflows/npm-publish.yml)

[![NPM](https://nodei.co/npm/altair-graphql-plugin-gist-sync.png?compact=true)](https://npmjs.org/package/altair-graphql-plugin-gist-sync)

This is a plugin for [Altair Graphql Client](https://altair.sirmuel.design) that allows users sync collections with gist of GitHub.

## Installation

Install the `altair-graphql-plugin-gist-sync` plugin from Avaiable Plugins > Altair Sync Gist > "Add To Altair" > Then Restart

## Configure

1. Create a [personal access token](https://github.com/settings/tokens) to your GitHub account, with `gist` scope/permission.
![image](https://user-images.githubusercontent.com/38396158/145697965-3f6e6a04-e946-43eb-9353-b08c589caef7.png)

2. Go to Altair Graphql Client, click on Gist Sync tab:
![image](https://user-images.githubusercontent.com/38396158/145697934-10a4e019-1bf4-4524-be2e-77a01beed5be.png)

3. Filling with Gist API Key (generated on step 1), select a existent Gist or select "Create new..." to create a new Gist.

## Usage

- Click on "Upload" to send your collections to Gist.
- Click on "Donwload" to get your collections from Gist.

## For developer only

1. Download and Open the Altair GraphQL Client
2. Open the settings modal
3. Toggle "ON" the "Enable experimental features in Altair. Note: The features might be unstable"
4. Add "url:altair-graphql-plugin-gist-sync@1.0.0::[url]->[http://localhost:8002]" to the plugins list and hit "Save" at the bottom of the settings modal
5. After refresh Gist Sync panel will show in the left

## Credit

- This is a port from [joaostroher/insomnia-plugin-gist-sync](https://github.com/joaostroher/insomnia-plugin-gist-sync).
