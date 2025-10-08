# EV Data Analytics Marketplace

## Overview
The EV Data Analytics Marketplace is a software platform designed to facilitate the exchange of data between data consumers and data providers. It provides functionalities for managing users, processing payments, and generating reports, making it a comprehensive solution for data analytics in the electric vehicle sector.

## Features
- **Data Consumers**: Users can search for data, purchase data sets, and access APIs to integrate data into their applications.
- **Data Providers**: Users can register their data, set pricing policies, and track revenue generated from data sales.
- **Admin Management**: Admins can manage users, process payments, and generate reports to monitor platform activity.

## Project Structure
```
EV-Data-Analytics-Marketplace
├── src
│   ├── main
│   │   ├── java
│   │   │   ├── com
│   │   │   │   └── evmarketplace
│   │   │   │       ├── Main.java
│   │   │   │       ├── consumers
│   │   │   │       │   ├── DataConsumer.java
│   │   │   │       ├── providers
│   │   │   │       │   ├── DataProvider.java
│   │   │   │       ├── admin
│   │   │   │       │   ├── AdminManager.java
│   │   │   │       └── utils
│   │   │   │           ├── Utils.java
│   │   └── resources
│   │       ├──application.properties
│   │       ├──static
│   │       └──templates
│   └── test
│       ├── java
│       │   └── com
│       │       └── evmarketplace
│       │           ├── consumers
│       │           │   └── DataConsumerTest.java
│       │           ├── providers
│       │           │   └── DataProviderTest.java
│       │           ├── admin
│       │           │   └── AdminManagerTest.java
│       │           └── utils
│       │               └── UtilsTest.java
│       └── resources
├── .gitignore
├── pom.xml
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd EV-Data-Analytics-Marketplace
   ```
3. Build the project using Maven:
   ```
   mvn clean install
   ```
4. Run the application:
   ```
   mvn exec:java -Dexec.mainClass="com.evmarketplace.Main"
   ```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.