# **Software Requirements Specification (SRS)**

**Purpose:** PlantCare is a software system designed to help users manage their plants and maintain proper plant-care routines. The system provides facilities for storing plant information, viewing plant details, updating plant records, and removing plants. It also provides plant-care information such as watering, sunlight, fertilizer, and common disease information.

The project will be developed using an agile development approach and managed through Jira Software.

## **1\. Introduction**

* **Project Name:** **PLANTCARE**

* **Prepared by:** Team Unique

* **Date:** 07 October 2026

## **2\. Overall Description**

### **2.1 Product Perspective**

PlantCare is a software system designed to help users manage their plants and maintain proper plant-care routines. The Plant Management module allows authenticated users to add, view, update, delete, search, and categorize plant information.

### **2.2 Product Functions**

* Add a new plant  
* View plant list  
* View plant details  
* Edit plant information  
* Delete plant information  
* Search plants  
* Categorize plants  
* Store plant information in a database  
* Restrict plant modification to authorized users  
* Validate plant information before saving

### **2.3 Constraints**

* Only authorized users can modify or delete their own plant information.  
* The database must be available for storing and retrieving plant data.  
* Plant information depends on the accuracy of the stored data.  
* The system should be simple and easy to use.  
* Development progress and tasks will be managed using Jira Software.

## **3\. Functional Requirements**

| SL | Description | Priority |
| ----- | ----- | ----- |
| 01 | The system shall allow users to add a new plant. | High |
| 02 | The system shall allow users to view their plant list. | High |
| 03 | The system shall allow users to view detailed plant information. | High |
| 04 | The system shall allow users to edit plant information. | High |
| 05 | The system shall allow users to delete a plant. | High |
| 06 | The system shall allow users to search for plants. | Medium |
| 07 | The system shall allow plants to be categorized by type. | Medium |
| 08 | The system shall store plant information in a database. | High |
| 09 | The system shall validate plant information before saving. | High |
| 10 | The system shall restrict plant modification to authorized users. | High |

## **4\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Plant list, search, and normal database operations should respond efficiently. |
| Security | User and plant information must be protected from unauthorized access. |
| Usability | The interface should be simple and easy to understand. |
| Reliability | The module should operate consistently without frequent failures. |
| Maintainability | The code should be organized and easy to maintain. |
| Compatibility | The application should work with commonly used browsers/devices. |
| Data Integrity | Plant records should be stored accurately and consistently. |
| Privacy | A user's plant information should not be exposed to unauthorized users. |

## **5\. External Interface Requirements**

## **5.1 User Interface**

* My Plants page  
* Add Plant page  
* Plant Details page  
* Edit Plant page  
* Search and Filter interface

## **5.2 Database Interface**

The module will use a database to store and manage plant records.

## **6\. Assumptions and Dependencies**

* Users must be authenticated before managing personal plants.  
* The database server must be available.  
* The selected programming language/framework must support database operations.  
* Plant-care information should come from reliable sources.  
* The team will use Jira Software to track the development work.

# **7\. Appendices**

### **Appendix A Suggested Technology Stack**

* **Mobile Application:** Flutter / React Native  
* **Backend:** Laravel / PHP  
* **API:** REST API  
* **Database:** MySQL  
* **Authentication:** Laravel Sanctum / Token-based Authentication  
* **Notifications:** Firebase Cloud Messaging (FCM) and Local Notifications  
* **Image Storage:** Server Storage / Cloud Object Storage  
* **Admin Panel:** Laravel-based Web Admin Panel  
* **Version Control:** Git / GitHub  
* **Optional AI:** Plant Identification / Vision API  
* **Optional Weather:** Weather API

### **Appendix B \- Main User Roles**

**1\. Plant Owner/User**  
 Can create and manage plants, schedules, care records, growth photos, reminders, and shared-care settings.

**2\. Shared Caretaker**  
 Can access plants shared with them and perform assigned care activities according to their permissions.

**3\. Administrator**  
 Can manage users, plant types, care rules, care tips, and other system-level information.

### **Appendix C \- Core Data Entities**

The major entities of the system may include:

* Users  
* Plants  
* Plant Types  
* Care Rules  
* Care Schedules  
* Care Logs  
* Plant Photos  
* Plant Members  
* Notifications  
* Vacation Plans  
* Plant Notes  
* Admin Users/Roles

## **8\. Marketplace (Shop) Module**

The mobile app includes a **Shop** marketplace where users can browse listings, sell plants, and place **simulated** orders (no real payment gateway in this release). Official inventory is sold under **PlantCare Store** by an administrator.

| SL | Description | Priority |
| ----- | ----- | ----- |
| M-01 | The system shall allow users to browse active marketplace listings with search and filters. | High |
| M-02 | The system shall allow authenticated users to create, edit, and remove their own listings. | High |
| M-03 | The system shall allow users to view listing details including price, condition, and seller. | High |
| M-04 | The system shall allow users to place a simulated purchase order for available listings. | High |
| M-05 | The system shall prevent users from purchasing their own listings. | High |
| M-06 | The system shall record order history for the buyer. | Medium |
| M-07 | The system shall allow an administrator to publish official **PlantCare Store** listings (demo: `admin@plantcare.app`). | Medium |
| M-08 | The system shall persist marketplace data locally on the device (mock phase). | High |

**Out of scope (marketplace):** real online payments, shipping integration, Laravel API sync, and web admin panel for inventory (planned for a later phase).

