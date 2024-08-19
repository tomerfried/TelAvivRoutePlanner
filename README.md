# TelAvivRoutePlanner

A web application that simplifies planning arrival routes to Tel Aviv, including driving, parking, and walking

![צילום מסך 2024-08-18 212950](https://github.com/user-attachments/assets/eb02fb37-b983-497d-abec-09e5b7db3984)

## Architecture
- RoutePlanner (Java Spring Boot) - A REST service which creates Routes of driving to parking lot and walking to destination
- AchuzotHachofScraper (Node js) - A REST service which provides information about AchuzotHachof parking lots
- User Interface (React) - MapComponent which uses RoutePlannerLayer to load objects to the map

## Installation

- Run docker engine
- Run "docker compose up" in root folder
- The app will be available in http://localhost:3000/

By Tomer Fried
tomerfried96@gmail.com
