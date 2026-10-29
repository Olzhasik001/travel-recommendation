# Wayfinder: Travel Recommendation Web Application

A static travel recommendation website built with HTML, CSS and JavaScript.

## Pages
- `index.html`: Home page with introduction, navigation bar and search
- `about.html`: About Us page
- `contact.html`: Contact Us page with an email form

## Features
- Navigation bar with Home, About Us, Contact Us, a search input, and Search and Clear buttons
- Search for **beach**, **temple** or **country** (and country or city names) to see recommendations with images
- Recommendation data is loaded from `travel_recommendation_api.json`

## Run locally
Use a local web server (the page loads JSON with `fetch`), for example:

    python3 -m http.server 8000

Then open http://localhost:8000
