![BUBT Logo PNG Vector (AI) Free Download][image1] 

**PROJECT PROPOSAL**

On  
**PlantCare**: A Smart Plant Care  
**Submission Date:** 8th, October, 2026

**Submitted By:**

| ID | Name | Intake/Section |
| :---: | :---: | :---: |
| 20244203141 | Zehad Ali | 47/3 |
| 20244203139 | Md. Abu Talha Sarker | 47/3 |
| 20244203110 | Krishno Das Ghosh | 47/3 |
| 20244203096 | Md.Sihab ali | 47/3 |
| 20244203143 | Labonno Mondal | 47/3 |

**Submitted To**

**Sumona Yeasmin**  
*Lecturer, Dept. of CSE*  
*BUBT*

1. **Needs/Problems**

Plant owners, especially beginners, do not have one organized place to manage their plants and to get help when something goes wrong. The main problems and needs behind GrowMate are:

* **Forgotten care.** Watering and fertilizer schedules are missed because users rely on memory.  
* **Different needs per plant.** Each plant type needs different water, light and fertilizer, and beginners do not know them.  
* **No care history.** Users cannot recall when a plant was last watered, fertilized, pruned or repotted.  
* **Scattered knowledge.** Plant-care advice is spread across social media, websites, videos and personal notes, with no searchable, trusted place for answers.  
* **No clear next step.** Yellow leaves, pests and diseases appear and users do not know what to do or whom to ask.  
* **No growth record.** Long-term growth of a plant is not tracked.  
* **Shared care is hard.** When users travel, handing plant care to a family member or friend is not organized.

**Need:** a secure, easy-to-use mobile application with plant records, care reminders, growth tracking and a community Q\&A feed, backed by an admin panel for moderation and plant-care content.

2. **Goals/Objectives**

GrowMate is an Android mobile application, built with a Laravel REST API, that helps people take care of their plants and learn from each other. Its core module, PlantCare, lets an authenticated user add, view, edit, delete, search and categorize plants. Around this core, GrowMate adds watering and fertilizer reminders, care history, growth photo tracking, and a Knowledge Share feed where users post plant problems, other users answer, and the original poster accepts the best answer. An admin panel manages users, plant types, care tips and reported content.

**Objectives**

* Deliver a secure plant management module (add, view, edit, delete, search, categorize) as the first working release.  
* Remind users of watering and fertilizing and keep a complete care history for every plant.  
* Let users track plant growth over time with dated photos and notes.  
* Provide plant-type care information from reliable sources.  
* Build a community feed where users ask questions, answer them and accept a solution.  
* Provide an admin panel to manage users, plant data and reported posts.  
* Apply professional practice: Agile delivery, Jira tracking, REST API design, and role-based access control.

3. **Existing System Analysis**

Three popular plant-care applications were reviewed using their store listings and published user-feedback reports (accessed 8 October 2026). Some quoted reviews are from earlier years and may no longer apply.  
**3.1 Planta: Plant & Garden Care \[1\]**  
Planta identifies a plant from a photo and builds a care plan. Its tracker covers watering, fertilizing, repotting, pruning and misting, and reminders adapt to the home environment, local weather and plant type. It also has a light meter, a plant journal, shared care with real-time task visibility, a symptom checker called Dr. Planta, and a community for tips and questions.

**Shortcomings:** the best features sit behind a Premium subscription (the store lists roughly USD 8 to 10 per month, USD 18 to 20 for three months, and USD 36 to 48 per year), and the listing does not make clear which features are free. Reviewers reported that existing plants could not have their fertilizer preference changed without deleting them, that watering schedules did not adapt to snoozes, and that the symptom checker only offered preset options.

**3.2 PictureThis: Plant Identifier \[2\]**  
PictureThis focuses on plant identification and gives care tips and details on plants. Users praise its accuracy and ease of use for beginners.

**Shortcomings:** reviewers report that basic features are locked behind paid access, hidden subscription fees, payment problems, difficulty deleting accounts, and instability in the paid version. One reviewer asked for Persian language support.

**3.3 Greg: Plant Identifier & Care \[3\]**  
Greg identifies plants and sends care reminders, which users value.

**Shortcomings:** reviewers report unexpected charges, essential features behind a paywall that makes the free version largely ineffective, inaccurate identification, no diagnosis function, a poor interface, and limited features.

**3.4 Gap and how GrowMate responds**

