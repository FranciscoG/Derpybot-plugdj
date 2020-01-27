![DerpyBot Avatar](http://i.imgur.com/p999E1u.png)

# DerpyBot

[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/franciscog/DerpyBot/blob/master/LICENSE)

A Plug.dj Bot using [plugAPI](https://github.com/plugCubed/plugAPI)

[List of commands](#commands)

## Requirements

1. Node >= 4.0.0

## Installation

_Note_ - Windows 10 users may need to `npm install --global --production windows-build-tools` first

1. `npm install`
2. Create a new app in Firebase and export the service account credentials as json, rename it to `serviceAccountCredentials.json` and place it inside the private folder. It's in the Permissions settings somewhere. Firebase Console for your project -> Permissions -> Service Accounts -> Create Service Account, then follow the steps, give it "project -> editor" permissions, then download and rename the JSON it provides.
3. Create `settings.js`, see [README.md in /private](private/README.md) for more details, replacing each variable with your credentials and place that inside the `private` folder as well
4. `node index`

## Thanks

- [anjanms/DubAPI](https://github.com/anjanms/DubAPI) by [@anjanms](https://github.com/anjanms)
- [NitroGhost/dubbot-starter](https://github.com/NitroGhost/dubbot-starter) by [@NitroGhost](https://github.com/NitroGhost)
- And most important, [coryshaw1/SteveBot](https://github.com/coryshaw1/SteveBot) by [@coryshaw1](https://github.com/coryshaw1)

# Commands

# List of commands can be found [here](http://franciscog.com/DerpyBot/commands/)

<details>
  <summary>Want to contribute?</summary>

# Contributing

Fork this repo
Create Pull Requests

DerpyBot uses Firebase for its database so I need to grant you access. I've setup a development database in there that contributors will solely be using for now. Please DM me in Chillout Mixer's Discord channel with your email so that I can add you to the project. You'll need to download a json account credentials file.

I'll provide you with the firebase url

You'll also need your own of the following API keys:

- [SoundCloud](https://developers.soundcloud.com/)
- [YouTube Data Api](https://developers.google.com/youtube/v3/getting-started)

Both are just used to get data for the currently playing song

---

I'm slowly converting everything into async/await functions so here's something about the firebase calls in `repo.js`

With async/await you need to try/catch errors but I don't want to have a bunch of try/catches everywhere because that
will get unruly so this is what I'm doing:

in `repo.js` all of the functions should (eventually) by `async` and do not put any try/catch inside of them. You should allow them to throw errors and put your try/catches in the modules that is calling them.

TODO:

- I want to remove all of the `db` that is being passed around as arguments everywhere and have all db interactions go
  through `repo.js` (not sure why I didn't do that a long time ago)
- convert everything to TypeScript and follow [SOLID principles and Repository + Data Mapper pattern](https://dev.to/remojansen/implementing-the-onion-architecture-in-nodejs-with-typescript-and-inversifyjs-10ad)
- covnert to ES6 modules (export/import instead of require)
  </details>
