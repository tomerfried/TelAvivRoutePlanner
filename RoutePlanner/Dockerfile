FROM maven:3.9.8-eclipse-temurin-17-alpine AS build
COPY src /home/app/src
COPY pom.xml /home/app
WORKDIR /home/app
RUN mvn package -DskipTests

FROM openjdk:17-jdk-alpine
COPY --from=build /home/app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]