* **Cost barrier.** All three rely on paid subscriptions. GrowMate is a free academic project with no paywall.

* **Community answers.** The reviewed sources focus on identification and reminders. GrowMate adds a structured Q\&A feed in which the asker marks an accepted answer, so good solutions become searchable.

* **Editable records.** Plants can be edited at any time (FR-04), avoiding the delete-and-recreate problem reported for Planta.

* **Own moderation.** An admin panel lets administrators remove misleading or inappropriate posts.

* **Language.** The reviewed sources do not mention Bangla. Bangla support is planned as a later enhancement for local users.

4. **Features / Scopes**

Only features that the team can finish within the semester are listed. They follow the SRS dated 7 October 2026 (FR-01 to FR-10) and the modules below.

**In scope (deliverables)**

* **Authentication:** registration, login, logout and token-based sessions.  
* **Plant management (PlantCare):** add, list, view, edit and delete plants; search; categorize by plant type; validation before saving; only the owner can modify a plant.  
* **Care management:** watering and fertilizer schedules, reminders (push and local), mark a task done, care history, and a plant status (Healthy, Needs Attention, Overdue).  
* **Growth tracking:** dated photos, notes and a simple dashboard of today's tasks and plants needing attention.  
* **Knowledge Share:** create posts with photos and a category, comments and answers, likes, accepted answer, search and filter, and a report button.  
* **Admin panel (web):** manage users, plant types, care rules and tips, and review reported posts and comments.  
* **Documentation:** SRS, database design, API documentation, test report, final report and demonstration.

**Only if time remains**

* Shared plant care with caretaker permissions, vacation mode, follow and bookmark posts, dark mode, and Bangla language.

**Out of scope**

* iOS version, AI plant identification, weather integration, payments or marketplace, and multi-device cloud sync.

5. **Development Model** 

**Chosen model: Agile (Scrum-style iterative development),** with work tracked in Jira Software.

**Why Agile**

* **Working software early.** The plant management module is built and demonstrated in the first sprints, and each later module is added on top of it.  
* **Changing requirements.** Care, growth and community features are refined after supervisor and user feedback in each sprint review.  
* **Clear tracking.** Each requirement (FR-01 to FR-10 and later ones) becomes a Jira story with an owner, so progress and workload stay visible.  
* **Risk control.** The most important features are done first, so optional features can be dropped if time runs short.  
* **Small team fit.** Five members can split work by module and integrate through a shared GitHub repository.

**How it will run**

* A product backlog in Jira; sprints of about two weeks (final length agreed with the supervisor); sprint planning, a short weekly stand-up, a sprint review and a retrospective.  
* Git branches per feature with pull-request review before merging.

**Why not Waterfall:** the plan needs feedback from users and the supervisor during development, and a late-discovered problem would be expensive to fix after a full design-first approach.

**6\. Feasibility Analysis & Possible Risks**

**Technical feasibility**  
Feasible. Flutter, Laravel, MySQL, Laravel Sanctum and Firebase Cloud Messaging are free, widely documented and already known to the team, who work with Laravel and mobile or web front ends. Image upload, REST APIs, notifications and role-based access are standard features of this stack \[4\]\[5\]\[6\].

**Economic feasibility**  
Feasible. All development tools and frameworks are free or open source. The only costs are a test Android phone, a small server for the API, a domain name and printing, estimated at about BDT 27,170 including a 10% contingency (see Budget).

**Operational feasibility**  
Feasible. The app targets ordinary plant owners and uses simple screens (My Plants, Add Plant, Plant Details, Edit Plant, Search) with a short learning curve. Administrators use a web panel for moderation.

**Possible risks**

* **Scope too large for one semester.** Build Tier 1 first; add optional features only after the MVP passes testing.  
* **Missed deadlines or uneven workload.** Jira board reviewed every sprint; tasks assigned in pairs of at most two people.  
* **Reminders failing when the app is closed.** Combine FCM push with local notifications and test on real devices.  
* **Integration problems between app and API.** Agree on API contracts early and test endpoints with Postman before building screens.  
* **Spam or misleading community posts.** Authenticated posting only, a report button, and admin moderation.  
* **Unauthorized access to plant data.** Token authentication and owner checks on every endpoint; security testing.  
* **Inaccurate plant-care data.** Use reliable sources and admin-managed care rules and tips.  
* **Budget overrun or server downtime.** Use free tiers where possible, keep a 10% contingency, and take regular backups.

**7\. Requirements**

