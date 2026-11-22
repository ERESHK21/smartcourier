# --- build stage -------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw && ./mvnw -B -q -DskipTests dependency:go-offline

COPY src ./src
RUN ./mvnw -B -q -DskipTests package

# --- run stage ---------------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
