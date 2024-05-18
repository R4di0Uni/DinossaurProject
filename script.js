// script.js

document.getElementById("forgot-password-link").onclick = function(event) {
    event.preventDefault();
    document.getElementById("forgot-password-modal").style.display = "block";
};

document.querySelector(".close").onclick = function() {
    document.getElementById("forgot-password-modal").style.display = "none";
};

window.onclick = function(event) {
    if (event.target == document.getElementById("forgot-password-modal")) {
        document.getElementById("forgot-password-modal").style.display = "none";
    }
};

document.getElementById("forgot-password-form").onsubmit = function(event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    fetch('/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    }).then(response => response.json())
      .then(data => {
          alert(data.message);
          document.getElementById("forgot-password-modal").style.display = "none";
      }).catch(error => {
          console.error('Error:', error);
      });
};