**Hardware**

* Five development laptops (minimum 8 GB RAM, SSD, modern multi-core processor).  
* One or more Android phones for testing, and the Android emulator on the laptops.  
* A web server or VPS for the Laravel API, MySQL and image storage.

**Software and tools**

* Flutter SDK and Android Studio; Visual Studio Code.  
* PHP, Composer and the Laravel framework; MySQL database; Laravel Sanctum.  
* Firebase Cloud Messaging for push notifications.  
* Git and GitHub; Jira Software; Postman; a design tool for mockups.

**Languages and technologies**

* Dart (Flutter), PHP (Laravel), SQL, HTML/CSS (admin panel), REST and JSON.

**Personnel**

* Five student developers (team leader, co-leader and three members), a course supervisor, and an optional plant-care subject expert for content review.

**Functional requirements (from the SRS)**

* FR-01 to FR-05: add, view list, view details, edit and delete plants.  
* FR-06 and FR-07: search plants and categorize them by type.  
* FR-08 to FR-10: store data in a database, validate before saving, and restrict modification to authorized users.  
* Care, growth and Knowledge Share requirements will be added as further FR items in the next SRS revision.

**Non-functional requirements**

* Performance, security and privacy, usability, reliability, maintainability, compatibility with common devices, and data integrity.

**8\. Activity and Time Schedule**  
Effort estimate for the in-scope features. Where two people share a task, the hours are split equally between them.

| \# | Stages/ Tasks | Efforts, man-hours |
| :---- | ----- | :---- |
| **Stage 1** | **Analysis and Design** |  |
| 1.1 | Requirements analysis and SRS | 20 |
| 1.2 | UI/UX mockup creation | 30 |
| 1.3 | Database and API design | 20 |
| 1.4 | Work plan creation and Jira setup | 6 |
| **Stage 2** | **Implementation** |  |
| 2.1 | Database creation and migrations | 30 |
| 2.2 | Authentication and user management | 30 |
| 2.3 | Plant management: API and screens (FR-01 to FR-10) | 60 |
| 2.4 | Care schedules, care history and plant status | 50 |
| 2.5 | Reminders and notifications (FCM and local) | 36 |
| 2.6 | Growth photo tracking and dashboard | 40 |
| 2.7 | Knowledge Share feed: posts, comments, likes, accepted answer, search | 70 |
| 2.8 | Reports, moderation and admin panel | 50  |
| **Stage 3** | **Testing and other QA tasks** |  |
| 3.1 | API and unit testing | 30 |
| 3.2 | Functional and UI testing, bug fixing | 50 |
| 3.3 | Security testing | 10 |
| **Stage 4** | **Deployment and documentation** |  |
| 4.1 | Deployment of API and admin panel on the server | 10 |
| 4.2 | Android APK build and device testing | 8 |
| 4.3 | Final report and presentation | 20 |
|  | **Total estimated efforts: 570 man-hours** |  |

**9\. Budget**	  
Estimated in Bangladeshi Taka (BDT) for a student project. Prices are approximate and will be confirmed before purchase. Team members' time is not charged.

| Project Item | Amount | Unit Price | Total |
| ----- | ----- | ----- | ----- |
| Software licenses (Flutter, Laravel, Android Studio, VS Code, Git, Jira and Figma free tiers) | 1 | 0 | 0 |
| Machine(s): team laptops (already owned) | 5 | 0 | 0 |
| Android test phone | 1 | 10,000 | 10,000 |
| Server license / VPS hosting (6 months) | 6 | 1,200 | 7,200 |
| Database license (MySQL Community, open source) | 1 | 0 | 0 |
| Domain name (1 year) | 1 | 1,500 | 1,500 |
| Development consultant (plant-care expert review, sessions) | 2 | 1,500 | 3,000 |
| Project management (Jira free plan) | 1 | 0 | 0 |
| Training (online courses and documentation, free) | 1 | 0 | 0 |
| Printing and documentation | 1 | 3,000 | 3,000 |
| Contingency (10%) | 1 | 2,470 | 2,470 |
| **Total estimated budget** |  |  | **27,170** |

**10\. Development Team & Stakeholders**  
Team structure. Each task has at most two responsible members, and the effort is shared evenly (about 110 to 118 man-hours each). Task numbers refer to the schedule above.

