js-WebConsole is a front end framework for building command line based user interfaces for websites.

*Why would anybody want a cli for a website?!* 

Good Question... 

While learning javascript I was looking for a project to work on and this seemed like a fun idea. I also liked the challenge of building it in a way that users without experience with clis are able to navigate it.

[Try it here!](/js-webconsole/EXAMPLE.html)

## How it works

js-WebConsole is designed to be used as a single-page application. The users interact with it by either writing commands to the console or by pressing buttons which write the commands for them. The framework provides some basic commands for help, setting colors/fontsize, run a console app, process an image to ascii, ...

More commands can easily be integrated by writing them in their own .js file, calling the public method *registerCommand()* from the commands module and importing your file in your main script. See @ */EXAMPLE-main.js* */plugins/img.js* .

Similarly console apps can be integrated by calling *registerApp()*.

To add the console to a website just load the *EXAMPLE-main.js* (or your own main.js) into your html.
