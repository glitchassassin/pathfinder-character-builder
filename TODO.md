## Pathfinder Character Builder ##

The goal of this project is to have an app that will let anyone easily build a character concept for the Pathfinder RPG system.

### Requirements ###

**Platform requirements:**

* The Builder will be built with a Node.js back end and an HTML5/JS front end.
* The Builder will be built and tested with an iPhone 4, iPad 2, Macbook Pro 13", and Windows 8 desktop.

**Authentication requirements:**

* The Builder will use OAuth 2.0 for authentication.
* The Builder will save and maintain each person's characters separately.

**Functionality requirements:**

* The Builder will have a "wizard" to walk you through the process of creating a new character (at any level).
* The Builder will also have an "advanced mode" to let you edit or build a new character from scratch.
* The Builder will include all Paizo PFSRD material.
* The Builder will generate a dynamic online character sheet.

**Stretch goals/future features:**

* The Builder should eventually generate a printable character sheet.
* The Builder should eventually support building NPCs and monsters as well as characters.


### Stages ###

**Milestone I: Dynamically Loaded Character Sheet**
*Planned for February 28, 2015*

1. **Design Mockup** - Using sample data, the default Paizo character sheet will be re-created with HTML5/CSS (no special mobile version).
2. **Angular Integration** - The static design will be converted into an Angular template, with data loaded from a model (still created statically).
3. **Angular Tests** - Karma/Mocha/etc. will be used to build tests for basic controller function and data structure compliance.
4. **Data Structures** - Based on notes from the Design Mockup & Angular Integration, data structures will be modeled for database storage and recall.
5. **Server-side Tests** - Karma/Mocha/etc. will be used to build tests for the server-side API.
6. **Server-side Integration** - The server's "read" API will be designed and implemented via AJAX.


**Milestone II: User Management**

1. **Login Mockup** - Static HTML5/CSS pages will be created for the login page and character sheet pages (responsive for mobile).
2. **OAuth Setup** - Sign-in with OAuth 2.0 will be implemented for Google, Facebook, and Twitter (if applicable). Unit tests will be built for this module (if applicable).
3. **Database Integration** - Data structures from MI.4 above will be modified if necessary to associate character sheets/custom fields with users.


**Milestone III: Importing Data**

1. **Collecting Data** - All relevant PFSRD information (rules, feats, skills, etc.) will be collated into local files.
2. **Converting Data** - Local files will be converted into structures defined in MI.4 and merged into the database.


**Milestone IV: Editing**

1. **Editor Mockup** - Static templates for editing sections of the character sheet will be created and connected to the dynamic character sheet (responsive for mobile).
2. **Angular Integration** - Editor templates will be converted into Angular templates and will interface with models dynamically. (Tests included.)
4. **Server-side Integration** - The server's "write" API will be designed and implemented via AJAX. (Tests included.)


**Milestone V: Wizard**

1. **Wizard Mockup** - Static templates will be designed afresh for the character creation wizard (responsive for mobile).
2. **Angular & SSI** - Templates will be coded as above, reusing APIs where applicable.