| Id | Name | Designation | Responsibilities |
| :---: | ----- | :---: | :---: |
| 20244203141 | Md Zehad Ali | Team Leader, Back-end Lead | Team management and coordination; Laravel API, authentication and database. Tasks 1.1, 1.3, 1.4, 2.1, 2.2, 2.8, 3.2, 4.1. |
| 20244203139 | Md. Abu Talha Sarker | Co-Leader, Mobile Lead | Backup management and sprint planning; Flutter app structure, plant screens and growth tracking. Tasks 1.1, 1.2, 1.4, 2.2, 2.3, 2.6, 3.3, 4.2, 4.3. |
| 20244203096 | Md.Sihab | Mobile Developer, Care and Notifications | UI/UX mockups, care schedules and reminders, FCM integration. Tasks 1.2, 2.3, 2.4, 2.5, 3.1, 3.3, 4.3. |
| 20244203110 | Krishno Das Ghosh | Community Developer | Knowledge Share feed, growth dashboard, notifications and testing. Tasks 2.5, 2.6, 2.7, 3.1, 3.2. |
| 20244203143 | Labonno Mondal | Database and Admin Developer, QA | Database design, admin panel, moderation and care data. Tasks 1.3, 2.1, 2.4, 2.7, 2.8. |

**Stakeholders and key users:**

| Id | Name | Designation | Responsibilities |
| :---: | :---: | :---: | :---: |
| S1 | Sumona Yeasmin | Project supervisor (Lecturer, Dept. of CSE, BUBT) | Reviews the proposal and progress; approves scope and grades the project. |
| S2 | Plant owners | End users | Manage plants and care tasks, post questions, give feedback. |
| S3 | Community members | End users | Answer questions, like and comment on posts. |
| S4 | Shared caretakers | Key users (optional feature) | Perform care tasks on plants shared with them. |
| S5 | \[Administrator\] | System administrator | Manage users, plant types, care tips and reported content. |
| S6 | \[Plant-care expert\] | Subject expert (external) | Reviews care rules and tips for accuracy. |

	  
**11\.  Limitations & Future Works**

**Limitations**

* Android only; there is no iOS version.  
* Reminders depend on device notification settings and battery optimization.  
* Plant-care rules are general guidance per plant type, not expert diagnosis; advice quality depends on the stored data and community answers.  
* Community content is moderated manually by administrators, so harmful posts may be visible until reported.  
* No plant identification or disease detection from images in this version.  
* Tough tasks: reliable background reminders on all Android versions, image upload handling, and keeping a large feed fast.

**Future work**

* AI plant identification and disease detection from photos.  
* Weather-based recommendations for outdoor plants.  
* Shared plant care, vacation mode, follow and bookmark features.  
* Bangla language support and dark mode.  
* Expert verification, contributor reputation and badges.  
* Growth charts and statistics, iOS version, and cloud backup with multi-device sync.

**12\. References**  
References are listed in MLA-style order of first use.  
*\[1\].	Planta AB (2026), "Planta: Plant & Garden Care", App Store listing. Retrieved 8 October 2026 from: https\://apps.apple.com/us/app/planta-plant-garden-care/id1410126781*

*\[2\].	Kimola (2026), "Mixed Reviews for PictureThis \- Plant Identifier: Hidden Fees and Helpful Features", Google Play feedback report. Retrieved 8 October 2026 from: https\://kimola.com/reports/insightful-user-feedback-report-on-picturethis-app-google-play-150977*

*\[3\].	Kimola (2026), "Mixed Reviews for Greg: Plant Identifier & Care App Highlight Key Issues", App Store feedback report. Retrieved 8 October 2026 from: https\://kimola.com/reports/unlock-key-insights-greg-app-customer-feedback-report-app-store-us-155864*

*\[4\].	Laravel (2026), "Laravel Sanctum" documentation. Retrieved 8 October 2026 from: https\://laravel.com/docs/sanctum*

*\[5\].	Google (2026), "Flutter documentation". Retrieved 8 October 2026 from: https\://docs.flutter.dev*

*\[6\].	Google (2026), "Firebase Cloud Messaging". Retrieved 8 October 2026 from: [https\://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)*

*\[7\].	Atlassian (2026), "Jira Software". Retrieved 8 October 2026 from: [https\://www\.atlassian.com/software/jira](https://www.atlassian.com/software/jira)*

*\[8\].	Ali, M. Z. (2026), "Software Requirements Specification (SRS): PlantCare", 7 October 2026, project document.*

[image1]: <data:image/png;base64,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>