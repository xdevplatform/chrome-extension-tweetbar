TwitterDev Tweetbar Extension v0.1
=====

Chrome extension to view tweets while browsing YouTube. 

This tool is made open source by the @TwitterDev team as a reference for how to integrate Twitter + Chrome browser for a unique user experience. 

Installation
--------

To install this Chrome Extension, follow the below instructions.

##### Step 1: Open Chrome and go to the Extensions Page.

To open settings, either use the tool bar under 'Chrome->Preferences', or click on the settings button to the far right of the browser location. After you're in Settings, click on the 'Extensions' link to the left.

<img src="img/screen/install_step1.png" style="width: 70%;"/>

##### Step 2: Drag and drop the pubtools.crx file into the Extensions Page.

You will see a drop target appear that says "Drop to install". 

<img src="img/screen/install_step3a.png" style="width: 70%;"/>

After you drop, click on the "Add" button in the prompt.

<img src="img/screen/install_step3b.png" style="width: 70%;"/>

After installation, a browser window will also pop-up with the extension's settings page. If it does not, follow Step 3 below to open the extension's settings window manually.

##### Step 3: Find "TwitterDev Collections Extension v0.0.2" in the Extensions list and click  "Options".

This will take you to the Extension's own settings page. (Different from your browser's settings.)

<img src="img/screen/install_step4.png" style="width: 70%;"/>

##### Step 4: Click on the "Login via Twitter" button.

This begins the Twitter authentication process.

##### Step 5: In the new window, click on the "Authorize app" button.

A new window will open and prompt you to Authorize (and link) your Twitter account.

<img src="img/screen/install_step6.png" style="width: 70%;"/>

##### Step 6: Copy the PIN you see.

This pin confirms your identity with the application

<img src="img/screen/install_step7.png" style="width: 70%;"/>

##### Step 7: Go to the original tab and submit the PIN.

This completes the authentication process.

<img src="img/screen/install_step8.png" style="width: 70%;"/>

You will see a confirmation message when complete.

<img src="img/screen/install_step9.png" style="width: 70%;"/>

If you experience an error, please try the login process again. If you continue to have problems, please contact the below support e-mail below.


Dependencies
--------

The following libraries are used in this extension. All libraries are included
under the js/lib directory to make this source self-contained. 

- Async: https://github.com/caolan/async
- Codebird: https://github.com/jublonet/codebird-js

Support
--------

This library is open source, and as such carries no warranties or commercial support. For 
bugs and other issues, please contact rchoi@twitter.com.

License
--------

Please read the LICENSE file in the root path.



