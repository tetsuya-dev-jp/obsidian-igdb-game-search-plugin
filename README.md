# IGDB Game Search

[![Korean](https://img.shields.io/badge/Language-%ED%95%9C%EA%B5%AD%EC%96%B4-blueviolet)](README.ko.md)

Easily create game notes from IGDB.

<br>

## Demo

https://github.com/user-attachments/assets/e19ee2d0-1c84-4092-87d9-ee2f84b636d1

<br>

## Description

Use this plugin to search games by:

- Game title

Use IGDB API to get the game metadata.

<br>

## How to install

Currently, install it manually:

1. Create `VaultFolder/.obsidian/plugins/obsidian-igdb-game-search-plugin/`.
2. Copy `manifest.json`, `main.js`, and `styles.css` into the folder.
3. Reload Obsidian.
4. Enable `IGDB Game Search` in Community plugins.

<br>

## How to use

### 1. Click the ribbon icon, or execute the command `Create new game note`.

<img width="753" height="194" src="https://github.com/user-attachments/assets/17cf8a9b-b618-4769-bde8-26fe5ac6f54e">

### 2. Search for a game by title.

<img width="613" height="232" src="https://github.com/user-attachments/assets/2389fa36-3761-4441-a6ef-b61030196441" />

### 3. Select the game from the search results.

<img width="754" height="1036" src="https://github.com/user-attachments/assets/96ecd455-6e51-4ece-a700-aeb40b215b92" />

### 4. A note is created from the selected metadata.

<img width="685" height="578" src="https://github.com/user-attachments/assets/3925b5b3-dd7a-4f36-b241-a8641b1a2752" />

<br>

## How to get Twitch Client ID and Client Secret

1. Open the Twitch Developer Console: https://dev.twitch.tv/console
2. Sign in with your Twitch account.
3. Create or register an application.
4. Copy the generated `Client ID`.
5. Generate a new `Client Secret`.
6. Paste both values into the plugin settings in Obsidian.

If Twitch asks for a redirect URL while creating the app, enter any valid URL you control, such as `http://localhost`, if you only use this plugin locally.

For IGDB API details, see the official docs: https://api-docs.igdb.com

<br>

## How to use settings

<img width="806" height="580" src="https://github.com/user-attachments/assets/58c30330-45fa-4398-b643-2caecdd57337" />

### Twitch Client ID / Client Secret

Enter your Twitch `Client ID` and `Client Secret` in the plugin settings.

The plugin uses these credentials to get an IGDB access token automatically.

### New file location

Set the folder where the new game note is created.

If empty, the note is created in the vault root.

### New file name

Set the file name format.

The default format is `{{title}}`.

You can also use `{{DATE}}` or `{{DATE:YYYYMMDD}}`.

### Template file

Set the template file path used when creating a note.

If no template file is set, the plugin creates a note from the built-in metadata rendering.

### Show cover images in search

Show IGDB cover images in the search results.

### Open new game note

Open the created note automatically after selection.

### Cover image saving

Download and save the selected game cover inside your vault.

Use `{{localCoverImage}}` in your template if you want to embed the saved image.

### Cover image folder

Set the folder where downloaded cover images are stored.

<br>

## Example template

Please also find a definition of the variables used in this template below.

```md
---
type: game
title: "{{title}}"
aliases: "{{alternativeTitle}}"
platforms: "{{platform}}"
genres: "{{genre}}"
developers: "{{developer}}"
publishers: "{{publisher}}"
franchise: "{{franchise}}"
collection: "{{collection}}"
released: "{{firstReleaseDate}}"
year: "{{releaseYear}}"
rating: "{{totalRating}}"
igdb: "{{igdbUrl}}"
cover: "{{coverLargeUrl}}"
localCover: "{{localCoverImage}}"
created: "{{DATE:YYYY-MM-DD HH:mm:ss}}"
updated: "{{DATE:YYYY-MM-DD HH:mm:ss}}"
---

<%* if (tp.frontmatter.cover && tp.frontmatter.cover.trim() !== "") { tR += `![cover|200](${tp.frontmatter.cover})` } %>

# {{title}}

## Summary

{{summary}}

## Storyline

{{storyline}}

## Screenshots

<%= game.screenshots?.map((url) => `![screenshot](${url})`).join('\n') ?? '' %>
```

<br>

## Template variables definitions

Write `{{name}}` in your template and replace `name` with the desired field.

| Field | Description |
| --- | --- |
| `title` | Game title |
| `alternativeTitle` | Comma-separated alternative titles |
| `alternativeTitles` | Alternative titles array |
| `slug` | IGDB slug |
| `summary` | Game summary |
| `storyline` | Game storyline |
| `igdbUrl` | IGDB page URL |
| `website` | Comma-separated website URLs |
| `websites` | Website URL array |
| `platform` | Comma-separated platform names |
| `platforms` | Platform array |
| `genre` | Comma-separated genre names |
| `genres` | Genre array |
| `theme` | Comma-separated theme names |
| `themes` | Theme array |
| `gameMode` | Comma-separated game mode names |
| `gameModes` | Game mode array |
| `playerPerspective` | Comma-separated player perspective names |
| `playerPerspectives` | Player perspective array |
| `developer` | Comma-separated developer names |
| `developers` | Developer array |
| `publisher` | Comma-separated publisher names |
| `publishers` | Publisher array |
| `franchise` | First franchise name |
| `collection` | First collection name |
| `firstReleaseDate` | Release date in `YYYY-MM-DD` |
| `releaseYear` | Release year |
| `rating` | IGDB rating |
| `ratingCount` | Rating count |
| `aggregatedRating` | Aggregated rating |
| `aggregatedRatingCount` | Aggregated rating count |
| `totalRating` | Total rating |
| `totalRatingCount` | Total rating count |
| `coverUrl` | Cover image URL |
| `coverSmallUrl` | Small cover image URL |
| `coverLargeUrl` | Large cover image URL |
| `screenshot` | Comma-separated screenshot URLs |
| `screenshots` | Screenshot URL array |
| `localCoverImage` | Local path of the downloaded cover image |

<br>

## Advanced

### Inline Script

- The object `game` gives access to all attributes managed by the plugin.
- Use `<%= game %>` or `<%= JSON.stringify(game, null, 2) %>` to inspect the object in a template.

Example:

````md
```json
<%= JSON.stringify(game, null, 2) %>
```
````
