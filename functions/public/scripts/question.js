'use strict';

// Initializes PastPaperHub.
function PastPaperHub() {
  this.messageList = document.getElementById('messages');
  this.question = document.getElementById("question");
  this.facebookDiv = document.getElementById("facebook-div");
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PastPaperHub.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.messaging = firebase.messaging();

  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.authStateObserver.bind(this));
};

// Signs-out of Friendly Chat.
PastPaperHub.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Returns the signed-in user's profile Pic URL.
PastPaperHub.prototype.getProfilePicUrl = function() {
  return this.auth.currentUser.photoURL || 'images/profile_placeholder.png'; //todo check why this doesnt work
}

// Returns the signed-in user's display name.
PastPaperHub.prototype.getUserName = function() {
  return this.auth.currentUser.displayName;
}

// Returns true if a user is signed-in.
PastPaperHub.prototype.isUserSignedIn = function() {
  return !!this.auth.currentUser;
}

const questionClickedDbRef = localStorage.getItem("questionClickedDbRef");
PastPaperHub.prototype.loadQuestion = function () {
  var self = this;
  return new Promise((resolve, reject) => {
    firebase.database().ref(questionClickedDbRef).once('value').then(function (snapshot) {
      if(snapshot){
        //set question text
        console.log("quesion text--: "+ snapshot.val().text);
        self.question.textContent = snapshot.val().text;
        //set url for use in facebook div
        //load facebook div
        // {{!-- <div class="fb-comments" data-href="https://www.pastpaperhub.com/question1" data-numposts="5"></div> --}}
        // self.facebookDiv.classList.add('fb-comments');
        // self.facebookDiv.setAttribute('data-href', 'https://www.pastpaperhub.com/question1');
        // self.facebookDiv.setAttribute("hidden", false);

        // self.facebookDiv.setAttribute("data-numposts", "5");

        // self.facebookDiv.innerHTML="<fb:comments data-href='https://www.pastpaperhub.com/question1' data-numposts='5'></fb:comments>"
        // FB.XFBML.parse(self.facebookDiv);

        resolve();
        return snapshot;
      }
      else{
        throw new Error("error fetching question" );
      }
    }).catch(function (error) {
      var errorMessage = error.message;
      console.log("error fetching question:" + errorMessage);
    });
  });
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PastPaperHub.prototype.authStateObserver = function(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = this.getProfilePicUrl();
    var userName = this.getUserName();

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');

  } else { // User is signed out!
    window.location.href = "/login";
  }

  // Load existing past papers.
  this.loadQuestion();
};

// Returns true if user is signed-in. Otherwise false and displays a message.
PastPaperHub.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Resets the given MaterialTextField.
PastPaperHub.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// A loading image URL.
PastPaperHub.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Enables or disables the submit button depending on the values of the input
// fields.
PastPaperHub.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

window.addEventListener('load' , function() {
  window.PastPaperHub = new PastPaperHub();
});
