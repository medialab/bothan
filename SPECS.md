Bothan Specifications
=====================

Core concepts
-------------

* **Phantom**: A phantomjs child process.
* **Spynet**: A spynet server is a socket server used to communicate between one or several phantoms.
* **Spy**: A bothan instance having only one phantom and creating a spynet if one is not provided for him.

Features
--------

*API*

* Should be able to start a process with any needed phantom argument (camelcase to hyphen)
* Should be able to pass a json configuration to the phantom child
* Should be able to command file injection finely (before and after execution of Page's own js)
* Should be able to answer messages from the page itself
* Should be able to bootstrap the messages received by phantomjs to execute things on a formal js file with a definition
* Should be able to set the spynet port finely of course

*Events*

* Possibility to subscribe to lifecycle events (they should be lazy and the phantomjs should be asked to set them up so we do not saturate socket communication).
* Events would be of:
    * phantom:log (data)
    * phantom:error (data)
    * phantom:disconnect (error: alias)
    * page:log (pageInfo, data)
    * page:error (pageInfo, data)
    * page:message (pageInfo, data)

* Should bootstrap errors as default for some cases

Decisions
---------

Drop the metaphors?

Notes
-----

* Colback's messenger should be of help.
* Phantomjs child processes should be terminated automatically when a script exits.
* Phantomjs main context is perfectly able to handle websockets without having to set stupid webpages to deal with it.
