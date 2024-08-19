# TelAvivRoutePlanner

A web application that simplifies planning arrival routes to Tel Aviv, including driving, parking, and walking

![צילום מסך 2024-08-18 212950](https://github.com/user-attachments/assets/eb02fb37-b983-497d-abec-09e5b7db3984)

## Architecture
- RoutePlanner (Java Spring Boot) - A REST service which creates Routes of driving to parking lot and walking to destination
- AchuzotHachofScraper (Node js) - A REST service which provides information about AchuzotHachof parking lots
- User Interface (React) - MapComponent which uses RoutePlannerLayer to load objects to the map

## Installation

- Set your Google Maps API key in the following files:
  - RoutePlanner/src/main/resources/application.properties
    WebApp/src/components/MapComponent/MapComponent.js
- run "./mvnw package" in "RoutePlanner" folder in order to create the jar file for this service
- Run docker engine
- Run "docker compose up" in root folder
- The app will be available in http://localhost:3000/

By Tomer Fried
tomerfried96@gmail.com
