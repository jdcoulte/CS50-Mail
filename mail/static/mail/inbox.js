document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email);

  // Event listener for send email button
  document.querySelector('#compose-form').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

// Not sure if this is working yet. Need to come back to it.
function send_email() {
  console.log("Sent!");
  let recipientsvalue = document.querySelector('#compose-recipients').value;
  let subjectvalue = document.querySelector('#compose-subject').value;
  let bodyvalue = document.querySelector('#compose-body').value;

  console.log(recipientsvalue);
  console.log(subjectvalue);
  console.log(bodyvalue);

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipientsvalue,
        subject: subjectvalue,
        body: bodyvalue
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      if(!result['error']) {
        load_mailbox('sent');
      }
      else {
        document.querySelector('#compose-view').firstChild.appendChild(p).innerHTML = `${result['error']}`;
      }
  });
};